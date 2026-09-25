import Link from "next/link";
import { Stethoscope, ArrowLeft, Users } from "lucide-react";

export default function ConnectPlaceholderPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in fade-in duration-200">
      <div className="h-16 w-16 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center mx-auto text-orange-800 shadow-sm">
        <Stethoscope className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 text-orange-950 font-bold">
          Phase 5 Module
        </span>
        <h1 className="font-serif text-3xl font-bold text-pankh-clay">
          Pankh Connect
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Geo-located verified veterinarians, diagnostic labs, teleconsultation, and automated escalation via WhatsApp and SMS. Built in Phase 5.
        </p>
      </div>

      <div className="pt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pankh-clay hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
