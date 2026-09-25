import Link from "next/link";
import { IndianRupee, ArrowLeft, TrendingUp } from "lucide-react";

export default function EconomicsPlaceholderPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in fade-in duration-200">
      <div className="h-16 w-16 rounded-2xl bg-indigo-100 border border-indigo-300 flex items-center justify-center mx-auto text-indigo-900 shadow-sm">
        <IndianRupee className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-950 font-bold">
          Phase 6 Module
        </span>
        <h1 className="font-serif text-3xl font-bold text-pankh-clay">
          Pankh Farm Economics
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Flock batch costing, feed conversion ratio (FCR) calculation, net profit margin tracking, and assumption-labeled financial modeling. Built in Phase 6.
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
