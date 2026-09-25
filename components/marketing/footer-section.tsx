import Link from "next/link";

export function FooterSection() {
  return (
    <footer className="bg-pankh-clay text-stone-300 py-14 border-t border-stone-800">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl text-white font-normal">
                PANKH
              </span>
              <span className="text-xs text-amber-400 font-gurmukhi border border-amber-500/40 px-2 py-0.5 rounded">
                ਪੰਖ ਪੋਲਟਰੀ ਪਲੇਟਫਾਰਮ
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-sans max-w-md">
              A Punjabi-first poultry farm support platform integrating Pankh AI, early Sentinel risk alerts, verified veterinary escalation, and batch flock economics.
            </p>
          </div>

          {/* Core Modules Links */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-stone-200 tracking-wider uppercase text-[11px] mb-2 font-sans">
              Platform Modules
            </div>
            <ul className="space-y-2 font-sans text-stone-400">
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                  Pankh AI (Voice Assistant)
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                  Pankh Sentinel (Disease Alerts)
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                  Pankh Connect (Vet &amp; Lab Network)
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
                  Pankh Economics (Batch Ledgers)
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-stone-200 tracking-wider uppercase text-[11px] mb-2 font-sans">
              Farmer Access
            </div>
            <ul className="space-y-2 font-sans text-stone-400">
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Farmer Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-400 transition-colors">
                  Create Farm Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Vet &amp; Diagnostic Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Portfolio Credit */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-sans">
          <p>
            © {new Date().getFullYear()} Pankh Platform. Non-diagnostic advisory tool. Always consult a registered veterinarian for clinical interventions.
          </p>
          <p className="text-stone-400 font-medium">
            Built with craft by <span className="text-amber-400">Anubhav Singh</span> • Grounded in Punjab poultry farm realities.
          </p>
        </div>
      </div>
    </footer>
  );
}
