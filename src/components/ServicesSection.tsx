"use client";

import { Layers, Bot, Server, Workflow } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { motion } from "framer-motion";

const services = [
  {
    icon: Bot,
    title: "AI-driven разработка",
    desc: "Разработка с использованием передовых ИИ-агентов для максимальной скорости и качества.",
    tag: "AI",
  },
  {
    icon: Server,
    title: "Высоконагруженные системы",
    desc: "Архитектура, выдерживающая миллионы запросов. Edge-вычисления и глобальная CDN.",
    tag: "SCALE",
  },
  {
    icon: Workflow,
    title: "Автоматические воронки продаж",
    desc: "Полная автоматизация лидогенерации и продаж. Работает 24/7 без участия человека.",
    tag: "SALES",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="relative border-t border-white/5 py-32"
    >
      <div className="absolute top-8 left-8 font-mono text-[10px] tracking-widest text-white/20">
        04 // НАПРАВЛЕНИЯ
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-4 flex items-center gap-3">
            <Layers className="h-5 w-5 text-white/50" />
            <span className="font-mono text-xs tracking-[0.3em] text-white/40">
              SERVICES
            </span>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="mb-16 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            НАШИ
            <br />
            <span className="text-white/60">НАПРАВЛЕНИЯ</span>
          </h2>
        </SectionReveal>

        <div className="space-y-6">
          {services.map((service, i) => (
            <SectionReveal key={service.title} delay={0.2 + i * 0.15}>
              <motion.div
                whileHover={{ x: 4, borderColor: "rgba(255,255,255,0.3)" }}
                transition={{ duration: 0.3 }}
                className="group flex flex-col gap-6 border border-white/10 bg-black p-8 transition-all sm:flex-row sm:items-center"
              >
                {/* Number and icon */}
                <div className="flex items-center gap-6">
                  <span className="font-mono text-4xl font-extralight text-white/10">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <service.icon className="h-8 w-8 text-white/30 transition-colors group-hover:text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-mono text-lg font-bold text-white">
                      {service.title}
                    </h3>
                    <span className="border border-white/20 px-2 py-0.5 font-mono text-[9px] tracking-wider text-white/30">
                      {service.tag}
                    </span>
                  </div>
                  <p className="font-mono text-xs leading-relaxed text-white/40">
                    {service.desc}
                  </p>
                </div>

                {/* Arrow */}
                <div className="font-mono text-white/20 transition-colors group-hover:text-white">
                  {'>'}
                </div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
