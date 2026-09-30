import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-stone-100/60 font-sans antialiased text-stone-900">
      <AdminSidebar
        userRole={role}
        userEmail={session.user.email || "admin@pankh.app"}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          userRole={role}
          userEmail={session.user.email || "admin@pankh.app"}
        />
        <main className="flex-1 p-5 sm:p-7 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
