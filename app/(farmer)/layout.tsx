import { auth } from "@/auth";
import { FarmerShell } from "@/components/navigation/farmer-shell";

export default async function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return <FarmerShell session={session}>{children}</FarmerShell>;
}
