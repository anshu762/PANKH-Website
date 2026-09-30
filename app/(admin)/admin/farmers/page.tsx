import { adminService } from "@/services/admin.service";
import { FarmersDirectoryView } from "@/components/admin/farmers/farmers-directory-view";

export default async function AdminFarmersPage() {
  const farmers = await adminService.getFarmersList();

  return <FarmersDirectoryView initialFarmers={farmers} />;
}
