import { z } from "zod";

import {
  boolFromForm,
  optionalExternalImageUrl,
  optionalHttpUrl,
  optionalText,
  requiredText,
  sortOrderFromForm,
} from "@/lib/cms/validation";

/** How the banner image is provided: uploaded to Storage, or an external CDN URL. */
export const bannerImageSourceSchema = z.enum(["storage", "external"]).catch("storage");

/**
 * Text fields of the banner form (the image file is validated separately).
 * image_source selects how the image is provided; external_url is only valid
 * (and only used) when the source is "external" — enforced in the server
 * action, since the DB itself requires a URL for external rows.
 */
export const bannerFormSchema = z.object({
  title: optionalText(200),
  image_alt: requiredText(300),
  link_url: optionalHttpUrl,
  sort_order: sortOrderFromForm,
  is_active: boolFromForm,
  image_source: bannerImageSourceSchema,
  external_url: optionalExternalImageUrl,
});

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
