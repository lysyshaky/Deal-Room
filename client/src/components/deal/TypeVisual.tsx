import { motion } from "framer-motion";
import type { ProjectType } from "@shared/schema";

/**
 * Decorative looping animation shown in the proposal hero.
 * One custom scene per project type — mobile, web, motion, branding, UX/UI.
 */

const ease = "easeInOut" as const;

function MobileVisual() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease }}
        className="relative h-60 w-32 overflow-hidden rounded-[2rem] border-[5px] border-ink bg-white shadow-pop"
      >
        <div className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-ink/10" />
        <div className="absolute inset-x-2.5 top-7 space-y-2">
          <motion.div
            className="h-14 rounded-xl bg-ember"
            animate={{ opacity: [1, 0.75, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease }}
          />
          <div className="h-7 rounded-lg bg-ink/10" />
          <div className="h-7 w-4/5 rounded-lg bg-ink/10" />
          <motion.div
            className="flex h-9 items-center justify-center rounded-lg bg-ink text-[9px] font-bold text-cream"
            animate={{ scale: [1, 0.95, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease }}
          >
            ORDER NOW
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        className="absolute right-2 top-10 rounded-xl bg-white px-3 py-2 text-[10px] font-semibold shadow-pop md:right-8"
        animate={{ y: [10, 0, 0, -6], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.15, 0.8, 1], ease }}
      >
        🛎 New order · #214
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-2 rounded-xl bg-ink px-3 py-2 text-[10px] font-semibold text-cream shadow-pop md:left-8"
        animate={{ y: [10, 0, 0, -6], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, delay: 2, repeat: Infinity, times: [0, 0.15, 0.8, 1], ease }}
      >
        ⭐ 5.0 on the App Store
      </motion.div>
    </div>
  );
}

function WebVisual() {
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease }}
        className="w-72 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-pop"
      >
        <div className="flex items-center gap-1.5 border-b border-ink/5 bg-cream-deep/70 px-3.5 py-2.5">
          <span className="h-2 w-2 rounded-full bg-ember/70" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="ml-2 h-3 flex-1 rounded-full bg-ink/5" />
        </div>
        <div className="space-y-2.5 p-4">
          <motion.div
            className="h-16 origin-left rounded-xl bg-ember/20"
            animate={{ scaleX: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, times: [0, 0.18, 0.85, 1], ease }}
          />
          {[0.9, 0.65, 0.75].map((w, i) => (
            <motion.div
              key={i}
              className="h-4 origin-left rounded-full bg-ink/10"
              style={{ width: `${w * 100}%` }}
              animate={{ scaleX: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 5.5, delay: 0.25 + i * 0.18, repeat: Infinity, times: [0, 0.18, 0.85, 1], ease }}
            />
          ))}
          <motion.div
            className="h-9 w-28 origin-left rounded-full bg-ink"
            animate={{ scaleX: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 5.5, delay: 0.85, repeat: Infinity, times: [0, 0.18, 0.85, 1], ease }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function MotionVisual() {
  return (
    <div className="relative flex h-full items-center justify-center">
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="absolute h-24 w-24 rounded-full border-2 border-ember/50"
          animate={{ scale: [1, 2.1], opacity: [0.7, 0] }}
          transition={{ duration: 2.6, delay: i * 1.3, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
      <motion.div
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-ember shadow-pop"
        animate={{ scale: [1, 1.07, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease }}
      >
        <span className="ml-1.5 block h-0 w-0 border-y-[14px] border-l-[22px] border-y-transparent border-l-white" />
      </motion.div>
      <motion.div
        className="absolute h-52 w-52"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-ink" />
        <span className="absolute bottom-3 right-6 h-2.5 w-2.5 rounded-full bg-amber-400" />
      </motion.div>
      {/* scrubber */}
      <div className="absolute inset-x-10 bottom-6 h-1.5 overflow-hidden rounded-full bg-ink/10 md:inset-x-16">
        <motion.div
          className="h-full rounded-full bg-ember"
          animate={{ width: ["0%", "100%"] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

function BrandingVisual() {
  return (
    <div className="relative flex h-full items-center justify-center">
      <motion.div
        className="h-32 w-32 bg-ember shadow-pop"
        animate={{
          borderRadius: [
            "30% 70% 60% 40% / 40% 40% 60% 60%",
            "60% 40% 30% 70% / 60% 55% 45% 40%",
            "30% 70% 60% 40% / 40% 40% 60% 60%",
          ],
          rotate: [0, 24, 0],
        }}
        transition={{ duration: 7, repeat: Infinity, ease }}
      />
      <motion.div
        className="absolute right-8 top-8 h-14 w-14 rounded-2xl border-[3px] border-ink md:right-16"
        animate={{ rotate: [0, 90, 90, 180], scale: [1, 1.1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, times: [0, 0.4, 0.6, 1], ease }}
      />
      <motion.div
        className="absolute bottom-10 left-8 h-10 w-10 rounded-full bg-amber-400 md:left-16"
        animate={{ y: [0, -14, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease }}
      />
      <motion.p
        className="absolute bottom-6 right-8 font-display text-3xl font-bold text-ink/20 md:right-14"
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 4.5, repeat: Infinity, ease }}
      >
        Aa
      </motion.p>
    </div>
  );
}

function UxuiVisual() {
  const cards = [
    { x: -46, y: 16, r: -7, d: 0 },
    { x: 0, y: 0, r: 0, d: 0.35 },
    { x: 46, y: 18, r: 7, d: 0.7 },
  ];
  return (
    <div className="relative flex h-full items-center justify-center">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          className="absolute w-36 rounded-2xl border border-ink/10 bg-white p-3.5 shadow-pop"
          style={{ zIndex: i === 1 ? 2 : 1 }}
          initial={{ x: c.x, y: c.y, rotate: c.r }}
          animate={{ y: [c.y, c.y - 10, c.y] }}
          transition={{ duration: 4.4, delay: c.d, repeat: Infinity, ease }}
        >
          <div className="h-2.5 w-3/5 rounded-full bg-ink/15" />
          <div className="mt-2 h-12 rounded-lg border border-dashed border-ink/20 bg-cream-deep/50" />
          <div className="mt-2 flex gap-1.5">
            <div className="h-5 flex-1 rounded-md bg-ember/25" />
            <div className="h-5 flex-1 rounded-md bg-ink/10" />
          </div>
        </motion.div>
      ))}
      <motion.span
        className="absolute z-10 h-4 w-4 rounded-full border-2 border-white bg-ember shadow-pop"
        animate={{ x: [-50, 0, 52, -50], y: [30, -16, 26, 30] }}
        transition={{ duration: 6, repeat: Infinity, ease }}
      />
    </div>
  );
}

function OtherVisual() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 25 }).map((_, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          return (
            <motion.span
              key={i}
              className="h-3.5 w-3.5 rounded-full bg-ember"
              animate={{ scale: [0.5, 1.15, 0.5], opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 2.8, delay: (row + col) * 0.18, repeat: Infinity, ease }}
            />
          );
        })}
      </div>
    </div>
  );
}

const VISUALS: Record<ProjectType, () => JSX.Element> = {
  mobile: MobileVisual,
  web: WebVisual,
  motion: MotionVisual,
  branding: BrandingVisual,
  uxui: UxuiVisual,
  other: OtherVisual,
};

export default function TypeVisual({ type }: { type: ProjectType }) {
  const Visual = VISUALS[type] ?? OtherVisual;
  return (
    <div className="h-full w-full" aria-hidden>
      <Visual />
    </div>
  );
}
