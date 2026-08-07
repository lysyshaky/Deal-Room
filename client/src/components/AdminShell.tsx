import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PlusIcon } from "@/components/Icons";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5" title="Back to home">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ember font-display text-base font-bold text-white">
              D
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">Deal Room</span>
          </Link>
          <Link to="/dashboard/new" className="btn-primary !px-4 !py-2">
            <PlusIcon className="h-3.5 w-3.5" />
            New deal
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
