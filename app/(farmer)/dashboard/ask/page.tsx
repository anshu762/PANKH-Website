import Link from "next/link";
import { Sparkles, ArrowLeft, Mic, Bot } from "lucide-react";

export default function AskPankhPlaceholderPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in fade-in duration-200">
      <div className="h-16 w-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-800 shadow-sm">
        <Bot className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold">
          Phase 3 Module
        </span>
        <h1 className="font-serif text-3xl font-bold text-pankh-clay">
          Pankh AI Assistant
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Punjabi/Hindi voice assistant, prompt-injection resistant RAG retrieval, and 6-step deterministic veterinary answers. Built in Phase 3.
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
