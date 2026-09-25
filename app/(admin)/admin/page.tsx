import { auth } from "@/auth";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export default async function AdminDashboardPage() {
  const session = await auth();

  return <AdminDashboardView session={session} />;
}
