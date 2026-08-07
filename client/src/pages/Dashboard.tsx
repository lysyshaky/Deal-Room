import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DealSummary } from "@shared/schema";
import AdminShell from "@/components/AdminShell";
import { ChartIcon, CheckIcon, CopyIcon, EyeIcon, FlameIcon, PencilIcon } from "@/components/Icons";
import Spinner from "@/components/Spinner";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";

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

function DealCard({ deal }: { deal: DealSummary }) {
  return (
    <div className="card flex flex-col gap-4 p-6 transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to={`/deal/${deal.slug}`}
            className="font-display text-xl font-semibold leading-snug hover:text-ember"
          >
            {deal.title}
          </Link>
          <p className="mt-1 truncate text-sm text-ink-faint">
            {deal.client_name}
            {deal.client_company ? ` · ${deal.client_company}` : ""}
          </p>
        </div>
        <StatusBadge status={deal.status} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <EyeIcon className="h-4 w-4 text-ink-faint" />
          {deal.view_count} {deal.view_count === 1 ? "view" : "views"}
        </span>
        {deal.view_count > 3 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ember-soft px-2.5 py-0.5 text-xs font-semibold text-ember-deep">
            <FlameIcon className="h-3.5 w-3.5" />
            viewed {deal.view_count} times
          </span>
        )}
        {deal.status === "accepted" && deal.accepted_at && (
          <span className="text-xs text-emerald-700">
            accepted {new Date(deal.accepted_at).toLocaleDateString()}
          </span>
        )}
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
    </div>
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
          {deals.map((d) => (
            <DealCard key={d.id} deal={d} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
