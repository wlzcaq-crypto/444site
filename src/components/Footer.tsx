"use client";

import { Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <Terminal className="h-4 w-4 text-white/30" />
            <span className="font-mono text-xs tracking-widest text-white/30">
              444_FRAMEWORK
            </span>
          </div>

          <div className="font-mono text-[10px] tracking-wider text-white/20">
            &copy; {new Date().getFullYear()} {"// ВСЕ ПРАВА ЗАЩИЩЕНЫ"}
          </div>

          <div className="font-mono text-[10px] text-white/15">
            {"BUILD: STABLE // v4.4.4"}
          </div>
        </div>
      </div>
    </footer>
  );
}
