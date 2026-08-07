import { useEffect, useState, type ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { DealDetail, DealStatus } from "@shared/schema";
import AdminShell from "@/components/AdminShell";
import { ArrowLeftIcon, EyeIcon, PlusIcon, TrashIcon } from "@/components/Icons";
import Spinner from "@/components/Spinner";
import { api } from "@/lib/api";

interface OptionRow {
  key: number;
  name: string;
  description: string;
  price: string; // dollars, as typed
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

export default function DealEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [loaded, setLoaded] = useState(!editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    client_name: "",
    client_company: "",
    intro: "",
    video_url: "",
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
          video_url: d.video_url ?? "",
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

  async function save() {
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      video_url: form.video_url.trim() || null,
      options: options
        .filter((o) => o.name.trim())
        .map((o, i) => ({
          name: o.name.trim(),
          description: o.description.trim(),
          price_cents: Math.round((parseFloat(o.price) || 0) * 100),
          weeks: Math.max(0, parseInt(o.weeks, 10) || 0),
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
          week_start: Math.max(0, parseInt(m.week_start, 10) || 0),
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
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink">
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to deals
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">
          {editing ? "Edit deal" : "New deal"}
        </h1>
        {form.slug && (
          <a href={`/deal/${form.slug}`} target="_blank" rel="noreferrer" className="btn-ghost">
            <EyeIcon className="h-3.5 w-3.5" />
            Preview as client
          </a>
        )}
      </div>

      <div className="space-y-6">
        {/* Basics */}
        <section className="card p-6 md:p-8">
          <h2 className="mb-5 font-display text-xl font-semibold">Basics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={setField("title")} placeholder="Mobile App for GreenCafe" />
            </div>
            <div>
              <label className="label">Share link slug</label>
              <input
                className="input"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
                }}
                placeholder="greencafe-mobile-app"
              />
              <p className="mt-1 text-xs text-ink-faint">/deal/{form.slug || "…"}</p>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={setField("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Client name</label>
              <input className="input" value={form.client_name} onChange={setField("client_name")} placeholder="Sarah Mitchell" />
            </div>
            <div>
              <label className="label">Client company</label>
              <input className="input" value={form.client_company} onChange={setField("client_company")} placeholder="GreenCafe" />
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
              <label className="label">Video URL (optional)</label>
              <input className="input" value={form.video_url} onChange={setField("video_url")} placeholder="https://www.loom.com/share/…" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Intro message</label>
              <textarea
                className="input min-h-[110px]"
                value={form.intro}
                onChange={setField("intro")}
                placeholder="A personal note to open the proposal…"
              />
            </div>
          </div>
        </section>

        {/* Options */}
        <section className="card p-6 md:p-8">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Scope & pricing</h2>
          </div>
          <p className="mb-5 text-sm text-ink-faint">
            Base options are always included. Add-ons are toggles the client can flip on the proposal page.
          </p>
          <div className="space-y-4">
            {options.map((o) => (
              <div key={o.key} className="rounded-xl border border-ink/10 p-4">
                <div className="grid gap-3 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <label className="label">Name</label>
                    <input className="input" value={o.name} onChange={(e) => updateOption(o.key, { name: e.target.value })} placeholder="UI Design" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Price ($)</label>
                    <input className="input" type="number" min="0" value={o.price} onChange={(e) => updateOption(o.key, { price: e.target.value })} placeholder="2600" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Weeks</label>
                    <input className="input" type="number" min="0" value={o.weeks} onChange={(e) => updateOption(o.key, { weeks: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Kind</label>
                    <select className="input" value={o.kind} onChange={(e) => updateOption(o.key, { kind: e.target.value as "base" | "addon" })}>
                      <option value="base">base</option>
                      <option value="addon">add-on</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-between gap-2 md:col-span-2">
                    {o.kind === "addon" ? (
                      <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-sm font-medium text-ink-soft">
                        <input
                          type="checkbox"
                          checked={o.default_selected}
                          onChange={(e) => updateOption(o.key, { default_selected: e.target.checked })}
                          className="h-4 w-4 accent-ember"
                        />
                        On by default
                      </label>
                    ) : (
                      <span />
                    )}
                    <button
                      onClick={() => setOptions((rows) => rows.filter((r) => r.key !== o.key))}
                      className="pb-2 text-ink-faint transition hover:text-ember-deep"
                      title="Remove option"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  <div className="md:col-span-12">
                    <label className="label">Description</label>
                    <input className="input" value={o.description} onChange={(e) => updateOption(o.key, { description: e.target.value })} placeholder="What the client gets…" />
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
        </section>

        {/* Milestones */}
        <section className="card p-6 md:p-8">
          <h2 className="mb-1 font-display text-xl font-semibold">Timeline milestones</h2>
          <p className="mb-5 text-sm text-ink-faint">
            Phases shown on the public roadmap. Weeks are zero-indexed: a phase starting at week 0 with length 2 covers weeks 1–2.
          </p>
          <div className="space-y-4">
            {milestones.map((m) => (
              <div key={m.key} className="rounded-xl border border-ink/10 p-4">
                <div className="grid gap-3 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <label className="label">Title</label>
                    <input className="input" value={m.title} onChange={(e) => updateMilestone(m.key, { title: e.target.value })} placeholder="Discovery & UX" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="label">Starts at week</label>
                    <input className="input" type="number" min="0" value={m.week_start} onChange={(e) => updateMilestone(m.key, { week_start: e.target.value })} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="label">Length (weeks)</label>
                    <input className="input" type="number" min="1" value={m.week_length} onChange={(e) => updateMilestone(m.key, { week_length: e.target.value })} />
                  </div>
                  <div className="flex items-end justify-end md:col-span-1">
                    <button
                      onClick={() => setMilestones((rows) => rows.filter((r) => r.key !== m.key))}
                      className="pb-2 text-ink-faint transition hover:text-ember-deep"
                      title="Remove milestone"
                    >
                      <TrashIcon />
                    </button>
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
        </section>

        {error && (
          <div className="card border border-ember/30 bg-ember-soft p-4 text-sm font-medium text-ember-deep">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pb-10">
          {editing ? (
            <button onClick={remove} className="text-sm font-medium text-ink-faint transition hover:text-ember-deep">
              Delete deal
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Link to="/dashboard" className="btn-ghost">
              Cancel
            </Link>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? "Saving…" : editing ? "Save changes" : "Create deal"}
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
