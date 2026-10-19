import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInThisContext } from "node:vm";

import ts from "typescript";

const require = createRequire(import.meta.url);

// Load the real validation/action code with service boundaries replaced below.
// No Supabase credentials, network calls, or production writes are used.
function loadTs(path, dependencies = {}) {
  const filename = new URL(path, import.meta.url);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const loadedModule = { exports: {} };
  const localRequire = (name) =>
    Object.hasOwn(dependencies, name) ? dependencies[name] : require(name);
  runInThisContext(`(function(require, module, exports) {${outputText}\n})`, {
    filename: filename.pathname,
  })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const validation = loadTs("../src/lib/cms/validation.ts");
const recurrence = loadTs("../src/features/programs/recurrence.ts");
const schema = loadTs("../src/features/programs/schema.ts", {
  "@/lib/cms/validation": validation,
  "./recurrence": recurrence,
});

function actionHarness(existing = []) {
  const batches = [];
  const uploads = [];
  const revalidations = [];
  const client = {
    auth: { getUser: async () => ({ data: { user: { id: "admin" } } }) },
    from(table) {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: { role: "admin" } }) }),
          }),
        };
      }
      assert.equal(table, "programs");
      return {
        select: () => ({ in: async () => ({ data: existing, error: null }) }),
        insert(rows) {
          batches.push(rows);
          return {
            select: async () => ({
              data: rows.map((_, i) => ({ id: String(i) })),
              error: null,
            }),
          };
        },
      };
    },
  };
  const actions = loadTs("../src/features/programs/actions.ts", {
    "@/features/auth/guard": { requireAdmin: async () => {} },
    "next/cache": {
      revalidatePath: (path) => revalidations.push(path),
      revalidateTag: (tag) => revalidations.push(tag),
    },
    "@/lib/cms/activity": { logAdminActivity: async () => {} },
    "@/lib/cms/diagnostics": {
      newProgramCorrelationId: () => "PRG-TEST",
      logAdminDiagnostic: async () => {},
      safeDiagnosticMessage: (error) => String(error),
    },
    "@/lib/cms/logging": { logCmsError: () => {} },
    "@/lib/media/storage": {
      CMS_BUCKETS: { programs: "programs" },
      uploadImage: async (bucket, file) => {
        uploads.push({ bucket, file });
        return { ok: true, path: "shared-poster.webp" };
      },
      deleteImage: async () => {},
    },
    "@/lib/supabase/server": { createSupabaseServerClient: async () => client },
    "./media": {},
    "./queries": {},
    "./recurrence": recurrence,
    "./schema": schema,
  });
  return { createProgram: actions.createProgram, batches, uploads, revalidations };
}

function dailyForm(overrides = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    title: "Daily Majlis",
    description: "Same program each day",
    start_date: "2026-10-22",
    end_date: "",
    start_time: "19:00",
    end_time: "20:00",
    location: "MASOM",
    link_url: "",
    is_published: "true",
    sort_order: "0",
    repeat_enabled: "true",
    recurrence_frequency: "daily",
    recurrence_last_date: "2026-10-24",
    ...overrides,
  }))
    form.set(key, value);
  return form;
}

test("daily action creates an atomic batch with one shared poster and group", async () => {
  const harness = actionHarness();
  const form = dailyForm();
  form.set("poster", new File(["poster"], "poster.webp", { type: "image/webp" }));
  const result = await harness.createProgram(validation.idleResult, form);
  assert.equal(result.status, "success");
  assert.equal(harness.batches.length, 1);
  const rows = harness.batches[0];
  assert.deepEqual(
    rows.map((row) => row.start_date),
    ["2026-10-22", "2026-10-23", "2026-10-24"],
  );
  assert.equal(harness.uploads.length, 1);
  assert.equal(new Set(rows.map((row) => row.recurrence_group_id)).size, 1);
  assert.ok(rows[0].recurrence_group_id);
  for (const row of rows) {
    assert.equal(row.poster_path, "shared-poster.webp");
    assert.equal(row.start_time, "19:00");
    assert.equal(row.end_time, "20:00");
    assert.equal(row.end_date, null);
    assert.equal(row.is_published, true);
  }
  assert.ok(harness.revalidations.includes("/admin/programs"));
});

test("daily action skips an existing first day and handles an already-created batch", async () => {
  const existing = ["2026-10-22", "2026-10-23", "2026-10-24"].map((start_date) => ({
    title: "daily  majlis",
    start_date,
    start_time: "19:00:00",
  }));
  const partial = actionHarness(existing.slice(0, 1));
  const result = await partial.createProgram(validation.idleResult, dailyForm());
  assert.equal(result.status, "success");
  assert.match(result.message, /2 programs created.*1 existing/);
  assert.deepEqual(
    partial.batches[0].map((row) => row.start_date),
    ["2026-10-23", "2026-10-24"],
  );
  const complete = actionHarness(existing);
  assert.equal(
    (await complete.createProgram(validation.idleResult, dailyForm())).status,
    "success",
  );
  assert.equal(complete.batches.length, 0);
  assert.equal(complete.uploads.length, 0);
});

test("daily action rejects missing, reversed, impossible and excessive ranges before writing", async () => {
  for (const recurrence_last_date of ["", "2026-10-21", "2026-02-30", "9999-12-31"]) {
    const harness = actionHarness();
    const result = await harness.createProgram(
      validation.idleResult,
      dailyForm({ recurrence_last_date }),
    );
    assert.equal(result.status, "error");
    assert.equal(harness.batches.length, 0);
    assert.equal(harness.uploads.length, 0);
  }
});

test("weekly submissions without the new frequency field keep their previous behavior", async () => {
  const harness = actionHarness();
  const form = dailyForm({ recurrence_month: "2026-10" });
  form.delete("recurrence_frequency");
  form.delete("recurrence_last_date");
  assert.equal(
    (await harness.createProgram(validation.idleResult, form)).status,
    "success",
  );
  assert.deepEqual(
    harness.batches[0].map((row) => row.start_date),
    ["2026-10-01", "2026-10-08", "2026-10-15", "2026-10-22", "2026-10-29"],
  );
});

test("disabling repeats creates one ordinary program without a recurrence group", async () => {
  const harness = actionHarness();
  assert.equal(
    (
      await harness.createProgram(
        validation.idleResult,
        dailyForm({
          repeat_enabled: "false",
          recurrence_last_date: "",
        }),
      )
    ).status,
    "success",
  );
  assert.equal(harness.batches[0].length, 1);
  assert.equal(harness.batches[0][0].start_date, "2026-10-22");
  assert.equal(harness.batches[0][0].recurrence_group_id, undefined);
});
