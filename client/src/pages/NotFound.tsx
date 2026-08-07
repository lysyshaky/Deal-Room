import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ease = [0.22, 1, 0.36, 1] as const;

const FLOATERS = [
  { x: "12%", y: "22%", size: 10, color: "bg-ember", delay: 0 },
  { x: "82%", y: "18%", size: 14, color: "bg-amber-400", delay: 0.8 },
  { x: "70%", y: "72%", size: 8, color: "bg-ink", delay: 1.6 },
  { x: "20%", y: "74%", size: 12, color: "bg-ember", delay: 2.2 },
  { x: "90%", y: "48%", size: 8, color: "bg-ink/40", delay: 0.4 },
  { x: "6%", y: "48%", size: 9, color: "bg-amber-400", delay: 1.2 },
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-6 text-center">
      <div
        aria-hidden
        className="ambient-blob pointer-events-none absolute -top-24 right-[-8%] h-96 w-96 rounded-full bg-ember/10 blur-3xl"
      />
      <div
        aria-hidden
        className="ambient-blob pointer-events-none absolute bottom-[-20%] left-[-6%] h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
        style={{ animationDelay: "-9s" }}
      />

      {FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`pointer-events-none absolute rounded-full ${f.color}`}
          style={{ left: f.x, top: f.y, width: f.size, height: f.size }}
          animate={{ y: [0, -22, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 5, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="relative flex items-center gap-1 font-display text-[7rem] font-bold leading-none tracking-tight md:text-[10rem]"
      >
        <span>4</span>
        <motion.span
          aria-hidden
          className="mx-1 inline-block h-[0.72em] w-[0.72em] bg-ember align-middle"
          animate={{
            borderRadius: [
              "42% 58% 60% 40% / 45% 40% 60% 55%",
              "58% 42% 38% 62% / 55% 60% 40% 45%",
              "42% 58% 60% 40% / 45% 40% 60% 55%",
            ],
            rotate: [0, 14, 0],
            scale: [1, 1.06, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <span>4</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.15, ease }}
        className="mt-6 font-display text-2xl font-semibold md:text-3xl"
      >
        This deal got away
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.25, ease }}
        className="mt-3 max-w-md text-ink-soft"
      >
        The page you're after doesn't exist — the link may have changed, or the proposal was
        deleted. Nothing a fresh offer can't fix.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35, ease }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
        <Link to="/dashboard" className="btn-ghost">
          Open the dashboard
        </Link>
      </motion.div>
    </div>
  );
}
