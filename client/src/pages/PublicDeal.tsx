import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Deal, DealDetail, Option } from "@shared/schema";
import AcceptModal, { NextSteps } from "@/components/deal/AcceptModal";
import Timeline from "@/components/deal/Timeline";
import Toggle from "@/components/deal/Toggle";
import TypeVisual from "@/components/deal/TypeVisual";
import { CheckIcon } from "@/components/Icons";
import Spinner from "@/components/Spinner";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { useSectionRef } from "@/hooks/useSectionTracker";
import { api } from "@/lib/api";
import { formatMoney, formatWeeks, isDirectVideoUrl, toEmbedUrl } from "@/lib/format";
import { track, trackOncePerSession } from "@/lib/track";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function PublicDeal() {
  const { slug = "" } = useParams();
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  const scopeRef = useSectionRef(slug, "scope");
  const pricingRef = useSectionRef(slug, "pricing");
  const timelineRef = useSectionRef(slug, "timeline");

  useEffect(() => {
    api<DealDetail>(`/api/public/deals/${slug}`)
      .then((d) => {
        setDeal(d);
        setSelected(
          new Set(d.options.filter((o) => o.kind === "addon" && o.default_selected).map((o) => o.id))
        );
        trackOncePerSession(slug, "view", "view");
      })
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  const base = deal?.options.filter((o) => o.kind === "base") ?? [];
  const addons = deal?.options.filter((o) => o.kind === "addon") ?? [];
  const chosenAddons = addons.filter((a) => selected.has(a.id));

  const totalCents =
    base.reduce((s, o) => s + o.price_cents, 0) + chosenAddons.reduce((s, o) => s + o.price_cents, 0);
  const baseWeeks =
    deal && deal.milestones.length > 0
      ? Math.max(...deal.milestones.map((m) => m.week_start + m.week_length))
      : base.reduce((s, o) => s + o.weeks, 0);
  const totalWeeks = baseWeeks + chosenAddons.reduce((s, o) => s + o.weeks, 0);

  const animatedCents = useAnimatedNumber(totalCents);
  const animatedWeeks = useAnimatedNumber(totalWeeks);

  const currency = deal?.currency ?? "USD";
  const displayTotal = formatMoney(Math.round(animatedCents / 100) * 100, currency);
  const displayWeeks = formatWeeks(Math.round(animatedWeeks));

  const accepted = deal?.status === "accepted";

  function toggleAddon(option: Option) {
    setSelected((prev) => {
      const next = new Set(prev);
      const on = !next.has(option.id);
      if (on) next.add(option.id);
      else next.delete(option.id);
      track(slug, "option_toggle", { option_name: option.name, selected: on });
      return next;
    });
  }

  async function accept(signatureDataUrl: string) {
    const updated = await api<Deal>(`/api/public/deals/${slug}/accept`, {
      method: "POST",
      body: JSON.stringify({
        signature_data_url: signatureDataUrl,
        selected_options: chosenAddons.map((a) => a.name),
      }),
    });
    setDeal((d) => (d ? { ...d, ...updated } : d));
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="text-center">
          <p className="font-display text-4xl font-semibold">Hmm.</p>
          <p className="mt-3 text-ink-faint">{error}</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Spinner />
      </div>
    );
  }

  const embedUrl = deal.video_url ? toEmbedUrl(deal.video_url) : null;

  return (
    <div className="min-h-screen bg-cream pb-28 lg:pb-0">
      {/* Top strip */}
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-ink-faint">
            <Link
              to="/"
              title="Deal Room home"
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-ember font-display text-xs font-bold text-white transition hover:bg-ember-deep"
            >
              D
            </Link>
            {deal.title}
          </span>
          {accepted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckIcon className="h-3 w-3" /> Accepted
            </span>
          ) : (
            <button onClick={() => setModalOpen(true)} className="btn-primary hidden !px-4 !py-1.5 !text-xs lg:inline-flex">
              Accept proposal
            </button>
          )}
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden px-6 pb-16 pt-14 md:pt-24">
        <div
          aria-hidden
          className="ambient-blob pointer-events-none absolute -top-20 right-[-10%] h-96 w-96 rounded-full bg-ember/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <p className="eyebrow">
                {deal.title}
                {deal.client_company ? ` · ${deal.client_company}` : ""}
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
                A proposal for
                <br />
                <span className="text-ember">{deal.client_name}</span>
              </h1>
              {deal.intro && (
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft">{deal.intro}</p>
              )}
              {accepted && deal.accepted_at && (
                <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <CheckIcon className="h-4 w-4" />
                  Accepted on {new Date(deal.accepted_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="h-60 md:h-72"
            >
              <TypeVisual type={deal.project_type} />
            </motion.div>
          </div>

          {deal.video_url && embedUrl && (
            <motion.div
              {...fadeUp}
              className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl bg-ink shadow-card"
            >
              {isDirectVideoUrl(deal.video_url) ? (
                <video src={deal.video_url} controls playsInline className="aspect-video w-full" />
              ) : (
                <iframe
                  src={embedUrl}
                  title="Proposal video"
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* ---------- Outcomes ---------- */}
      {deal.outcomes.length > 0 && (
        <section className="border-t border-ink/5 px-6 py-16 md:py-20">
          <div className="mx-auto max-w-5xl">
            <motion.div {...fadeUp} className="max-w-3xl">
              <p className="eyebrow">Why this matters</p>
              <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
                What {deal.client_company || "you"} get{deal.client_company ? "s" : ""} out of it
              </h2>
            </motion.div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {deal.outcomes.map((outcome, i) => (
                <motion.div
                  key={outcome}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                  className="card relative overflow-hidden p-6 md:p-7"
                >
                  <span className="absolute inset-x-0 top-0 h-1 bg-ember" />
                  <p className="font-display text-lg font-semibold text-ink/25">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 font-display text-xl font-semibold leading-snug">{outcome}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Scope ---------- */}
      <section ref={scopeRef} className="border-t border-ink/5 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div {...fadeUp}>
            <p className="eyebrow">What's included</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">The scope</h2>
          </motion.div>

          <div className="mt-10 space-y-4">
            {base.map((option, i) => (
              <motion.div
                key={option.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                className="group card relative overflow-hidden p-6 transition-all hover:-translate-y-0.5 hover:shadow-pop md:p-7"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-7 font-display text-[7rem] font-bold leading-none text-ink/[0.04] transition-colors group-hover:text-ember/10"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-ember-soft font-display text-base font-bold text-ember-deep">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xl font-semibold md:text-2xl">{option.name}</h3>
                    {option.description && (
                      <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">{option.description}</p>
                    )}
                  </div>
                  <div className="flex flex-row items-center gap-3 md:flex-col md:items-end md:gap-1.5">
                    <p className="font-display text-2xl font-semibold tabular-nums tracking-tight">
                      {formatMoney(option.price_cents, currency)}
                    </p>
                    {option.weeks > 0 && (
                      <span className="rounded-full bg-cream-deep px-2.5 py-1 text-xs font-semibold text-ink-soft">
                        {formatWeeks(option.weeks)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...fadeUp}
            className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl bg-ink px-6 py-5 text-cream md:px-8"
          >
            <p className="text-sm font-medium text-cream/70">
              Everything above is included in every package
            </p>
            <p className="font-display text-xl font-semibold tabular-nums">
              {formatMoney(base.reduce((s, o) => s + o.price_cents, 0), currency)}
              <span className="text-cream/50"> · {formatWeeks(baseWeeks)}</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------- Price configurator ---------- */}
      <section ref={pricingRef} className="border-t border-ink/5 bg-cream-deep/60 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="eyebrow">Make it yours</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Build your package</h2>
            <p className="mt-3 text-ink-soft">
              Flip the add-ons on or off — the price and timeline update instantly.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {addons.map((addon) => {
                const on = selected.has(addon.id);
                return (
                  <motion.div
                    key={addon.id}
                    {...fadeUp}
                    className={`flex items-start justify-between gap-4 rounded-2xl border bg-white p-5 transition-colors md:p-6 ${
                      on ? "border-ember shadow-card" : "border-ink/10"
                    }`}
                  >
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold">{addon.name}</h3>
                      {addon.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{addon.description}</p>
                      )}
                      <p className="mt-2.5 text-sm font-semibold text-ember-deep">
                        +{formatMoney(addon.price_cents, currency)}
                        {addon.weeks > 0 && (
                          <span className="font-medium text-ink-faint"> · +{formatWeeks(addon.weeks)}</span>
                        )}
                      </p>
                    </div>
                    <Toggle on={on} onToggle={() => toggleAddon(addon)} label={`Include ${addon.name}`} />
                  </motion.div>
                );
              })}
              {addons.length === 0 && (
                <p className="text-sm text-ink-faint">This package has no optional add-ons.</p>
              )}
            </div>

            {/* Sticky summary (desktop) */}
            <motion.aside {...fadeUp} className="lg:sticky lg:top-20 lg:self-start">
              <div className="card p-6 md:p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                  Total investment
                </p>
                <motion.p
                  key={totalCents}
                  initial={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 20 }}
                  className="mt-1 origin-left font-display text-4xl font-semibold tabular-nums tracking-tight"
                >
                  {displayTotal}
                </motion.p>
                <p className="mt-1.5 text-sm text-ink-faint">
                  Estimated timeline: <span className="font-semibold text-ink">{displayWeeks}</span>
                </p>
                <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <motion.div layout className="bg-ink" style={{ flexGrow: baseWeeks, flexBasis: 0 }} />
                  <motion.div
                    layout
                    className="bg-ember"
                    style={{ flexGrow: totalWeeks - baseWeeks, flexBasis: 0 }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] font-medium text-ink-faint">
                  <span>{formatWeeks(baseWeeks)} core</span>
                  {totalWeeks > baseWeeks && (
                    <span className="text-ember-deep">+{formatWeeks(totalWeeks - baseWeeks)} add-ons</span>
                  )}
                </div>
                <div className="my-5 border-t border-ink/10" />
                <ul>
                  {base.map((o) => (
                    <li key={o.id} className="flex items-center gap-2.5 py-1 text-sm text-ink-soft">
                      <CheckIcon className="h-3.5 w-3.5 flex-none text-ink/30" />
                      <span className="min-w-0 flex-1 truncate">{o.name}</span>
                      <span className="flex-none text-xs tabular-nums text-ink-faint">
                        {formatMoney(o.price_cents, currency)}
                      </span>
                    </li>
                  ))}
                  <AnimatePresence initial={false}>
                    {chosenAddons.map((o) => (
                      <motion.li
                        key={o.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2.5 py-1 text-sm font-medium">
                          <CheckIcon className="h-3.5 w-3.5 flex-none text-ember" />
                          <span className="min-w-0 flex-1 truncate">{o.name}</span>
                          <span className="flex-none text-xs font-semibold tabular-nums text-ember-deep">
                            +{formatMoney(o.price_cents, currency)}
                          </span>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                {!accepted && (
                  <button onClick={() => setModalOpen(true)} className="btn-primary mt-6 w-full">
                    Accept proposal
                  </button>
                )}
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* ---------- Timeline ---------- */}
      <section ref={timelineRef} className="border-t border-ink/5 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div {...fadeUp} className="max-w-3xl">
            <p className="eyebrow">Week by week</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">How it will unfold</h2>
            <p className="mt-3 text-ink-soft">
              {formatWeeks(totalWeeks)} from kickoff to launch
              {chosenAddons.some((a) => a.weeks > 0) ? ", including your selected add-ons" : ""}.
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="mt-10">
            <Timeline
              milestones={deal.milestones}
              addonPhases={chosenAddons.filter((a) => a.weeks > 0)}
            />
          </motion.div>
        </div>
      </section>

      {/* ---------- Accept ---------- */}
      <section className="border-t border-ink/5 px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          {accepted ? (
            <div className="card p-8 md:p-10">
              <p className="eyebrow">All set</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">What happens next</h2>
              {deal.signature_data_url && (
                <div className="mt-6 inline-block rounded-xl border border-ink/10 bg-white px-6 py-3">
                  <img src={deal.signature_data_url} alt="Signature" className="h-16" />
                  <p className="mt-1 border-t border-ink/10 pt-1.5 text-center text-xs text-ink-faint">
                    {deal.client_name}
                  </p>
                </div>
              )}
              <div className="mt-8">
                <NextSteps />
              </div>
            </div>
          ) : (
            <motion.div {...fadeUp} className="rounded-3xl bg-ink p-8 text-cream md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">
                Ready when you are
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
                Let's make it official
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-cream/70">
                Your package: <span className="font-semibold text-cream">{displayTotal}</span> over{" "}
                <span className="font-semibold text-cream">{displayWeeks}</span>. Sign right here — no
                printing, no PDFs.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-ember px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-ember-deep active:scale-[0.98]"
              >
                Accept proposal
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <footer className="border-t border-ink/5 px-6 py-8">
        <p className="text-center text-xs text-ink-faint">
          Sent with <span className="font-semibold text-ink-soft">Deal Room</span> — proposals clients
          can say yes to.
        </p>
      </footer>

      {/* Sticky summary bar (mobile) */}
      {!accepted && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/95 px-5 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <div>
              <motion.p
                key={totalCents}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 20 }}
                className="origin-left font-display text-xl font-semibold tabular-nums leading-tight"
              >
                {displayTotal}
              </motion.p>
              <p className="text-xs text-ink-faint">{displayWeeks}</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="btn-primary flex-none !px-5">
              Accept
            </button>
          </div>
        </div>
      )}

      <AcceptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clientName={deal.client_name}
        totalLabel={formatMoney(totalCents, currency)}
        weeksLabel={formatWeeks(totalWeeks)}
        onAccept={accept}
      />
    </div>
  );
}
