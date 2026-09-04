import { ProgramManager } from "@/features/programs/components/program-manager";
import { listProgramPosterMedia } from "@/features/programs/media";
import { getAllPrograms } from "@/features/programs/queries";

export default async function AdminProgramsPage() {
  const [programs, media] = await Promise.all([
    getAllPrograms(),
    listProgramPosterMedia(),
  ]);
  return <ProgramManager programs={programs} media={media} />;
}
