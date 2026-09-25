"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, TrendingDown } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function ProblemSection() {
  const { t, lang } = useLanguage();
  const p = t.marketing.problem;

  const icons = [Clock, MapPin, TrendingDown];
  const styles = [
    {
      color: "text-amber-800",
      bgColor: "bg-amber-100/60",
      borderColor: "border-amber-200",
    },
    {
      color: "text-rose-800",
      bgColor: "bg-rose-100/60",
      borderColor: "border-rose-200",
    },
    {
      color: "text-stone-800",
      bgColor: "bg-stone-200/60",
      borderColor: "border-stone-300",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-pankh-paper border-b border-border/80">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto text-center space-y-3 mb-12"
        >
          <p className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
            {p.eyebrow}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-pankh-clay font-normal leading-tight">
            {p.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {p.items.map((item, index) => {
            const Icon = icons[index % icons.length];
            const style = styles[index % styles.length];

            return (
              <motion.div
                key={item.stat + lang}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className={`rounded-xl p-6 sm:p-7 border ${style.borderColor} bg-white flex flex-col justify-between shadow-xs`}
              >
                <div>
                  <div
                    className={`h-11 w-11 rounded-lg ${style.bgColor} flex items-center justify-center mb-5`}
                  >
                    <Icon className={`h-5 w-5 ${style.color}`} />
                  </div>
                  <div className="font-serif text-3xl sm:text-4xl font-normal text-pankh-clay tracking-tight mb-1">
                    {item.stat}
                  </div>
                  <div className="text-xs font-semibold text-stone-500 mb-3">
                    {item.label}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center text-xs font-medium text-stone-500">
                  <span>{p.interventionPoint}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
