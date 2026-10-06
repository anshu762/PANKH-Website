"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CaseWithRelations, VetLabDistanceResult } from "@/types/connect";
import { CaseStatus } from "@prisma/client";
import { useLanguage } from "@/hooks/use-language";
import { CaseTrackerStepper } from "./case-tracker-stepper";
import { VetList } from "./vet-list";
import { ConsentModal } from "./consent-modal";
import { NewCaseModal } from "./new-case-modal";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { sendCaseSummaryAction, createFarmerCaseAction } from "@/actions/connect";
import Link from "next/link";

interface ConnectViewProps {
  initialContext: {
    farmer: {
      id: string;
      name: string;
      village: string;
      district: string;
      state: string;
    };
    farm: {
      id: string;
      name: string;
      latitude: number | null;
      longitude: number | null;
    };
    batch: {
      id: string;
      name: string;
      breed: string;
      currentBirds: number;
      startingBirds: number;
      productionType: string;
      placementDate: string;
    } | null;
  };
  initialCases: CaseWithRelations[];
  initialVets: VetLabDistanceResult[];
}

export function ConnectView({
  initialContext,
  initialCases,
  initialVets,
}: ConnectViewProps) {
  const { t: dict } = useLanguage();
  const t = dict.connect;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cases, setCases] = useState<CaseWithRelations[]>(initialCases);
  const [selectedVetForConsent, setSelectedVetForConsent] =
    useState<VetLabDistanceResult | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Check URL query parameters for Sentinel escalation (?caseId=...&alertId=...&escalate=true)
  const urlCaseId = searchParams.get("caseId");
  const isEscalation = searchParams.get("escalate") === "true";

  useEffect(() => {
    if (urlCaseId) {
      setActiveCaseId(urlCaseId);
    } else {
      // Pick first non-resolved case or latest case
      const openCase = cases.find((c) => c.status !== CaseStatus.RESOLVED);
      if (openCase) {
        setActiveCaseId(openCase.id);
      } else if (cases.length > 0) {
        setActiveCaseId(cases[0].id);
      }
    }
  }, [urlCaseId, cases]);

  const currentActiveCase = cases.find((c) => c.id === activeCaseId) || cases[0] || null;

  const handleOpenConsent = async (vet: VetLabDistanceResult) => {
    setSelectedVetForConsent(vet);
    if (currentActiveCase) {
      setIsConsentModalOpen(true);
    } else if (initialContext.batch) {
      // Auto-create initial flock review case so farmer can immediately share telemetry
      try {
        const created = await createFarmerCaseAction({
          batchId: initialContext.batch.id,
          symptomsDescription: "Flock health review and clinical telemetry consultation.",
          selectedSymptoms: ["Flock Health Consultation"],
        });
        if (created.success && created.caseRecord) {
          const newCase = created.caseRecord as CaseWithRelations;
          setCases((prev) => [newCase, ...prev]);
          setActiveCaseId(newCase.id);
          setIsConsentModalOpen(true);
        } else {
          setIsNewCaseModalOpen(true);
        }
      } catch {
        setIsNewCaseModalOpen(true);
      }
    } else {
      setIsNewCaseModalOpen(true);
    }
  };

  const handleConfirmDispatch = async (preferredChannel: "WHATSAPP" | "SMS") => {
    let targetCase = currentActiveCase || cases[0] || null;
    if (!targetCase && initialContext.batch) {
      const created = await createFarmerCaseAction({
        batchId: initialContext.batch.id,
        symptomsDescription: "Flock health review and clinical telemetry consultation.",
        selectedSymptoms: ["Flock Health Consultation"],
      });
      if (created.success && created.caseRecord) {
        targetCase = created.caseRecord as CaseWithRelations;
        setCases((prev) => [targetCase!, ...prev]);
        setActiveCaseId(targetCase.id);
      }
    }

    if (!targetCase || !selectedVetForConsent) {
      alert("Please create a flock case first.");
      return null;
    }

    const res = await sendCaseSummaryAction({
      caseId: targetCase.id,
      vetLabId: selectedVetForConsent.id,
      consentGiven: true,
      preferredChannel,
    });

    if (res.success && res.caseRecord) {
      // Update local cases state
      setCases((prev) =>
        prev.map((c) => (c.id === res.caseRecord!.id ? (res.caseRecord as CaseWithRelations) : c))
      );
      setSuccessBanner(
        `Case summary dispatched to ${selectedVetForConsent.name} via ${preferredChannel}. Status updated to Contacted.`
      );
      setTimeout(() => setSuccessBanner(null), 8000);
      return res.result;
    } else {
      alert(res.error || "Failed to dispatch case summary.");
      return null;
    }
  };

  const handleCaseCreated = (newCase: CaseWithRelations) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-1 rounded-full uppercase tracking-wider border border-orange-200 dark:border-orange-800">
              Module 3: Pankh Connect
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mt-2">
            {t.title}
          </h1>
          <p className="text-sm text-stone-700 dark:text-stone-300 mt-1 max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        <div>
          <Button
            onClick={() => setIsNewCaseModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2 shadow-sm min-h-[46px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.needExpertHelp}</span>
          </Button>
        </div>
      </div>

      {/* Sentinel Urgent Outbreak Escalation Banner */}
      {isEscalation && (
        <div className="bg-red-50 dark:bg-red-950/60 border-2 border-red-500 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-red-950 dark:text-red-200">
              Sentinel RED Alert: Urgent Veterinary Escalation Active
            </h4>
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-300">
              Flock indicators triggered emergency surveillance protocols. Select a verified
              veterinarian or GADVASU specialist below to transmit the 7-day trend summary via WhatsApp.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium">
            {successBanner}
          </p>
        </div>
      )}

      {/* Active Case Tracker Section */}
      <div className="space-y-3">
        {currentActiveCase ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Current Active Escalation
              </span>
              <Link
                href={`/dashboard/connect/${currentActiveCase.id}`}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Case Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <CaseTrackerStepper
              currentStatus={currentActiveCase.status}
              createdAt={currentActiveCase.createdAt}
              assignedVetName={currentActiveCase.assignedVetLab?.name}
            />

            {/* If multiple cases exist, provide selector pills */}
            {cases.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-xs text-stone-600 dark:text-stone-400 shrink-0">Other Cases:</span>
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCaseId(c.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors shrink-0 ${
                      c.id === currentActiveCase.id
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-bold"
                        : "bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-stone-400"
                    }`}
                  >
                    Case #{c.id.slice(-6).toUpperCase()} ({c.status})
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 text-center shadow-sm">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t.noOpenCases}
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto">
              If your flock begins showing respiratory distress, abnormal droppings, or sudden mortality,
              click "Need Expert Help" to dispatch a verified case summary.
            </p>
          </div>
        )}
      </div>

      {/* Directory Section */}
      <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
            {t.nearbyDirectoryTitle}
          </h2>
          <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5">
            {t.nearbyDirectorySubtitle}
          </p>
        </div>

        <VetList
          vets={initialVets}
          onShareCase={handleOpenConsent}
          canShare={true}
        />
      </div>

      {/* Consent Modal (Hard Section 11 Requirement) */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        selectedVet={selectedVetForConsent}
        farmerLocation={`${initialContext.farmer.village}, ${initialContext.farmer.district}`}
        batchName={initialContext.batch?.name}
      />

      {/* Farmer New Case Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        batches={
          initialContext.batch
            ? [
                {
                  id: initialContext.batch.id,
                  name: initialContext.batch.name,
                  breed: initialContext.batch.breed,
                  currentBirds: initialContext.batch.currentBirds,
                },
              ]
            : []
        }
        defaultBatchId={initialContext.batch?.id}
        onCaseCreated={handleCaseCreated}
      />
    </div>
  );
}
