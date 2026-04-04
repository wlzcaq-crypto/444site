"use client";

import { Trophy, Gauge, ShieldCheck, TrendingUp } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { motion } from "framer-motion";

const achievements = [
  {
    icon: Gauge,
    metric: "0.1",
    unit: "СЕК",
    label: "Скорость загрузки",
    desc: "Молниеносная скорость загрузки: 0.1 секунда.",
  },
  {
    icon: ShieldCheck,
    metric: "100%",
    unit: "",
    label: "Безопасность",
    desc: "Полная защита от DDoS-атак.",
  },
  {
    icon: TrendingUp,
    metric: "24/7",
    unit: "",
    label: "Воронки продаж",
    desc: "Автоматизированная лидогенерация 24/7.",
  },
];

export default function AchievementsSection() {
  return (
    <section
      id="achievements"
      className="relative border-t border-white/5 py-32 grid-bg"
    >
      <div className="absolute top-8 left-8 font-mono text-[10px] tracking-widest text-white/20">
        03 // ДОСТИЖЕНИЯ
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-4 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-white/50" />
            <span className="font-mono text-xs tracking-[0.3em] text-white/40">
              RESULTS
            </span>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="mb-16 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            ДОСТИЖЕНИЯ
            <br />
            <span className="text-white/60">НАШИХ КЛИЕНТОВ</span>
          </h2>
        </SectionReveal>

        <div className="grid gap-8 md:grid-cols-3">
          {achievements.map((item, i) => (
            <SectionReveal key={item.label} delay={0.2 + i * 0.15}>
              <motion.div
                whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.3)" }}
                transition={{ duration: 0.3 }}
                className="group relative border border-white/10 bg-black p-8 transition-all"
              >
                {/* Top bar */}
                <div className="absolute top-0 left-0 h-px w-0 bg-white transition-all duration-700 group-hover:w-full" />

                <item.icon className="mb-6 h-8 w-8 text-white/30 transition-colors group-hover:text-white" />

                <div className="mb-2 flex items-baseline gap-1">
                  <span className="font-mono text-5xl font-extrabold text-white">
                    {item.metric}
                  </span>
                  {item.unit && (
                    <span className="font-mono text-sm font-bold text-white/40">
                      {item.unit}
                    </span>
                  )}
                </div>

                <div className="mb-3 font-mono text-xs tracking-wider text-white/40">
                  [{item.label}]
                </div>

                <p className="font-mono text-xs leading-relaxed text-white/40">
                  {item.desc}
                </p>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
