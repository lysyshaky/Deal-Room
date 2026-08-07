import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import Toggle from "@/components/deal/Toggle";
import { EyeIcon, FlameIcon } from "@/components/Icons";
import StatusBadge from "@/components/StatusBadge";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { formatMoney, formatWeeks } from "@/lib/format";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

const DEMOS: { tag: string; title: string; client: string; blurb: string; slug: string }[] = [
  {
    tag: "Mobile development",
    title: "Mobile App for GreenCafe",
    client: "Sarah Mitchell",
    blurb: "Flutter ordering app with an admin dashboard and loyalty add-ons. $10.8k base · 7 weeks.",
    slug: "greencafe-mobile-app",
  },
  {
    tag: "Motion & animation",
    title: "Brand Motion Package for Pulse Fitness",
    client: "Marcus Reed",
    blurb: "Motion system, hero launch spot and social cutdowns. $7.2k base · 5 weeks.",
    slug: "pulse-brand-motion",
  },
  {
    tag: "Website",
    title: "Landing Page for Nordic Yoga Studio",
    client: "Elin Berg",
    blurb: "A calm one-pager with booking and SEO add-ons. $2.5k base · 2 weeks.",
    slug: "nordic-yoga-landing",
  },
];

const FEATURES: { title: string; detail: string }[] = [
  {
    title: "Price configurator",
    detail:
      "Clients toggle add-ons and watch the total price and timeline tween live, with an itemized breakdown.",
  },
  {
    title: "Interactive roadmap",
    detail:
      "A week-by-week timeline that recalculates as options change. Tap any phase to reveal its deliverables.",
  },
  {
    title: "Sign & celebrate",
    detail:
      "Accepting opens a real signature pad. One confirm later — confetti, a signed record, and a clear “what happens next”.",
  },
  {
    title: "Owner analytics",
    detail:
      "Every view, section read and option toggle per deal. A flame badge tells you when a client keeps coming back.",
  },
  {
    title: "Deal editor",
    detail:
      "Compose proposals in the dashboard: scope, add-ons, milestones, intro video. Copy the share link and send.",
  },
  {
    title: "Simple stack",
    detail:
      "React + Express + your own free Supabase. All data flows through the API — no client-side keys, no lock-in.",
  },
];

/** The real configurator components, running on sample numbers. */
function MiniConfigurator() {
  const [dashboard, setDashboard] = useState(true);
  const [loyalty, setLoyalty] = useState(false);

  const totalCents = 1080000 + (dashboard ? 220000 : 0) + (loyalty ? 140000 : 0);
  const totalWeeks = 7 + (dashboard ? 2 : 0) + (loyalty ? 1 : 0);
  const animatedCents = useAnimatedNumber(totalCents);
  const animatedWeeks = useAnimatedNumber(totalWeeks);

  return (
    <div className="card relative p-6 md:p-7">
      <span className="absolute -top-3 left-6 rounded-full bg-ember px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
        Try me
      </span>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
        Total investment
      </p>
      <p className="mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight">
        {formatMoney(Math.round(animatedCents / 100) * 100, "USD")}
      </p>
      <p className="mt-1 text-sm text-ink-faint">
        Timeline: <span className="font-semibold text-ink">{formatWeeks(Math.round(animatedWeeks))}</span>
      </p>
      <div className="mt-5 space-y-3 border-t border-ink/10 pt-5">
        {[
          {
            name: "Admin Dashboard",
            meta: "+$2,200 · +2 weeks",
            on: dashboard,
            toggle: () => setDashboard((v) => !v),
          },
          {
            name: "Loyalty Program Module",
            meta: "+$1,400 · +1 week",
            on: loyalty,
            toggle: () => setLoyalty((v) => !v),
          },
        ].map((row) => (
          <div
            key={row.name}
            className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors ${
              row.on ? "border-ember bg-ember-soft/50" : "border-ink/10"
            }`}
          >
            <div>
              <p className="text-sm font-semibold">{row.name}</p>
              <p className="text-xs font-medium text-ember-deep">{row.meta}</p>
            </div>
            <Toggle on={row.on} onToggle={row.toggle} label={`Include ${row.name}`} />
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-faint">
        This is the real component your clients get — see it in a{" "}
        <Link to="/deal/greencafe-mobile-app" className="font-semibold text-ember-deep hover:underline">
          full proposal
        </Link>
        .
      </p>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5" title="Deal Room home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ember font-display text-base font-bold text-white">
              D
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Deal Room</span>
          </Link>
          <Link to="/dashboard" className="btn-ghost">
            Owner dashboard
          </Link>
        </div>
      </header>

      {/* Hero with live mini demo */}
      <section className="relative overflow-hidden px-6 pb-16 pt-14 md:pt-20">
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute -top-24 right-[-8%] h-96 w-96 rounded-full bg-ember/10 blur-3xl"
        />
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute bottom-[-30%] left-[-6%] h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
          style={{ animationDelay: "-9s" }}
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">For freelancers & agencies</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              {["Offers", "so", "good,"].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="mr-[0.28em] inline-block"
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative mr-[0.28em] inline-block text-ember"
              >
                saying no
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.85, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1.5 left-0 h-[0.09em] w-full origin-left rounded-full bg-ember/50"
                />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.43, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                feels stupid
              </motion.span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Clients build their package, watch the price update live, and sign on the spot.
              No PDFs.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/deal/greencafe-mobile-app" className="btn-primary !px-7 !py-3.5">
                See a live proposal
              </Link>
              <Link to="/dashboard" className="btn-ghost !px-6 !py-3">
                Open the dashboard
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-2 text-ink-faint">
              {(["draft", "sent", "viewed", "accepted"] as const).map((s, i) => (
                <span key={s} className="flex items-center gap-2">
                  {i > 0 && <span className="h-px w-4 bg-ink/20" />}
                  <StatusBadge status={s} />
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <MiniConfigurator />
          </motion.div>
        </div>
      </section>

      {/* Demo gallery */}
      <section className="border-t border-ink/5 bg-cream-deep/60 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="eyebrow">Three ready-made demos</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Pick a proposal, make it yours
            </h2>
            <p className="mt-3 text-ink-soft">
              The template ships with three seeded proposals — open one, toggle the add-ons, sign it.
            </p>
          </motion.div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {DEMOS.map((demo, i) => (
              <motion.div
                key={demo.slug}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.07 }}
              >
                <Link
                  to={`/deal/${demo.slug}`}
                  className="card group flex h-full flex-col p-6 transition-all hover:-translate-y-1 hover:shadow-pop"
                >
                  <p className="eyebrow !text-[11px]">{demo.tag}</p>
                  <h3 className="mt-2.5 font-display text-xl font-semibold leading-snug group-hover:text-ember">
                    {demo.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{demo.blurb}</p>
                  <p className="mt-4 text-sm font-semibold text-ember-deep underline-offset-4 transition-all group-hover:underline">
                    Open proposal
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo video */}
      <section className="border-t border-ink/5 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">60-second tour</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">See it in action</h2>
            <p className="mt-3 text-ink-soft">
              From opening the proposal to signing it — the whole client journey in one take.
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="mt-9 overflow-hidden rounded-2xl bg-ink shadow-pop">
            <video
              src="/demo.mp4"
              controls
              muted
              autoPlay
              loop
              playsInline
              className="aspect-video w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-ink/5 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="eyebrow">What's inside</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Everything a deal needs
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 3) * 0.06 }}
                className="card p-6"
              >
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics teaser */}
      <section className="border-t border-ink/5 bg-cream-deep/60 px-6 py-16 md:py-20">
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
            <Link to="/dashboard" className="btn-ghost mt-6">
              Explore the dashboard
            </Link>
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
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <Link to="/design" className="font-semibold text-cream underline underline-offset-4 decoration-ember hover:decoration-cream">
                Browse the design system
              </Link>
            </div>
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
