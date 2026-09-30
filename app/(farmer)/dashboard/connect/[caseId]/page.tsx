import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCaseDetailAction } from "@/actions/connect";
import { CaseDetailView } from "@/components/connect/case-detail-view";

interface CaseDetailPageProps {
  params: {
    caseId: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CaseDetailPageProps): Promise<Metadata> {
  return {
    title: `Case #${params.caseId.slice(-6).toUpperCase()} — Pankh Connect`,
    description: "Veterinary escalation and diagnostic tracking",
  };
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const result = await getCaseDetailAction(params.caseId);

  if (result.error === "Unauthorized") {
    redirect("/login");
  }

  if (!result.success || !result.caseRecord || !result.summaryPayload) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <CaseDetailView
        caseRecord={result.caseRecord}
        summaryPayload={result.summaryPayload}
        nearbyVets={result.nearbyVets || []}
      />
    </div>
  );
}
