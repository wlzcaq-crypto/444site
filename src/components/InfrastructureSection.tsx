"use client";

import { Server, Shield, Zap, Globe, Database, Lock } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { motion } from "framer-motion";

const techStack = [
  { icon: Globe, label: "Next.js", desc: "React Framework" },
  { icon: Zap, label: "Tailwind CSS", desc: "Utility-First CSS" },
  { icon: Server, label: "Vercel", desc: "Edge Хостинг" },
  { icon: Database, label: "Supabase", desc: "Бэкенд" },
];

const securityPoints = [
  {
    icon: Shield,
    label: "Cloudflare",
    desc: "Глобальная CDN и защита",
  },
  {
    icon: Lock,
    label: "WAF",
    desc: "Веб-фильтр атак",
  },
  {
    icon: Zap,
    label: "Edge Caching",
    desc: "Скорость",
  },
];

export default function InfrastructureSection() {
  return (
    <section
      id="infrastructure"
      className="relative border-t border-white/5 py-32"
    >
      <div className="absolute top-8 left-8 font-mono text-[10px] tracking-widest text-white/20">
        02 // ИНФРАСТРУКТУРА
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-4 flex items-center gap-3">
            <Server className="h-5 w-5 text-white/50" />
            <span className="font-mono text-xs tracking-[0.3em] text-white/40">
              TECH_STACK
            </span>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="mb-6 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            ИНФРАСТРУКТУРА
            <br />
            <span className="text-white/60">$1500+</span>
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="mb-16 max-w-3xl border-l border-white/20 pl-6">
            <p className="font-mono text-sm leading-relaxed text-white/50 sm:text-base">
              Продукт студийного качества требует надежного фундамента. Мы строим
              сайты на базе Next.js и Tailwind CSS, используя Vercel (Edge
              хостинг) и Supabase (Бэкенд).
            </p>
          </div>
        </SectionReveal>

        {/* Tech stack grid */}
        <div className="mb-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((tech, i) => (
            <SectionReveal key={tech.label} delay={0.3 + i * 0.1}>
              <motion.div
                whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.3)" }}
                transition={{ duration: 0.3 }}
                className="border border-white/10 bg-black p-6 text-center transition-all"
              >
                <tech.icon className="mx-auto mb-4 h-6 w-6 text-white/40" />
                <div className="mb-1 font-mono text-sm font-bold text-white">
                  {tech.label}
                </div>
                <div className="font-mono text-[10px] tracking-wider text-white/30">
                  {tech.desc}
                </div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>

        {/* Security block */}
        <SectionReveal delay={0.5}>
          <div className="border border-white/10 bg-black/50 p-8">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-5 w-5 text-white/50" />
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-white/60">
                ЗОЛОТОЙ СТАНДАРТ БЕЗОПАСНОСТИ
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {securityPoints.map((point) => (
                <div key={point.label} className="flex items-start gap-4">
                  <point.icon className="mt-1 h-5 w-5 shrink-0 text-white/30" />
                  <div>
                    <div className="font-mono text-sm font-bold text-white">
                      {point.label}
                    </div>
                    <div className="font-mono text-xs text-white/40">
                      {point.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
