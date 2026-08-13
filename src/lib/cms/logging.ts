import "server-only";

/**
 * Logs a CMS data-access failure to the server console without leaking secrets
 * or swallowing it silently. Never called on the client. Supabase/PostgREST
 * errors are plain objects (not Error instances), so their `message` is read
 * directly to keep the log useful.
 */
export function logCmsError(scope: string, error: unknown): void {
  let message = "Unknown error";
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    message = (error as { message: string }).message;
  }
  console.error(`[cms:${scope}] ${message}`);
}
