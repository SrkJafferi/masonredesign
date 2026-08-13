import { z } from "zod";

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
