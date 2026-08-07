import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DealStatus, DealSummary } from "@shared/schema";
import AdminShell from "@/components/AdminShell";
import { ChartIcon, CheckIcon, CopyIcon, EyeIcon, FlameIcon, PencilIcon } from "@/components/Icons";
import Spinner from "@/components/Spinner";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { formatMoney, relativeTime } from "@/lib/format";

const STATUS_STEPS: DealStatus[] = ["draft", "sent", "viewed", "accepted"];

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/deal/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy the share link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button onClick={copy} className="btn-ghost" title="Copy share link">
      {copied ? <CheckIcon className="h-3.5 w-3.5 text-emerald-600" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy link"}
    </button>
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

function DealCard({ deal, index }: { deal: DealSummary; index: number }) {
  const step = STATUS_STEPS.indexOf(deal.status);
  const shared = deal.status !== "draft";
  const accepted = deal.status === "accepted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="card flex flex-col gap-4 p-6 transition-shadow hover:shadow-pop"
    >
      <div className="flex items-start gap-3.5">
        <span
          className={`flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-sm font-bold ${
            accepted ? "bg-emerald-500 text-white" : "bg-ink text-cream"
          }`}
        >
          {initialsOf(deal.client_name)}
        </span>
        <div className="min-w-0 flex-1">
          <Link
            to={`/deal/${deal.slug}`}
            className="font-display text-lg font-semibold leading-snug hover:text-ember"
          >
            {deal.title}
          </Link>
          <p className="mt-0.5 truncate text-sm text-ink-faint">
            {deal.client_name}
            {deal.client_company ? ` · ${deal.client_company}` : ""}
          </p>
        </div>
        <StatusBadge status={deal.status} />
      </div>

      {/* Status journey */}
      <div>
        <div className="flex gap-1.5">
          {STATUS_STEPS.map((s, i) => (
            <div
              key={s}
              title={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? (accepted ? "bg-emerald-500" : "bg-ember") : "bg-ink/10"
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1.5 font-medium ${
              shared ? "text-emerald-700" : "text-ink-faint"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${shared ? "bg-emerald-500" : "bg-ink/25"}`} />
            {shared ? "Link shared" : "Not shared yet"}
          </span>
          <span className="text-ink-faint">
            {accepted && deal.accepted_at
              ? `accepted ${new Date(deal.accepted_at).toLocaleDateString()}`
              : deal.last_event_at
                ? `active ${relativeTime(deal.last_event_at)}`
                : "no activity yet"}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">Deal value</p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            {formatMoney(deal.total_cents, deal.currency)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <EyeIcon className="h-4 w-4 text-ink-faint" />
            {deal.view_count}
          </span>
          {deal.view_count > 3 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ember-soft px-2.5 py-0.5 text-xs font-semibold text-ember-deep">
              <FlameIcon className="flame-flicker h-3.5 w-3.5" />
              hot
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-ink/5 pt-4">
        <CopyLinkButton slug={deal.slug} />
        <Link to={`/dashboard/${deal.id}/edit`} className="btn-ghost">
          <PencilIcon className="h-3.5 w-3.5" />
          Edit
        </Link>
        <Link to={`/dashboard/${deal.id}/analytics`} className="btn-ghost">
          <ChartIcon className="h-3.5 w-3.5" />
          Analytics
        </Link>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [deals, setDeals] = useState<DealSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<DealSummary[]>("/api/deals")
      .then(setDeals)
      .catch((e: Error) => setError(e.message));
  }, []);

  const stats = deals
    ? [
        ["Deals", String(deals.length)],
        [
          "Pipeline",
          formatMoney(
            deals.filter((d) => d.status !== "accepted").reduce((s, d) => s + d.total_cents, 0),
            deals[0]?.currency ?? "USD"
          ),
        ],
        [
          "Won",
          formatMoney(
            deals.filter((d) => d.status === "accepted").reduce((s, d) => s + d.total_cents, 0),
            deals[0]?.currency ?? "USD"
          ),
        ],
        ["Total views", String(deals.reduce((s, d) => s + d.view_count, 0))],
      ]
    : null;

  return (
    <AdminShell>
      <div className="mb-8">
        <p className="eyebrow">Your proposals</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Deals</h1>
      </div>

      {error && (
        <div className="card border border-ember/30 bg-ember-soft p-5 text-sm font-medium text-ember-deep">
          {error}
        </div>
      )}

      {!deals && !error && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {stats && deals && deals.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(([label, value], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="card p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{label}</p>
              <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums">{value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {deals && deals.length === 0 && (
        <div className="card p-10 text-center">
          <p className="font-display text-xl font-semibold">No deals yet</p>
          <p className="mt-2 text-sm text-ink-faint">
            Create your first proposal and send the link to a client.
          </p>
          <Link to="/dashboard/new" className="btn-primary mt-6">
            Create a deal
          </Link>
        </div>
      )}

      {deals && deals.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {deals.map((d, i) => (
            <DealCard key={d.id} deal={d} index={i} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
