import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { Comment, DealAnalytics as Analytics, DealDetail, EventRow } from "@shared/schema";
import AdminShell from "@/components/AdminShell";
import Timeline from "@/components/deal/Timeline";
import { ArrowLeftIcon } from "@/components/Icons";
import Spinner from "@/components/Spinner";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/format";

function describeEvent(e: EventRow): string {
  switch (e.type) {
    case "view":
      return "Opened the proposal";
    case "section_view":
      return `Read the “${String(e.meta.section ?? "unknown")}” section`;
    case "option_toggle":
      return `Toggled “${String(e.meta.option_name ?? "an option")}” ${e.meta.selected ? "on" : "off"}`;
    case "comment":
      return `${String(e.meta.author_name ?? "The client")} asked a question`;
    case "accept":
      return "Accepted the proposal 🎉";
  }
}

const EVENT_DOTS: Record<EventRow["type"], string> = {
  view: "bg-sky-400",
  section_view: "bg-ink/25",
  option_toggle: "bg-amber-400",
  comment: "bg-ember",
  accept: "bg-emerald-500",
};

export default function DealAnalytics() {
  const { id } = useParams();
  const [data, setData] = useState<Analytics | null>(null);
  const [detail, setDetail] = useState<DealDetail | null>(null);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !detail) return;
    setReplyBusy(true);
    try {
      const comment = await api<Comment>(`/api/deals/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ author_name: "Owner", body: reply.trim() }),
      });
      setDetail((d) => (d ? { ...d, comments: [...d.comments, comment] } : d));
      setReply("");
    } catch {
      // keep the typed reply on failure
    } finally {
      setReplyBusy(false);
    }
  }

  useEffect(() => {
    api<Analytics>(`/api/deals/${id}/analytics`)
      .then(setData)
      .catch((e: Error) => setError(e.message));
    api<DealDetail>(`/api/deals/${id}`)
      .then(setDetail)
      .catch(() => {
        // The roadmap is a bonus panel — analytics still render without it.
      });
  }, [id]);

  if (!data) {
    return (
      <AdminShell>
        {error ? (
          <div className="card border border-ember/30 bg-ember-soft p-5 text-sm font-medium text-ember-deep">{error}</div>
        ) : (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}
      </AdminShell>
    );
  }

  const maxToggles = Math.max(1, ...data.toggle_counts.map((t) => t.count));

  return (
    <AdminShell>
      <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint hover:text-ink">
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Back to deals
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold">{data.deal.title}</h1>
        <StatusBadge status={data.deal.status} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Total views", String(data.total_views)],
          ["Accepted", data.accept_count > 0 ? "Yes" : "Not yet"],
          ["Options toggled", String(data.toggle_counts.reduce((s, t) => s + t.count, 0))],
        ].map(([label, value]) => (
          <div key={label} className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      {detail && detail.milestones.length > 0 && (
        <div className="mb-6">
          <Timeline
            milestones={detail.milestones}
            addonPhases={detail.options.filter(
              (o) => o.kind === "addon" && o.default_selected && o.weeks > 0
            )}
          />
        </div>
      )}

      {detail && (
        <section className="card mb-6 p-6 md:p-8">
          <h2 className="mb-1 font-display text-xl font-semibold">Questions from the client</h2>
          <p className="mb-5 text-sm text-ink-faint">
            Replies appear on the proposal page instantly.
          </p>
          {detail.comments.length === 0 ? (
            <p className="text-sm text-ink-faint">No questions yet.</p>
          ) : (
            <div className="space-y-3.5">
              {detail.comments.map((c) => {
                const owner = c.author_role === "owner";
                return (
                  <div key={c.id} className="flex gap-3">
                    <span
                      className={`flex h-8 w-8 flex-none items-center justify-center rounded-full font-display text-[11px] font-bold ${
                        owner ? "bg-ember text-white" : "bg-ink text-cream"
                      }`}
                    >
                      {c.author_name
                        .split(/\s+/)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div className={`min-w-0 flex-1 rounded-xl px-4 py-3 ${owner ? "bg-ember-soft" : "bg-cream-deep/70"}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <span className="text-sm font-semibold">
                          {owner ? "You" : c.author_name}
                        </span>
                        <span className="text-xs text-ink-faint">{relativeTime(c.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{c.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <form onSubmit={sendReply} className="mt-5 flex gap-2 border-t border-ink/5 pt-5">
            <input
              className="input"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply…"
            />
            <button type="submit" className="btn-primary flex-none" disabled={replyBusy || !reply.trim()}>
              {replyBusy ? "Sending…" : "Reply"}
            </button>
          </form>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6 md:p-8">
          <h2 className="mb-1 font-display text-xl font-semibold">Most-toggled options</h2>
          <p className="mb-5 text-sm text-ink-faint">What the client keeps flipping on and off.</p>
          {data.toggle_counts.length === 0 ? (
            <p className="text-sm text-ink-faint">No option toggles yet.</p>
          ) : (
            <ul className="space-y-4">
              {data.toggle_counts.map((t) => (
                <li key={t.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-ink-faint">
                      {t.count} {t.count === 1 ? "toggle" : "toggles"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink/5">
                    <div className="h-full rounded-full bg-ember" style={{ width: `${(t.count / maxToggles) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-6 md:p-8">
          <h2 className="mb-1 font-display text-xl font-semibold">Activity</h2>
          <p className="mb-5 text-sm text-ink-faint">Everything the client did on the proposal page.</p>
          {data.events.length === 0 ? (
            <p className="text-sm text-ink-faint">No activity yet — share the link to get started.</p>
          ) : (
            <ul className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
              {data.events.map((e) => (
                <li key={e.id} className="flex items-center gap-3 text-sm">
                  <span className={`h-2 w-2 flex-none rounded-full ${EVENT_DOTS[e.type]}`} />
                  <span className="min-w-0 flex-1 truncate">{describeEvent(e)}</span>
                  <span className="flex-none text-xs text-ink-faint">{relativeTime(e.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
