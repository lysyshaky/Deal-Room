import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Milestone, Option } from "@shared/schema";
import { CheckIcon } from "@/components/Icons";

interface Block {
  id: string;
  title: string;
  deliverables: string[];
  weekStart: number;
  weekLength: number;
  isAddon: boolean;
}

interface Props {
  milestones: Milestone[];
  /** Selected add-ons that add time to the project. */
  addonPhases: Option[];
}

const PX_PER_WEEK = 96;

function weekLabel(block: Block): string {
  const first = block.weekStart + 1;
  const last = block.weekStart + block.weekLength;
  return first === last ? `Week ${first}` : `Weeks ${first}–${last}`;
}

export default function Timeline({ milestones, addonPhases }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...milestones].sort((a, b) => a.week_start - b.week_start);
  const baseEnd = sorted.reduce((end, m) => Math.max(end, m.week_start + m.week_length), 0);

  const blocks: Block[] = sorted.map((m) => ({
    id: m.id,
    title: m.title,
    deliverables: m.deliverables,
    weekStart: m.week_start,
    weekLength: m.week_length,
    isAddon: false,
  }));

  let cursor = baseEnd;
  for (const addon of addonPhases) {
    blocks.push({
      id: addon.id,
      title: addon.name,
      deliverables: addon.description ? [addon.description] : [],
      weekStart: cursor,
      weekLength: addon.weeks,
      isAddon: true,
    });
    cursor += addon.weeks;
  }

  const expanded = blocks.find((b) => b.id === expandedId) ?? null;

  return (
    <div>
      <div className="timeline-scroll -mx-6 overflow-x-auto px-6 pb-3">
        <div className="flex min-w-max gap-2">
          <AnimatePresence initial={false}>
            {blocks.map((block) => {
              const isOpen = block.id === expandedId;
              return (
                <motion.button
                  key={block.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, width: 0, marginRight: -8 }}
                  transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  onClick={() => setExpandedId(isOpen ? null : block.id)}
                  style={{ width: Math.max(1, block.weekLength) * PX_PER_WEEK }}
                  className={`group relative flex-none overflow-hidden rounded-xl border p-4 text-left transition-colors ${
                    block.isAddon
                      ? isOpen
                        ? "border-ember bg-ember-soft"
                        : "border-ember/40 bg-ember-soft/60 hover:border-ember"
                      : isOpen
                        ? "border-ink bg-white shadow-card"
                        : "border-ink/10 bg-white hover:border-ink/40"
                  }`}
                >
                  <span
                    className={`absolute inset-x-0 top-0 h-1 ${block.isAddon ? "bg-ember" : "bg-ink"}`}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                    {weekLabel(block)}
                  </p>
                  <p className="mt-1.5 truncate text-sm font-semibold">{block.title}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {block.isAddon
                      ? "Add-on"
                      : `${block.deliverables.length} deliverable${block.deliverables.length === 1 ? "" : "s"}`}
                  </p>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key={expanded.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-4 rounded-xl border border-ink/10 bg-white p-5"
          >
            <p className="font-display text-lg font-semibold">
              {expanded.title}
              {expanded.isAddon && (
                <span className="ml-2 rounded-full bg-ember-soft px-2 py-0.5 align-middle text-[11px] font-bold uppercase tracking-wide text-ember-deep">
                  Add-on
                </span>
              )}
            </p>
            <ul className="mt-3 space-y-2">
              {expanded.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-ember" />
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-sm text-ink-faint"
          >
            Tap a phase to see its deliverables.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
