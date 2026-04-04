"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden grid-bg noise-bg">
      {/* Decorative corner brackets */}
      <div className="absolute top-8 left-8 h-16 w-16 border-t border-l border-white/20" />
      <div className="absolute top-8 right-8 h-16 w-16 border-t border-r border-white/20" />
      <div className="absolute bottom-8 left-8 h-16 w-16 border-b border-l border-white/20" />
      <div className="absolute bottom-8 right-8 h-16 w-16 border-b border-r border-white/20" />

      {/* Version tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="absolute top-24 left-8 font-mono text-[10px] tracking-widest text-white/30"
      >
        v4.4.4 // PRODUCTION BUILD
      </motion.div>

      {/* Status indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute top-24 right-8 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/30"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-white pulse-dot" />
        SYSTEM ONLINE
      </motion.div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* Terminal prefix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 font-mono text-xs tracking-[0.3em] text-white/40"
        >
          {'>'} INITIALIZING FRAMEWORK...
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glitch-text mb-8 font-mono text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          data-text="ФРЕЙМВОРК 444: АРХИТЕКТУРА ИДЕАЛЬНОГО САЙТА"
        >
          ФРЕЙМВОРК 444:
          <br />
          <span className="text-white/80">АРХИТЕКТУРА ИДЕАЛЬНОГО САЙТА</span>
        </motion.h1>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-8 h-px w-64 origin-center bg-gradient-to-r from-transparent via-white/50 to-transparent"
        />

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mx-auto mb-12 max-w-2xl font-mono text-sm leading-relaxed text-white/60 sm:text-base md:text-lg"
        >
          Увеличение производства в 10 раз за счет ИИ-слоя и профессиональной
          инфраструктуры.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <a
            href="#contact"
            className="group relative inline-flex items-center gap-3 border border-white bg-white px-8 py-4 font-mono text-sm font-bold tracking-widest text-black transition-all hover:bg-transparent hover:text-white"
          >
            <span className="relative z-10">ПОДАТЬ ЗАЯВКУ</span>
            <span className="relative z-10 h-px w-8 bg-current transition-all group-hover:w-12" />
          </a>
        </motion.div>

        {/* Terminal code block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mx-auto mt-16 max-w-lg border border-white/10 bg-black/50 p-4 text-left font-mono text-[11px] text-white/30"
        >
          <div className="mb-2 flex gap-2">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
          </div>
          <div>
            <span className="text-white/50">$</span> framework init --mode=production
          </div>
          <div className="text-white/20">
            [OK] AI-агенты подключены: 3/3
          </div>
          <div className="text-white/20">
            [OK] Инфраструктура: Next.js + Vercel + Supabase
          </div>
          <div className="terminal-cursor text-white/40">
            [OK] Система готова к работе
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
