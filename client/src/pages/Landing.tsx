import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HeroShowcase from "@/components/HeroShowcase";
import {
  ChartIcon,
  CubeIcon,
  EyeIcon,
  FeatherIcon,
  FlameIcon,
  LayersIcon,
  PlusIcon,
  RouteIcon,
  SlidersIcon,
} from "@/components/Icons";
import StatusBadge from "@/components/StatusBadge";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

const DEMOS: { tag: string; title: string; client: string; blurb: string; slug: string }[] = [
  {
    tag: "App development",
    title: "Mobile App for GreenCafe",
    client: "Sarah Mitchell",
    blurb:
      "The full-size deal: a café ordering app where two toggles turn $10.8k into $13k — plus a client question already answered in the thread.",
    slug: "greencafe-mobile-app",
  },
  {
    tag: "Motion design",
    title: "Brand Motion Package for Pulse Fitness",
    client: "Marcus Reed",
    blurb:
      "Same template, different brand — this one ships in the client's violet, with a motion system, hero spot and a price-lock date.",
    slug: "pulse-brand-motion",
  },
  {
    tag: "Web design",
    title: "Landing Page for Nordic Yoga Studio",
    client: "Elin Berg",
    blurb:
      "Proof it works for small deals too: a two-week site with booking and SEO add-ons, still sitting in draft.",
    slug: "nordic-yoga-landing",
  },
];

const FEATURES: { icon: (p: { className?: string }) => JSX.Element; title: string; detail: string }[] = [
  {
    icon: SlidersIcon,
    title: "Price configurator",
    detail:
      "Clients toggle add-ons and watch the total price and timeline tween live, with an itemized breakdown.",
  },
  {
    icon: RouteIcon,
    title: "Interactive roadmap",
    detail:
      "A Gantt-style week-by-week plan that recalculates as options change. Tap any phase for its deliverables.",
  },
  {
    icon: FeatherIcon,
    title: "Sign & celebrate",
    detail:
      "Accepting opens a real signature pad. One confirm later — confetti, a signed record, and clear next steps.",
  },
  {
    icon: ChartIcon,
    title: "Owner analytics",
    detail:
      "Every view, section read, question and toggle per deal. A flame badge shows when a client keeps coming back.",
  },
  {
    icon: LayersIcon,
    title: "Deal editor",
    detail:
      "Compose proposals with a live preview: outcomes, scope, add-ons, roadmap, expiry date and brand accent.",
  },
  {
    icon: CubeIcon,
    title: "Simple stack",
    detail:
      "React + Express + your own free Supabase. All data flows through the API — no client-side keys, no lock-in.",
  },
];

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

      {/* Hero */}
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
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
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
              Instead of a PDF, your client gets a page they can play with: pick add-ons, watch the
              price react, ask questions, and sign on the spot.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/dashboard/new" className="btn-primary !px-7 !py-3.5">
                <PlusIcon className="h-4 w-4" />
                Create a proposal
              </Link>
              <Link to="/deal/greencafe-mobile-app" className="btn-ghost !px-6 !py-3">
                <EyeIcon className="h-4 w-4" />
                See a live proposal
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroShowcase />
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
              Three niches, three price points, three looks — open one as the client: toggle
              add-ons, ask a question, sign it.
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
      <section className="border-t border-ink/5 bg-cream-deep/60 px-6 py-16 md:py-20">
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
                className="card group relative overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-pop"
              >
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-ember transition-transform duration-300 group-hover:scale-x-100" />
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember-soft text-ember-deep transition-colors duration-300 group-hover:bg-ember group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
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
              Every proposal page reports back: page views, which sections got read, questions asked,
              and which add-ons the client kept toggling. Follow up at exactly the right moment.
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
                <FlameIcon className="flame-flicker h-3.5 w-3.5" /> viewed 5 times
              </span>
            </div>
            <div className="mt-5 space-y-3 border-t border-ink/5 pt-4">
              {[
                ["Asked about the Admin Dashboard", "2d ago"],
                ["Toggled “Loyalty Program Module” on", "2d ago"],
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

      {/* Footer */}
      <footer className="border-t border-ink/10 bg-cream-deep/70">
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-14">
          <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ember font-display text-base font-bold text-white">
                  D
                </span>
                <span className="font-display text-lg font-semibold tracking-tight">Deal Room</span>
              </Link>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
                Interactive proposal pages for freelancers & agencies. Send a deal room, not a PDF.
              </p>
              <Link to="/dashboard/new" className="btn-primary mt-5 !px-5 !py-2.5 !text-xs">
                <PlusIcon className="h-3.5 w-3.5" />
                Create a proposal
              </Link>
            </div>
            {[
              {
                title: "Demo proposals",
                links: [
                  ["App development", "/deal/greencafe-mobile-app"],
                  ["Motion design", "/deal/pulse-brand-motion"],
                  ["Web design", "/deal/nordic-yoga-landing"],
                ],
              },
              {
                title: "Workspace",
                links: [
                  ["Dashboard", "/dashboard"],
                  ["New deal", "/dashboard/new"],
                  ["Design system", "/design"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  {col.title}
                </p>
                <ul className="mt-3.5 space-y-2.5">
                  {col.links.map(([label, to]) => (
                    <li key={to}>
                      <Link to={to} className="text-sm font-medium text-ink-soft transition hover:text-ember-deep">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-6 text-xs text-ink-faint">
            <span>© {new Date().getFullYear()} Deal Room</span>
            <span className="font-medium">Offers so good, saying no feels stupid.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
