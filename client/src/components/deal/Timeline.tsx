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

const PX_PER_WEEK = 104;
const spring = { type: "spring", stiffness: 320, damping: 32 } as const;

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
  const totalWeeks = cursor;

  const expanded = blocks.find((b) => b.id === expandedId) ?? null;

  return (
    <div>
      <div className="timeline-scroll -mx-6 overflow-x-auto px-6 pb-3">
        <div className="min-w-max pr-6">
          {/* Week ruler */}
          <div className="mb-2 flex">
            {Array.from({ length: totalWeeks }).map((_, w) => (
              <motion.div
                key={w}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ width: PX_PER_WEEK }}
                className="flex-none border-l border-ink/15 pl-2 text-[10px] font-semibold uppercase tracking-wider text-ink-faint"
              >
                Week {w + 1}
              </motion.div>
            ))}
          </div>

          {/* Phase blocks on a week grid */}
          <div
            className="relative flex items-stretch"
            style={{
              backgroundImage: `repeating-linear-gradient(to right, rgba(25,23,20,0.07) 0 1px, transparent 1px ${PX_PER_WEEK}px)`,
            }}
          >
            <AnimatePresence initial={false}>
              {blocks.map((block) => {
                const isOpen = block.id === expandedId;
                return (
                  <motion.div
                    key={block.id}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: Math.max(1, block.weekLength) * PX_PER_WEEK, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={spring}
                    className="flex-none overflow-hidden py-1 pr-2"
                  >
                    <button
                      onClick={() => setExpandedId(isOpen ? null : block.id)}
                      className={`group relative block h-28 w-full overflow-hidden rounded-xl border p-3.5 text-left transition-all ${
                        block.isAddon
                          ? isOpen
                            ? "border-ember bg-ember-soft shadow-card"
                            : "border-ember/40 bg-ember-soft/60 hover:-translate-y-0.5 hover:border-ember hover:shadow-card"
                          : isOpen
                            ? "border-ink bg-white shadow-card"
                            : "border-ink/10 bg-white hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-card"
                      }`}
                    >
                      <span
                        className={`absolute inset-x-0 top-0 h-1 ${block.isAddon ? "bg-ember" : "bg-ink"}`}
                      />
                      <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                        {weekLabel(block)}
                        {block.isAddon && <span className="ml-1.5 text-ember-deep">· add-on</span>}
                      </p>
                      <p className="mt-1.5 truncate text-sm font-semibold">{block.title}</p>
                      <p className="mt-1 truncate text-xs text-ink-faint">
                        {block.deliverables.length > 0
                          ? `${block.deliverables.length} deliverable${block.deliverables.length === 1 ? "" : "s"}`
                          : "Included"}
                      </p>
                      <span
                        className={`mt-2 inline-block text-[10px] font-semibold uppercase tracking-wider transition-opacity ${
                          isOpen ? "text-ember-deep opacity-100" : "text-ink-faint opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {isOpen ? "Close" : "Details"}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Launch marker */}
            <motion.div layout transition={spring} className="flex flex-none items-center py-1">
              <div className="flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-cream">
                🚀 Launch · week {totalWeeks}
              </div>
            </motion.div>
          </div>
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
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-display text-lg font-semibold">{expanded.title}</p>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {weekLabel(expanded)}
              </span>
              {expanded.isAddon && (
                <span className="rounded-full bg-ember-soft px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ember-deep">
                  Add-on
                </span>
              )}
            </div>
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
            Tap a phase to see its deliverables — add-ons you select appear on the roadmap.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
