import { z } from "zod";

import {
  boolFromForm,
  optionalDateTime,
  optionalHttpUrl,
  optionalText,
  requiredText,
  sortOrderFromForm,
} from "@/lib/cms/validation";

export const announcementFormSchema = z
  .object({
    message: requiredText(300),
    link_url: optionalHttpUrl,
    link_label: optionalText(80),
    is_active: boolFromForm,
    starts_at: optionalDateTime,
    expires_at: optionalDateTime,
    sort_order: sortOrderFromForm,
  })
  .refine(
    (values) =>
      !values.starts_at || !values.expires_at || values.expires_at >= values.starts_at,
    {
      message: "Expiry must be on or after the start time.",
      path: ["expires_at"],
    },
  );

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;
