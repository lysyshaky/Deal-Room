import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckIcon } from "@/components/Icons";

/**
 * Landing hero: a 3D-tilting proposal card on which the deal closes
 * itself in a loop — signature draws in, the ACCEPTED stamp slams
 * down, confetti pops, reset. Tilt follows the mouse.
 */

// sign -> stamp -> celebrate/hold -> reset
const PHASE_DURATIONS = [2600, 900, 2000, 650];

const SIGNATURE_PATH =
  "M8 42 C 20 10 34 12 40 30 C 45 44 52 44 58 28 C 64 12 72 14 76 30 C 80 44 88 40 96 26 C 104 12 112 16 116 30 C 120 42 128 44 138 30 C 146 20 158 18 170 26 C 182 34 200 30 210 22";

const CONFETTI = Array.from({ length: 14 }).map((_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const dist = 80 + (i % 3) * 30;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist * 0.75 - 30,
    rotate: 60 + i * 24,
    color: ["#E4572E", "#F5A623", "#191714", "#10B981"][i % 4],
    delay: (i % 5) * 0.035,
  };
});

export default function HeroShowcase() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setPhase((p) => (p + 1) % PHASE_DURATIONS.length),
      PHASE_DURATIONS[phase]
    );
    return () => clearTimeout(timer);
  }, [phase]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 140, damping: 16 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 140, damping: 16 });

  const stamped = phase === 1 || phase === 2;
  const bursting = phase === 2;

  return (
    <div
      className="flex justify-center py-4 [perspective:1100px]"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="card relative w-[330px] p-6 shadow-pop md:w-[360px] md:p-7"
      >
        {/* Paper header */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember">
            Proposal · GreenCafe
          </p>
          <span className="rounded-full bg-cream-deep px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
            9 weeks
          </span>
        </div>
        <p className="mt-2 font-display text-4xl font-semibold tabular-nums tracking-tight">
          $13,000
        </p>

        <ul className="mt-4 space-y-2 border-t border-ink/10 pt-4">
          {["Discovery & UX", "UI Design + Admin Dashboard", "Flutter App Development"].map((row) => (
            <li key={row} className="flex items-center gap-2.5 text-sm text-ink-soft">
              <CheckIcon className="h-3.5 w-3.5 flex-none text-ember" />
              <span className="truncate">{row}</span>
            </li>
          ))}
        </ul>

        {/* Signature zone */}
        <div className="mt-5 border-t border-ink/10 pt-4">
          <div className="relative h-16">
            <svg viewBox="0 0 220 56" className="h-full w-full" fill="none">
              <motion.path
                d={SIGNATURE_PATH}
                stroke="#191714"
                strokeWidth="2.4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: phase === 3 ? 0 : 1 }}
                transition={
                  phase === 0
                    ? { duration: 2.1, ease: "easeInOut" }
                    : { duration: 0.25, ease: "easeOut" }
                }
              />
            </svg>
          </div>
          <div className="flex items-center justify-between border-t border-ink/20 pt-1.5">
            <p className="text-[11px] font-medium text-ink-faint">Sarah Mitchell</p>
            <p className="text-[11px] text-ink-faint">GreenCafe · today</p>
          </div>
        </div>

        {/* ACCEPTED stamp */}
        <AnimatePresence>
          {stamped && (
            <motion.div
              initial={{ opacity: 0, scale: 2.4, rotate: -24 }}
              animate={{ opacity: 1, scale: 1, rotate: -12 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 380, damping: 15 }}
              style={{ z: 60 }}
              className="pointer-events-none absolute right-5 top-16 rounded-lg border-[3px] border-emerald-600/80 px-3 py-1 font-display text-lg font-bold uppercase tracking-widest text-emerald-600/90"
            >
              Accepted
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti burst */}
        <AnimatePresence>
          {bursting &&
            CONFETTI.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                animate={{ opacity: 0, x: c.x, y: c.y, scale: 0.5, rotate: c.rotate }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.15, delay: c.delay, ease: "easeOut" }}
                style={{ background: c.color, z: 40 }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-[3px]"
              />
            ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
