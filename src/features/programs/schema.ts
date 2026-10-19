import { z } from "zod";

import { dateDurationDays, MAX_DAILY_OCCURRENCES } from "./recurrence";

import {
  boolFromForm,
  optionalDate,
  optionalHttpUrl,
  optionalText,
  optionalTime,
  requiredDate,
  requiredText,
  sortOrderFromForm,
} from "@/lib/cms/validation";

/** Text/date fields of the program form (the poster file is validated separately). */
export const programFormSchema = z
  .object({
    title: requiredText(200),
    description: optionalText(4000),
    start_date: requiredDate,
    end_date: optionalDate,
    start_time: optionalTime,
    end_time: optionalTime,
    location: optionalText(300),
    link_url: optionalHttpUrl,
    is_published: boolFromForm,
    sort_order: sortOrderFromForm,
  })
  .refine((values) => !values.end_date || values.end_date >= values.start_date, {
    message: "End date cannot be before the start date.",
    path: ["end_date"],
  });

export type ProgramFormValues = z.infer<typeof programFormSchema>;

/** Weekly repeats use a calendar month; daily repeats use an inclusive range. */
export const programRecurrenceSchema = z
  .object({
    enabled: boolFromForm,
    frequency: z.enum(["weekly", "daily"]).default("weekly"),
    month: z.string().trim().default(""),
    start_date: z.string().trim().default(""),
    last_date: z.string().trim().default(""),
  })
  .superRefine((values, context) => {
    if (!values.enabled) return;
    if (values.frequency === "daily") {
      const duration = dateDurationDays(values.start_date, values.last_date);
      if (duration === null || duration < 0 || duration >= MAX_DAILY_OCCURRENCES) {
        context.addIssue({
          code: "custom",
          path: ["last_date"],
          message:
            duration === null
              ? "Choose valid start and last repeat dates."
              : duration < 0
                ? "Last repeat date cannot be before the start date."
                : `Daily repeats can include at most ${MAX_DAILY_OCCURRENCES} dates.`,
        });
      }
    } else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.month)) {
      context.addIssue({
        code: "custom",
        path: ["month"],
        message: "Choose a valid month for the weekly repeats.",
      });
    }
  });

export type ProgramRecurrenceValues = z.infer<typeof programRecurrenceSchema>;
