"use server";

import { redirect } from "next/navigation";

import { loginSchema } from "@/features/auth/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

/** Only allow redirects back into the admin area (prevents open redirects). */
function safeRedirectTo(value: FormDataEntryValue | null): string {
  const target = typeof value === "string" ? value : "";
  if (target.startsWith("/admin") && !target.startsWith("//")) {
    return target;
  }
  return "/admin";
}

export async function signInAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Keep the message generic — do not reveal whether the email exists.
    return { error: "Incorrect email or password." };
  }

  redirect(safeRedirectTo(formData.get("redirectTo")));
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
