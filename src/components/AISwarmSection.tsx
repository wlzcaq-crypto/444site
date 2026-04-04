"use client";

import { Bot, Brain, Code, Cpu } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { motion } from "framer-motion";

const agents = [
  {
    icon: Brain,
    name: "Claude 4.Opus",
    role: "Мозг",
    desc: "Стратегическое планирование, архитектура и принятие решений на высшем уровне.",
  },
  {
    icon: Cpu,
    name: "DeepSeek R1",
    role: "Логика/Бэкенд",
    desc: "Глубокий анализ, серверная логика и сложные вычисления.",
  },
  {
    icon: Code,
    name: "Devin 2.0",
    role: "Execution force",
    desc: "Автономное написание, тестирование и развертывание кода.",
  },
];

export default function AISwarmSection() {
  return (
    <section id="ai-swarm" className="relative py-32 grid-bg">
      {/* Section number */}
      <div className="absolute top-8 left-8 font-mono text-[10px] tracking-widest text-white/20">
        01 // AI-СЛОЙ
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-4 flex items-center gap-3">
            <Bot className="h-5 w-5 text-white/50" />
            <span className="font-mono text-xs tracking-[0.3em] text-white/40">
              DIGITAL_CLONES
            </span>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="mb-6 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            AI-СЛОЙ: ТВОИ
            <br />
            <span className="text-white/60">ЦИФРОВЫЕ КЛОНЫ</span>
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="mb-16 max-w-3xl border-l border-white/20 pl-6">
            <p className="font-mono text-sm leading-relaxed text-white/50 sm:text-base">
              Мы не пишем код. Мы управляем роем ИИ-агентов, работающих
              параллельно. Это стратегия &laquo;Размножения&raquo;
              (Multiplication), позволяющая одному человеку заменить студию из 10
              разработчиков.
            </p>
          </div>
        </SectionReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {agents.map((agent, i) => (
            <SectionReveal key={agent.name} delay={0.3 + i * 0.15}>
              <motion.div
                whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.3)" }}
                transition={{ duration: 0.3 }}
                className="group relative border border-white/10 bg-black p-8 transition-all"
              >
                {/* Agent index */}
                <div className="absolute top-4 right-4 font-mono text-[10px] text-white/20">
                  AGENT_{String(i + 1).padStart(2, "0")}
                </div>

                <agent.icon className="mb-6 h-8 w-8 text-white/40 transition-colors group-hover:text-white" />

                <h3 className="mb-1 font-mono text-lg font-bold text-white">
                  {agent.name}
                </h3>
                <div className="mb-4 font-mono text-xs tracking-wider text-white/40">
                  [{agent.role}]
                </div>
                <p className="font-mono text-xs leading-relaxed text-white/40">
                  {agent.desc}
                </p>

                {/* Bottom line accent */}
                <div className="absolute bottom-0 left-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" />
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
