import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { EyeIcon, FlameIcon } from "@/components/Icons";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

const FEATURES: { title: string; detail: string }[] = [
  {
    title: "Price configurator",
    detail:
      "Clients toggle add-ons and watch the total price and timeline tween live. A sticky summary follows them on mobile.",
  },
  {
    title: "Interactive roadmap",
    detail:
      "A horizontal week-by-week timeline that recalculates as options change. Tap any phase to reveal its deliverables.",
  },
  {
    title: "Sign & celebrate",
    detail:
      "Accepting opens a real signature pad. One confirm later — confetti, a signed record, and a clear “what happens next”.",
  },
  {
    title: "Owner analytics",
    detail:
      "See every view, section read and option toggle per deal. A flame badge tells you when a client keeps coming back.",
  },
  {
    title: "Deal editor",
    detail:
      "Compose proposals in the dashboard: scope, add-ons, milestones, intro video. Copy the share link and send.",
  },
  {
    title: "Simple stack",
    detail:
      "React + Express + your own free Supabase. All data flows through the API — no client-side keys, no vendor lock-in.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ember font-display text-base font-bold text-white">
              D
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Deal Room</span>
          </span>
          <Link to="/dashboard" className="btn-ghost">
            Owner dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pb-20 pt-16 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow">For freelancers & agencies</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              Send proposals clients
              <br />
              can <span className="text-ember">say yes</span> to
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Replace static PDFs with an interactive deal page: clients build their own package,
              explore the timeline, and sign right there — while you watch it happen.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/deal/greencafe-mobile-app" className="btn-primary !px-7 !py-3.5">
                See a live proposal
              </Link>
              <Link to="/dashboard" className="btn-ghost !px-6 !py-3">
                Open the dashboard
              </Link>
            </div>
          </motion.div>

          {/* Status flow strip */}
          <motion.div
            {...fadeUp}
            className="mx-auto mt-14 flex max-w-xl flex-wrap items-center justify-center gap-2 text-ink-faint"
          >
            {(["draft", "sent", "viewed", "accepted"] as const).map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                {i > 0 && <span className="text-ink/20">→</span>}
                <StatusBadge status={s} />
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-ink/5 bg-cream-deep/60 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="eyebrow">What's inside</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Everything a deal needs
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <motion.div key={f.title} {...fadeUp} className="card p-6">
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics teaser */}
      <section className="border-t border-ink/5 px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <p className="eyebrow">Know where you stand</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Stop wondering if they opened it
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              Every proposal page reports back: page views, which sections got read, and which
              add-ons the client kept toggling. Follow up at exactly the right moment.
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="card p-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold">Mobile App for GreenCafe</p>
              <StatusBadge status="viewed" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <EyeIcon className="h-4 w-4 text-ink-faint" /> 5 views
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-ember-soft px-2.5 py-0.5 text-xs font-semibold text-ember-deep">
                <FlameIcon className="h-3.5 w-3.5" /> viewed 5 times
              </span>
            </div>
            <div className="mt-5 space-y-3 border-t border-ink/5 pt-4">
              {[
                ["Toggled “Loyalty Program Module” on", "2d ago"],
                ["Read the “pricing” section", "2d ago"],
                ["Opened the proposal", "1h ago"],
              ].map(([label, time]) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 flex-none rounded-full bg-amber-400" />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <span className="flex-none text-xs text-ink-faint">{time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How to remix */}
      <section className="border-t border-ink/5 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <motion.div {...fadeUp} className="rounded-3xl bg-ink p-8 text-cream md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">
              Make it yours
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Remix in minutes</h2>
            <ol className="mt-6 space-y-4">
              {[
                ["Remix this template", "Everything runs on one port — no extra services to wire up."],
                ["Connect a free Supabase project", "Paste schema.sql, add two keys. Demo deals included."],
                ["Send your first deal link", "Create a proposal in the dashboard and share /deal/your-slug."],
              ].map(([title, detail], i) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ember text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-cream/60">{detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-ink/5 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-ink-faint">
          <span>
            <span className="font-semibold text-ink-soft">Deal Room</span> — proposals clients can
            say yes to.
          </span>
          <span className="flex items-center gap-4">
            <Link to="/design" className="hover:text-ink">
              Design system
            </Link>
            <Link to="/deal/greencafe-mobile-app" className="hover:text-ink">
              Demo proposal
            </Link>
            <Link to="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
