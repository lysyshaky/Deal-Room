import { motion } from "framer-motion";
import type { ProjectType } from "@shared/schema";

/**
 * Decorative looping animation shown in the proposal hero.
 * One custom scene per project type — mobile, web, motion, branding, UX/UI.
 */

const ease = "easeInOut" as const;

function MobileVisual() {
  // One 9s loop: menu -> checkout -> order placed -> back to menu
  const slideTimes = [0, 0.28, 0.34, 0.6, 0.66, 0.94, 1];
  const slideX = ["0%", "0%", "-33.34%", "-33.34%", "-66.67%", "-66.67%", "0%"];
  return (
    <div className="relative flex h-full items-center justify-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease }}
        className="relative h-60 w-32 overflow-hidden rounded-[2rem] border-[5px] border-ink bg-white shadow-pop"
      >
        <div className="absolute left-1/2 top-2 z-10 h-1.5 w-10 -translate-x-1/2 rounded-full bg-ink/10" />
        <div className="absolute inset-x-0 bottom-0 top-6 overflow-hidden">
          <motion.div
            className="flex h-full w-[300%]"
            animate={{ x: slideX }}
            transition={{ duration: 9, times: slideTimes, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Screen 1: menu */}
            <div className="h-full w-1/3 space-y-2 px-2.5 pt-2">
              <div className="flex h-12 items-end rounded-xl bg-ember p-1.5">
                <span className="rounded bg-white/25 px-1.5 py-0.5 text-[7px] font-bold text-white">
                  GREENCAFE
                </span>
              </div>
              {["Flat white", "Avocado toast"].map((item, i) => (
                <div key={item} className="flex items-center gap-1.5 rounded-lg bg-ink/5 p-1.5">
                  <span className={`h-6 w-6 rounded-md ${i === 0 ? "bg-amber-300" : "bg-emerald-200"}`} />
                  <div className="min-w-0">
                    <p className="text-[7px] font-bold leading-tight">{item}</p>
                    <p className="text-[6px] text-ink-faint">$ {i === 0 ? "4.50" : "8.00"}</p>
                  </div>
                </div>
              ))}
              <motion.div
                className="flex h-8 items-center justify-center rounded-lg bg-ink text-[8px] font-bold text-cream"
                animate={{ scale: [1, 1, 0.92, 1, 1] }}
                transition={{ duration: 9, times: [0, 0.24, 0.26, 0.28, 1], repeat: Infinity }}
              >
                ORDER NOW
              </motion.div>
            </div>
            {/* Screen 2: checkout */}
            <div className="h-full w-1/3 space-y-2 px-2.5 pt-2">
              <p className="text-[8px] font-bold">Checkout</p>
              {["Flat white", "Avocado toast", "Oat cookie"].map((item) => (
                <div key={item} className="flex justify-between rounded-lg bg-ink/5 px-1.5 py-1 text-[7px]">
                  <span>{item}</span>
                  <span className="font-bold">✓</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-ink/10 pt-1 text-[8px] font-bold">
                <span>Total</span>
                <span className="text-ember-deep">$15.50</span>
              </div>
              <motion.div
                className="flex h-8 items-center justify-center rounded-lg bg-ember text-[8px] font-bold text-white"
                animate={{ scale: [1, 1, 0.92, 1, 1] }}
                transition={{ duration: 9, times: [0, 0.56, 0.58, 0.6, 1], repeat: Infinity }}
              >
                PAY · APPLE PAY
              </motion.div>
            </div>
            {/* Screen 3: success */}
            <div className="flex h-full w-1/3 flex-col items-center justify-center gap-2 px-2.5">
              <motion.span
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-lg text-white"
                animate={{ scale: [0.4, 1.15, 1, 1, 0.4], opacity: [0, 1, 1, 1, 0] }}
                transition={{ duration: 9, times: [0.64, 0.68, 0.72, 0.94, 1], repeat: Infinity }}
              >
                ✓
              </motion.span>
              <p className="text-center text-[8px] font-bold leading-tight">
                Order placed!
                <br />
                <span className="font-medium text-ink-faint">Ready in 12 min</span>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        className="absolute right-2 top-10 rounded-xl bg-white px-3 py-2 text-[10px] font-semibold shadow-pop md:right-8"
        animate={{ y: [10, 0, 0, -6], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.15, 0.8, 1], ease }}
      >
        🛎 New order · #214
      </motion.div>
      <motion.div
        className="absolute bottom-10 left-2 rounded-xl bg-ink px-3 py-2 text-[10px] font-semibold text-cream shadow-pop md:left-8"
        animate={{ y: [10, 0, 0, -6], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4.5, delay: 2.2, repeat: Infinity, times: [0, 0.15, 0.8, 1], ease }}
      >
        ⭐ 5.0 on the App Store
      </motion.div>
    </div>
  );
}

function WebVisual() {
  // One 7s loop: page assembles itself, the cursor clicks the CTA, reset
  const D = 7;
  return (
    <div className="flex h-full items-center justify-center">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease }}
        className="relative w-72 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-pop"
      >
        <div className="relative flex items-center gap-1.5 border-b border-ink/5 bg-cream-deep/70 px-3.5 py-2.5">
          <span className="h-2 w-2 rounded-full bg-ember/70" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span className="ml-2 flex h-4 flex-1 items-center rounded-full bg-ink/5 px-2 text-[7px] font-medium text-ink-faint">
            nordicyoga.studio
          </span>
          {/* page-load progress */}
          <motion.span
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-ember"
            animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
            transition={{ duration: D, times: [0, 0.12, 0.16], repeat: Infinity, ease: "easeOut" }}
          />
        </div>
        <div className="space-y-2.5 p-4">
          {/* hero with gradient sweep */}
          <motion.div
            className="relative h-16 overflow-hidden rounded-xl"
            style={{
              background: "linear-gradient(110deg, rgb(var(--c-ember-soft)) 20%, rgb(var(--c-ember) / 0.35) 50%, rgb(var(--c-ember-soft)) 80%)",
              backgroundSize: "200% 100%",
            }}
            animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, 0], backgroundPosition: ["0% 0%", "100% 0%", "0% 0%", "0% 0%"] }}
            transition={{ duration: D, times: [0.05, 0.15, 0.9, 1], repeat: Infinity, ease }}
          >
            <div className="absolute bottom-2.5 left-3 space-y-1">
              <span className="block h-2.5 w-28 rounded-full bg-white/80" />
              <span className="block h-2 w-20 rounded-full bg-white/50" />
            </div>
          </motion.div>
          {/* three cards pop in */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-12 rounded-lg border border-ink/10 bg-cream-deep/60 p-1.5"
                animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1, 1, 0.9] }}
                transition={{
                  duration: D,
                  times: [0.2 + i * 0.06, 0.28 + i * 0.06, 0.9, 1],
                  repeat: Infinity,
                  ease,
                }}
              >
                <span className="block h-1.5 w-3/4 rounded-full bg-ink/15" />
                <span className="mt-1 block h-1.5 w-1/2 rounded-full bg-ink/10" />
              </motion.div>
            ))}
          </div>
          {/* CTA that gets clicked */}
          <div className="relative">
            <motion.div
              className="flex h-9 w-32 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-cream"
              animate={{ opacity: [0, 1, 1, 1, 1, 0], scale: [0.9, 1, 1, 0.92, 1, 0.95] }}
              transition={{ duration: D, times: [0.42, 0.5, 0.66, 0.69, 0.74, 1], repeat: Infinity, ease }}
            >
              BOOK A CLASS
            </motion.div>
            {/* click ripple */}
            <motion.span
              className="pointer-events-none absolute left-16 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ember"
              animate={{ scale: [0.3, 1.7], opacity: [0, 0.8, 0] }}
              transition={{ duration: D, times: [0.67, 0.69, 0.78], repeat: Infinity, ease: "easeOut" }}
            />
          </div>
        </div>
        {/* cursor */}
        <motion.span
          className="pointer-events-none absolute z-10 h-3.5 w-3.5 rounded-full border-2 border-white bg-ember shadow-pop"
          animate={{
            left: ["105%", "78%", "24%", "22%", "24%", "105%"],
            top: ["80%", "42%", "70%", "72%", "70%", "85%"],
            scale: [1, 1, 1, 0.7, 1, 1],
          }}
          transition={{ duration: D, times: [0.3, 0.45, 0.62, 0.68, 0.76, 0.95], repeat: Infinity, ease }}
        />
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
