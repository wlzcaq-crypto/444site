"use client";

import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-white" />
            <span className="font-mono text-sm font-bold tracking-widest text-white">
              444_FRAMEWORK
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "#ai-swarm", label: "AI-СЛОЙ" },
              { href: "#infrastructure", label: "ИНФРАСТРУКТУРА" },
              { href: "#achievements", label: "ДОСТИЖЕНИЯ" },
              { href: "#services", label: "НАПРАВЛЕНИЯ" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-mono text-xs tracking-wider text-white/50 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <a
            href="#contact"
            className="border border-white px-4 py-2 font-mono text-xs tracking-wider text-white transition-all hover:bg-white hover:text-black"
          >
            ПОДАТЬ ЗАЯВКУ
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
