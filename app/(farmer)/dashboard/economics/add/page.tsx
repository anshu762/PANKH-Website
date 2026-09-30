import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { economicsService } from "@/services/economics.service";
import { TransactionAddForm } from "@/components/dashboard/economics/transaction-add-form";

interface TransactionAddPageProps {
  searchParams?: {
    batchId?: string;
  };
}

export default async function TransactionAddPage({
  searchParams,
}: TransactionAddPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/economics/add");
  }

  const batches = await economicsService.getFarmerBatches(session.user.id);

  if (batches.length === 0) {
    redirect("/dashboard/economics");
  }

  return (
    <TransactionAddForm
      batches={batches}
      preselectedBatchId={searchParams?.batchId || null}
    />
  );
}
