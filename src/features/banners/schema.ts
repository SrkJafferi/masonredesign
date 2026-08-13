import { z } from "zod";

import {
  boolFromForm,
  optionalHttpUrl,
  optionalText,
  requiredText,
  sortOrderFromForm,
} from "@/lib/cms/validation";

/** Text fields of the banner form (the image file is validated separately). */
export const bannerFormSchema = z.object({
  title: optionalText(200),
  image_alt: requiredText(300),
  link_url: optionalHttpUrl,
  sort_order: sortOrderFromForm,
  is_active: boolFromForm,
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
