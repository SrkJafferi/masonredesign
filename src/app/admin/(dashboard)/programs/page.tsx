import { getAuthContext } from "@/features/auth/session";
import {
  chicagoMonthValue,
  parseAdminProgramFilters,
} from "@/features/programs/admin-list";
import { ProgramManager } from "@/features/programs/components/program-manager";
import { getAdminProgramPage } from "@/features/programs/queries";

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, auth] = await Promise.all([searchParams, getAuthContext()]);
  // The dashboard layout owns redirects. Do not query while an unauthorized
  // child page is being evaluated in parallel with that layout.
  if (!auth.isAdmin) return null;
  const now = Date.now();
  const currentMonth = chicagoMonthValue(now);
  const filters = parseAdminProgramFilters(params, currentMonth);
  const listing = await getAdminProgramPage(filters, now);
  return (
    <ProgramManager
      listing={listing}
      filters={{ ...filters, page: listing.page }}
      currentMonth={currentMonth}
      openCreate={params.create === "1"}
    />
  );
}
