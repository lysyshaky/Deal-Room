import { motion } from "framer-motion";
import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  type DealDetail,
  type DealStatus,
  type ProjectType,
} from "@shared/schema";
import AdminShell from "@/components/AdminShell";
import Toggle from "@/components/deal/Toggle";
import TypeVisual from "@/components/deal/TypeVisual";
import { ArrowLeftIcon, CheckIcon, CopyIcon, EyeIcon, PlusIcon, TrashIcon } from "@/components/Icons";
import Spinner from "@/components/Spinner";
import { api } from "@/lib/api";
import { formatMoney, formatWeeks } from "@/lib/format";

interface OptionRow {
  key: number;
  name: string;
  description: string;
  price: string; // as typed, in major units
  weeks: string;
  kind: "base" | "addon";
  default_selected: boolean;
}

interface MilestoneRow {
  key: number;
  title: string;
  deliverables: string; // one per line
  week_start: string;
  week_length: string;
}

let nextKey = 1;
const newOption = (kind: "base" | "addon"): OptionRow => ({
  key: nextKey++,
  name: "",
  description: "",
  price: "",
  weeks: kind === "addon" ? "0" : "1",
  kind,
  default_selected: false,
});
const newMilestone = (): MilestoneRow => ({
  key: nextKey++,
  title: "",
  deliverables: "",
  week_start: "0",
  week_length: "1",
});

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "CHF", "PLN", "SEK"];
const STATUSES: DealStatus[] = ["draft", "sent", "viewed", "accepted"];
const TYPE_EMOJI: Record<ProjectType, string> = {
  mobile: "📱",
  web: "🌐",
  motion: "🎬",
  branding: "🎨",
  uxui: "🧩",
  other: "✨",
};

function SectionCard({
  n,
  title,
  hint,
  children,
}: {
  n: string;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card p-6 md:p-8"
    >
      <div className="mb-6 flex items-start gap-3.5">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-ember-soft font-display text-base font-bold text-ember-deep">
          {n}
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm text-ink-faint">{hint}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function initialsOf(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export default function DealEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [loaded, setLoaded] = useState(!editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    client_name: "",
    client_company: "",
    intro: "",
    outcomes: "",
    video_url: "",
    project_type: "other" as ProjectType,
    valid_until: "",
    accent_color: "",
    currency: "USD",
    status: "draft" as DealStatus,
  });
  const [options, setOptions] = useState<OptionRow[]>([newOption("base")]);
  const [milestones, setMilestones] = useState<MilestoneRow[]>([newMilestone()]);

  useEffect(() => {
    if (!id) return;
    api<DealDetail>(`/api/deals/${id}`)
      .then((d) => {
        setForm({
          title: d.title,
          slug: d.slug,
          client_name: d.client_name,
          client_company: d.client_company,
          intro: d.intro,
          outcomes: d.outcomes.join("\n"),
          video_url: d.video_url ?? "",
          project_type: d.project_type,
          valid_until: d.valid_until ? d.valid_until.slice(0, 10) : "",
          accent_color: d.accent_color ?? "",
          currency: d.currency,
          status: d.status,
        });
        setSlugTouched(true);
        setOptions(
          d.options.map((o) => ({
            key: nextKey++,
            name: o.name,
            description: o.description,
            price: String(o.price_cents / 100),
            weeks: String(o.weeks),
            kind: o.kind,
            default_selected: o.default_selected,
          }))
        );
        setMilestones(
          d.milestones.map((m) => ({
            key: nextKey++,
            title: m.title,
            deliverables: m.deliverables.join("\n"),
            week_start: String(m.week_start),
            week_length: String(m.week_length),
          }))
        );
        setLoaded(true);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  function setField(field: keyof typeof form) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((f) => {
        const next = { ...f, [field]: value };
        if (field === "title" && !slugTouched) next.slug = slugify(value);
        return next;
      });
    };
  }

  function updateOption(key: number, patch: Partial<OptionRow>) {
    setOptions((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function updateMilestone(key: number, patch: Partial<MilestoneRow>) {
    setMilestones((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  // ---- Live summary numbers ----
  const cents = (row: OptionRow) => Math.round((parseFloat(row.price) || 0) * 100);
  const wk = (v: string) => Math.max(0, parseInt(v, 10) || 0);
  const baseRows = options.filter((o) => o.kind === "base" && o.name.trim());
  const addonRows = options.filter((o) => o.kind === "addon" && o.name.trim());
  const valueCents =
    baseRows.reduce((s, o) => s + cents(o), 0) +
    addonRows.filter((o) => o.default_selected).reduce((s, o) => s + cents(o), 0);
  const valueWeeks =
    baseRows.reduce((s, o) => s + wk(o.weeks), 0) +
    addonRows.filter((o) => o.default_selected).reduce((s, o) => s + wk(o.weeks), 0);

  async function save() {
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      video_url: form.video_url.trim() || null,
      valid_until: form.valid_until || null,
      accent_color: form.accent_color || null,
      outcomes: form.outcomes
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      options: options
        .filter((o) => o.name.trim())
        .map((o, i) => ({
          name: o.name.trim(),
          description: o.description.trim(),
          price_cents: cents(o),
          weeks: wk(o.weeks),
          kind: o.kind,
          default_selected: o.kind === "addon" && o.default_selected,
          sort_order: i,
        })),
      milestones: milestones
        .filter((m) => m.title.trim())
        .map((m, i) => ({
          title: m.title.trim(),
          deliverables: m.deliverables
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          week_start: wk(m.week_start),
          week_length: Math.max(1, parseInt(m.week_length, 10) || 1),
          sort_order: i,
        })),
    };
    try {
      if (editing) {
        await api(`/api/deals/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/api/deals", { method: "POST", body: JSON.stringify(payload) });
      }
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this deal and all its analytics? This cannot be undone.")) return;
    try {
      await api(`/api/deals/${id}`, { method: "DELETE" });
      navigate("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/deal/${form.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy the share link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!loaded && !error) {
    return (
      <AdminShell>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Link
        to="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to deals
      </Link>

      <div className="mb-8">
        <p className="eyebrow">{editing ? "Editing" : "New proposal"}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">
          {form.title.trim() || (editing ? "Edit deal" : "Untitled deal")}
        </h1>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_330px]">
        {/* ---------------- Form sections ---------------- */}
        <div className="min-w-0 space-y-6">
          <SectionCard n="01" title="The client" hint="Who is this proposal for?">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">Proposal title</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={setField("title")}
                  placeholder="Mobile App for GreenCafe"
                />
              </div>
              <div>
                <label className="label">Client name</label>
                <input
                  className="input"
                  value={form.client_name}
                  onChange={setField("client_name")}
                  placeholder="Sarah Mitchell"
                />
              </div>
              <div>
                <label className="label">Client company</label>
                <input
                  className="input"
                  value={form.client_company}
                  onChange={setField("client_company")}
                  placeholder="GreenCafe"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Personal intro</label>
                <textarea
                  className="input min-h-[100px]"
                  value={form.intro}
                  onChange={setField("intro")}
                  placeholder="A personal note to open the proposal…"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Outcomes they care about (one per line)</label>
                <textarea
                  className="input min-h-[90px]"
                  value={form.outcomes}
                  onChange={setField("outcomes")}
                  placeholder={"Customers order ahead and skip the line\nYour team updates the menu without a developer"}
                />
                <p className="mt-1 text-xs text-ink-faint">
                  Opens the proposal as “what you get out of it” — results, not deliverables.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard n="02" title="Look & feel" hint="The animated hero, video and currency.">
            <label className="label">Project type</label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {PROJECT_TYPES.map((t) => {
                const active = form.project_type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, project_type: t }))}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                      active
                        ? "border-ember bg-ember-soft/60 shadow-card"
                        : "border-ink/10 hover:border-ink/30"
                    }`}
                  >
                    <span className="text-xl">{TYPE_EMOJI[t]}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {PROJECT_TYPE_LABELS[t]}
                      </span>
                    </span>
                    {active && <CheckIcon className="ml-auto h-4 w-4 flex-none text-ember" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Video URL (optional)</label>
                <input
                  className="input"
                  value={form.video_url}
                  onChange={setField("video_url")}
                  placeholder="https://www.loom.com/share/…"
                />
              </div>
              <div>
                <label className="label">Currency</label>
                <select className="input" value={form.currency} onChange={setField("currency")}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Brand accent (optional)</label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={form.accent_color || "#E4572E"}
                    onChange={(e) => setForm((f) => ({ ...f, accent_color: e.target.value }))}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-ink/15 bg-white p-1"
                    title="Pick the client's brand color"
                  />
                  {form.accent_color ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-ink-faint hover:text-ink"
                      onClick={() => setForm((f) => ({ ...f, accent_color: "" }))}
                    >
                      Reset to default
                    </button>
                  ) : (
                    <span className="text-xs text-ink-faint">Recolors the whole proposal page</span>
                  )}
                </div>
              </div>
              <div>
                <label className="label">Valid until (optional)</label>
                <input
                  type="date"
                  className="input"
                  value={form.valid_until}
                  onChange={setField("valid_until")}
                />
                <p className="mt-1 text-xs text-ink-faint">
                  Shows "price locked until" — after this date accepting is disabled.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            n="03"
            title="Scope & pricing"
            hint="Base options are always included. Add-ons become toggles for the client."
          >
            <div className="space-y-4">
              {options.map((o) => (
                <div
                  key={o.key}
                  className={`rounded-2xl border p-4 transition-colors md:p-5 ${
                    o.kind === "addon" ? "border-ember/30 bg-ember-soft/30" : "border-ink/10"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex rounded-full border border-ink/10 bg-white p-1">
                      {(["base", "addon"] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => updateOption(o.key, { kind: k })}
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                            o.kind === k ? "bg-ink text-cream" : "text-ink-faint hover:text-ink"
                          }`}
                        >
                          {k === "base" ? "Included" : "Add-on"}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      {o.kind === "addon" && (
                        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-soft">
                          On by default
                          <Toggle
                            on={o.default_selected}
                            onToggle={() =>
                              updateOption(o.key, { default_selected: !o.default_selected })
                            }
                            label="On by default"
                          />
                        </label>
                      )}
                      <button
                        onClick={() => setOptions((rows) => rows.filter((r) => r.key !== o.key))}
                        className="text-ink-faint transition hover:text-ember-deep"
                        title="Remove option"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-12">
                    <div className="md:col-span-6">
                      <label className="label">Name</label>
                      <input
                        className="input"
                        value={o.name}
                        onChange={(e) => updateOption(o.key, { name: e.target.value })}
                        placeholder="UI Design"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="label">Price ({form.currency})</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={o.price}
                        onChange={(e) => updateOption(o.key, { price: e.target.value })}
                        placeholder="2600"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="label">Weeks</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={o.weeks}
                        onChange={(e) => updateOption(o.key, { weeks: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-12">
                      <label className="label">What the client gets</label>
                      <input
                        className="input"
                        value={o.description}
                        onChange={(e) => updateOption(o.key, { description: e.target.value })}
                        placeholder="What the client gets…"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost" onClick={() => setOptions((rows) => [...rows, newOption("base")])}>
                <PlusIcon className="h-3.5 w-3.5" /> Base option
              </button>
              <button className="btn-ghost" onClick={() => setOptions((rows) => [...rows, newOption("addon")])}>
                <PlusIcon className="h-3.5 w-3.5" /> Add-on
              </button>
            </div>
          </SectionCard>

          <SectionCard
            n="04"
            title="Roadmap"
            hint="Phases on the public timeline. Week 0 + length 2 covers weeks 1–2."
          >
            <div className="space-y-4">
              {milestones.map((m, mi) => (
                <div key={m.key} className="rounded-2xl border border-ink/10 p-4 md:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink font-display text-xs font-bold text-cream">
                      {String(mi + 1).padStart(2, "0")}
                    </span>
                    <button
                      onClick={() => setMilestones((rows) => rows.filter((r) => r.key !== m.key))}
                      className="text-ink-faint transition hover:text-ember-deep"
                      title="Remove milestone"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-12">
                    <div className="md:col-span-6">
                      <label className="label">Phase title</label>
                      <input
                        className="input"
                        value={m.title}
                        onChange={(e) => updateMilestone(m.key, { title: e.target.value })}
                        placeholder="Discovery & UX"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="label">Starts at week</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={m.week_start}
                        onChange={(e) => updateMilestone(m.key, { week_start: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="label">Length (weeks)</label>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        value={m.week_length}
                        onChange={(e) => updateMilestone(m.key, { week_length: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-12">
                      <label className="label">Deliverables (one per line)</label>
                      <textarea
                        className="input min-h-[80px]"
                        value={m.deliverables}
                        onChange={(e) => updateMilestone(m.key, { deliverables: e.target.value })}
                        placeholder={"Kickoff workshop\nUser flows\nWireframes"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-ghost mt-4" onClick={() => setMilestones((rows) => [...rows, newMilestone()])}>
              <PlusIcon className="h-3.5 w-3.5" /> Milestone
            </button>
          </SectionCard>

          {error && (
            <div className="card border border-ember/30 bg-ember-soft p-4 text-sm font-medium text-ember-deep">
              {error}
            </div>
          )}
        </div>

        {/* ---------------- Live summary ---------------- */}
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4 lg:sticky lg:top-6"
        >
          <div className="card overflow-hidden">
            <div className="h-36 border-b border-ink/5 bg-cream-deep/50">
              <TypeVisual type={form.project_type} />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-cream">
                  {initialsOf(form.client_name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {form.client_name.trim() || "Your client"}
                  </p>
                  <p className="truncate text-xs text-ink-faint">
                    {form.client_company.trim() || "Company"}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-ink/5 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Deal value · as first seen
                </p>
                <p className="mt-1 font-display text-3xl font-semibold tabular-nums tracking-tight">
                  {formatMoney(valueCents, form.currency)}
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  {formatWeeks(valueWeeks)} · {baseRows.length} included · {addonRows.length} add-on
                  {addonRows.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="mt-4 border-t border-ink/5 pt-4">
                <label className="label">Status</label>
                <div className="flex rounded-full border border-ink/10 bg-cream-deep/60 p-1">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`flex-1 rounded-full px-1 py-1.5 text-[11px] font-semibold capitalize transition-colors ${
                        form.status === s ? "bg-ink text-cream" : "text-ink-faint hover:text-ink"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-ink/5 pt-4">
                <label className="label">Share link</label>
                <div className="flex items-center gap-2">
                  <input
                    className="input !py-2 text-xs"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                    }}
                    placeholder="greencafe-mobile-app"
                  />
                  <button
                    onClick={copyLink}
                    className="btn-ghost !px-3"
                    title="Copy share link"
                    disabled={!form.slug}
                  >
                    {copied ? (
                      <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 truncate text-xs text-ink-faint">/deal/{form.slug || "…"}</p>
              </div>
            </div>
          </div>

          <div className="card space-y-2.5 p-5">
            <button onClick={save} disabled={saving} className="btn-primary w-full">
              {saving ? "Saving…" : editing ? "Save changes" : "Create deal"}
            </button>
            {form.slug && (
              <a
                href={`/deal/${form.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost w-full"
              >
                <EyeIcon className="h-3.5 w-3.5" />
                Preview as client
              </a>
            )}
            <Link to="/dashboard" className="btn-ghost w-full">
              Cancel
            </Link>
            {editing && (
              <button
                onClick={remove}
                className="w-full pt-1 text-center text-xs font-medium text-ink-faint transition hover:text-ember-deep"
              >
                Delete this deal
              </button>
            )}
          </div>
        </motion.aside>
      </div>
    </AdminShell>
  );
}
