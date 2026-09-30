import { adminService } from "@/services/admin.service";
import { VetLabDirectoryView } from "@/components/admin/vetlab/vetlab-directory-view";

export default async function AdminVetLabPage() {
  const records = await adminService.getVetLabDirectory();

  return <VetLabDirectoryView initialRecords={records} />;
}
