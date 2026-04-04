"use client";

import { useState, FormEvent } from "react";
import { Send, CheckCircle } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative border-t border-white/5 py-32 grid-bg"
    >
      <div className="absolute top-8 left-8 font-mono text-[10px] tracking-widest text-white/20">
        05 // КОНТАКТ
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-4 flex items-center gap-3">
            <Send className="h-5 w-5 text-white/50" />
            <span className="font-mono text-xs tracking-[0.3em] text-white/40">
              JOIN_US
            </span>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <h2 className="mb-4 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            ПРИСОЕДИНИТЬСЯ
            <br />
            <span className="text-white/60">К ФРЕЙМВОРКУ</span>
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <div className="mb-12 h-px w-16 bg-white/20" />
        </SectionReveal>

        <SectionReveal delay={0.3}>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Name field */}
                <div className="relative">
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-white/40">
                    {focused === "name" ? "> " : ""}ВАШ_ИМЯ
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) =>
                      setFormState({ ...formState, name: e.target.value })
                    }
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    placeholder="Введите ваше имя"
                    className="w-full border border-white/10 bg-transparent px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 focus:border-white/40 transition-colors"
                  />
                </div>

                {/* Email field */}
                <div className="relative">
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-white/40">
                    {focused === "email" ? "> " : ""}ВАШ_EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="name@example.com"
                    className="w-full border border-white/10 bg-transparent px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 focus:border-white/40 transition-colors"
                  />
                </div>

                {/* Phone field */}
                <div className="relative">
                  <label className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-white/40">
                    {focused === "phone" ? "> " : ""}ВАШ_ТЕЛЕФОН
                  </label>
                  <input
                    type="tel"
                    required
                    value={formState.phone}
                    onChange={(e) =>
                      setFormState({ ...formState, phone: e.target.value })
                    }
                    onFocus={() => setFocused("phone")}
                    onBlur={() => setFocused(null)}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full border border-white/10 bg-transparent px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 focus:border-white/40 transition-colors"
                  />
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="group mt-4 flex w-full items-center justify-center gap-3 border border-white bg-white px-8 py-4 font-mono text-sm font-bold tracking-widest text-black transition-all hover:bg-transparent hover:text-white"
                >
                  ОТПРАВИТЬ ЗАЯВКУ
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>

                <p className="mt-4 text-center font-mono text-[10px] text-white/20">
                  * Нажимая кнопку, вы соглашаетесь на обработку данных
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="border border-white/10 bg-black p-12 text-center"
              >
                <CheckCircle className="mx-auto mb-6 h-12 w-12 text-white/60" />
                <h3 className="mb-2 font-mono text-xl font-bold text-white">
                  ЗАЯВКА ПРИНЯТА
                </h3>
                <p className="font-mono text-sm text-white/40">
                  Мы свяжемся с вами в ближайшее время.
                </p>
                <div className="mt-6 font-mono text-[10px] text-white/20">
                  STATUS: PROCESSING // REF: #444
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionReveal>
      </div>
    </section>
  );
}
