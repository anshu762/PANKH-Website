import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getConnectInitialData } from "@/actions/connect";
import { ConnectView } from "@/components/connect/connect-view";

export const metadata: Metadata = {
  title: "Pankh Connect — Vet & Diagnostic Lab Network",
  description: "Direct veterinary escalation and verified diagnostic lab network across Punjab",
};

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  const result = await getConnectInitialData();

  if (result.error === "Unauthorized") {
    redirect("/login");
  }

  if (result.needsOnboarding) {
    redirect("/onboarding");
  }

  if (!result.success || !result.context) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Unable to Load Pankh Connect
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
          {result.error || "Please verify your active farm profile and try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <ConnectView
        initialContext={result.context}
        initialCases={result.cases || []}
        initialVets={result.nearbyVets || []}
      />
    </div>
  );
}
