import { useState } from "react";
import { Link } from "react-router-dom";
import Toggle from "@/components/deal/Toggle";
import { CheckIcon, FlameIcon } from "@/components/Icons";
import Spinner from "@/components/Spinner";
import StatusBadge from "@/components/StatusBadge";

const COLORS: { name: string; hex: string; className: string; note: string }[] = [
  { name: "ink", hex: "#191714", className: "bg-ink", note: "Headlines, primary buttons" },
  { name: "ink-soft", hex: "#4A453E", className: "bg-ink-soft", note: "Body copy" },
  { name: "ink-faint", hex: "#8A8378", className: "bg-ink-faint", note: "Meta text, labels" },
  { name: "cream", hex: "#FAF8F4", className: "bg-cream border border-ink/10", note: "Page background" },
  { name: "cream-deep", hex: "#F1EDE5", className: "bg-cream-deep border border-ink/10", note: "Alternate sections" },
  { name: "ember", hex: "#E4572E", className: "bg-ember", note: "The one accent — actions & highlights" },
  { name: "ember-deep", hex: "#C6431C", className: "bg-ember-deep", note: "Accent hover / emphasis" },
  { name: "ember-soft", hex: "#FBEAE3", className: "bg-ember-soft border border-ink/10", note: "Accent tint backgrounds" },
];

function Section({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 md:p-8">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mb-6 mt-1 text-sm text-ink-faint">{note}</p>
      {children}
    </section>
  );
}

export default function DesignSystem() {
  const [toggleOn, setToggleOn] = useState(true);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ember font-display text-base font-bold text-white">
              D
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Deal Room</span>
          </Link>
          <Link to="/" className="btn-ghost">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <div className="mb-8">
          <p className="eyebrow">Bundled with this template</p>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Design system</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            One accent color, an editorial serif for headlines, and a small set of reusable classes.
            Tokens live in <code className="rounded bg-ink/5 px-1.5 py-0.5 text-sm">tailwind.config.ts</code>;
            component classes in <code className="rounded bg-ink/5 px-1.5 py-0.5 text-sm">client/src/index.css</code>.
            Change three hex values and the whole product rebrands.
          </p>
        </div>

        <Section title="Color" note="Warm neutrals plus a single ember accent. Nothing else.">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {COLORS.map((c) => (
              <div key={c.name}>
                <div className={`h-16 rounded-xl ${c.className}`} />
                <p className="mt-2 text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-ink-faint">{c.hex}</p>
                <p className="mt-0.5 text-xs text-ink-faint">{c.note}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Typography"
          note="Fraunces (font-display) for headlines and numbers with personality; Inter (font-sans) for everything else."
        >
          <div className="space-y-5">
            <p className="font-display text-5xl font-semibold tracking-tight">Display / Fraunces 600</p>
            <p className="font-display text-2xl font-semibold">Heading / Fraunces 600 · 24px</p>
            <p className="eyebrow">Eyebrow / Inter 600 · uppercase · tracked</p>
            <p className="max-w-xl leading-relaxed text-ink-soft">
              Body / Inter 400 — Comfortable line height, ink-soft color. Used for descriptions,
              intros and any longer copy a client actually reads.
            </p>
            <p className="text-sm text-ink-faint">Meta / Inter · 14px · ink-faint — timestamps, labels, helper text.</p>
          </div>
        </Section>

        <Section title="Buttons" note=".btn-primary and .btn-ghost — full-radius, quiet until hovered.">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary">Accept proposal</button>
            <button className="btn-ghost">Copy link</button>
            <button className="btn-primary" disabled>
              Disabled
            </button>
            <Spinner />
          </div>
        </Section>

        <Section title="Forms" note=".input and .label — used across the deal editor.">
          <div className="grid max-w-lg gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Client name</label>
              <input className="input" placeholder="Sarah Mitchell" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input">
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Badges & status" note="Deal lifecycle plus the attention flame.">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status="draft" />
            <StatusBadge status="sent" />
            <StatusBadge status="viewed" />
            <StatusBadge status="accepted" />
            <span className="inline-flex items-center gap-1 rounded-full bg-ember-soft px-2.5 py-0.5 text-xs font-semibold text-ember-deep">
              <FlameIcon className="h-3.5 w-3.5" />
              viewed 5 times
            </span>
          </div>
        </Section>

        <Section title="Toggle" note="The add-on switch from the price configurator. Spring-animated knob.">
          <div className="flex items-center gap-4">
            <Toggle on={toggleOn} onToggle={() => setToggleOn((v) => !v)} label="Demo toggle" />
            <span className="text-sm text-ink-soft">{toggleOn ? "Included in package" : "Not included"}</span>
          </div>
        </Section>

        <Section title="Cards & lists" note=".card with shadow-card; check-lists use the ember accent for chosen items.">
          <div className="max-w-sm rounded-2xl border border-ink/10 bg-white p-5">
            <p className="font-display text-lg font-semibold">Admin Dashboard</p>
            <p className="mt-1 text-sm text-ink-soft">Manage menu items, orders and opening hours.</p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-center gap-2.5 text-sm text-ink-soft">
                <CheckIcon className="h-3.5 w-3.5 flex-none text-ink/30" />
                Included: UI Design
              </li>
              <li className="flex items-center gap-2.5 text-sm font-medium">
                <CheckIcon className="h-3.5 w-3.5 flex-none text-ember" />
                Chosen add-on
              </li>
            </ul>
          </div>
        </Section>
      </main>
    </div>
  );
}
