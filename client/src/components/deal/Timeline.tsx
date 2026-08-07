import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Milestone, Option } from "@shared/schema";
import { CheckIcon } from "@/components/Icons";
import { formatWeeks } from "@/lib/format";

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

const PX = 92;
const spring = { type: "spring", stiffness: 300, damping: 32 } as const;

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
  const gridW = totalWeeks * PX;

  const expanded = blocks.find((b) => b.id === expandedId) ?? null;

  return (
    <div className="card p-5 md:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Project roadmap
          </p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {blocks.length} phases · tap one for deliverables
          </p>
        </div>
        <motion.span
          key={totalWeeks}
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={spring}
          className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold tabular-nums text-cream"
        >
          {formatWeeks(totalWeeks)} total
        </motion.span>
      </div>

      <div className="timeline-scroll -mx-5 overflow-x-auto px-5 md:-mx-7 md:px-7">
        <div className="relative min-w-max pb-2" style={{ width: gridW + 150 }}>
          {/* Week ruler */}
          <div className="flex border-b border-ink/10 pb-2" style={{ width: gridW }}>
            {Array.from({ length: totalWeeks }).map((_, w) => (
              <motion.div
                key={w}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ width: PX }}
                className="flex-none text-[10px] font-semibold uppercase tracking-wider text-ink-faint"
              >
                Week {w + 1}
              </motion.div>
            ))}
          </div>

          {/* Week grid lines behind the bars */}
          <div
            aria-hidden
            className="absolute bottom-2 top-8 left-0"
            style={{
              width: gridW + 1,
              backgroundImage: `repeating-linear-gradient(to right, rgba(25,23,20,0.07) 0 1px, transparent 1px ${PX}px)`,
            }}
          />

          {/* Gantt rows */}
          <div className="relative space-y-2.5 pt-4">
            <AnimatePresence initial={false}>
              {blocks.map((block) => {
                const isOpen = block.id === expandedId;
                return (
                  <motion.div
                    key={block.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 44 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={spring}
                    className="relative"
                  >
                    <motion.button
                      layout
                      initial={{ width: 0 }}
                      animate={{ left: block.weekStart * PX, width: Math.max(1, block.weekLength) * PX - 10 }}
                      transition={spring}
                      onClick={() => setExpandedId(isOpen ? null : block.id)}
                      style={{ position: "absolute" }}
                      className={`top-0 flex h-11 items-center gap-2 overflow-hidden rounded-xl px-3.5 text-left transition-shadow ${
                        block.isAddon
                          ? "bg-ember text-white hover:shadow-pop"
                          : "bg-ink text-cream hover:shadow-pop"
                      } ${isOpen ? "ring-2 ring-ember ring-offset-2 ring-offset-white" : ""}`}
                    >
                      <span className="truncate text-xs font-semibold">{block.title}</span>
                      <span className="ml-auto flex-none text-[10px] font-medium opacity-60">
                        {block.weekLength}w
                      </span>
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Launch marker */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-2 top-8 border-l-2 border-dashed border-ember/60"
            animate={{ left: gridW }}
            transition={spring}
          />
          <motion.div
            animate={{ left: gridW + 12 }}
            transition={spring}
            className="absolute top-8 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ember px-3 py-1.5 text-xs font-semibold text-white shadow-card"
            style={{ position: "absolute" }}
          >
            🚀 Launch
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {expanded && (
          <motion.div
            key={expanded.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-5 rounded-xl border border-ink/10 bg-cream-deep/50 p-5"
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
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {expanded.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-ember" />
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
