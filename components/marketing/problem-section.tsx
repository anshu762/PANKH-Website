"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, TrendingDown } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      stat: "24 Hours",
      label: "The fatal detection window",
      description:
        "The difference between losing 2 birds and losing 30% of your flock is 24 hours. Early symptoms — slight water intake drop, subtle huddling, or wet droppings — are missed until mortality spikes.",
      icon: Clock,
      color: "text-amber-800",
      bgColor: "bg-amber-100/60",
      borderColor: "border-amber-200",
    },
    {
      stat: "40+ km",
      label: "To the nearest qualified poultry vet",
      description:
        "Most small commercial farms across rural Punjab have no qualified avian veterinarian within reach. When birds fall sick, farmers turn to medicine dealers or unverified WhatsApp groups for guesswork prescriptions.",
      icon: MapPin,
      color: "text-rose-800",
      bgColor: "bg-rose-100/60",
      borderColor: "border-rose-200",
    },
    {
      stat: "₹18 – ₹22",
      label: "Hidden profit lost per bird",
      description:
        "Without daily Feed Conversion Ratio (FCR) tracking and batch cost ledgers, feed wastage and subclinical infections silently eat away margins. Farmers discover losses only after birds are sold.",
      icon: TrendingDown,
      color: "text-stone-800",
      bgColor: "bg-stone-200/60",
      borderColor: "border-stone-300",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-pankh-paper border-b border-border/80">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <p className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
            Reality in the Shed
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-pankh-clay font-normal leading-tight">
            Small poultry farms don&apos;t fail from bad luck. They fail from late information.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                className={`rounded-xl p-6 sm:p-7 border ${item.borderColor} bg-white flex flex-col justify-between shadow-xs`}
              >
                <div>
                  <div className={`h-11 w-11 rounded-lg ${item.bgColor} flex items-center justify-center mb-5`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="font-serif text-3xl sm:text-4xl font-normal text-pankh-clay tracking-tight mb-1">
                    {item.stat}
                  </div>
                  <div className="text-xs font-semibold text-stone-500 mb-3">
                    {item.label}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center text-xs font-medium text-stone-500">
                  <span>Pankh intervention point</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
