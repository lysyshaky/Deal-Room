import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { CheckIcon } from "@/components/Icons";

export const NEXT_STEPS: { title: string; detail: string }[] = [
  {
    title: "You get the paperwork",
    detail: "A countersigned copy and the full agreement land in your inbox within 24 hours.",
  },
  {
    title: "We book the kickoff",
    detail: "A 30-minute call to lock dates, access and points of contact.",
  },
  {
    title: "Work begins",
    detail: "First invoice and your project board invite arrive, then Discovery starts.",
  },
];

export function NextSteps() {
  return (
    <ol className="space-y-4">
      {NEXT_STEPS.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ember-soft text-sm font-bold text-ember-deep">
            {i + 1}
          </span>
          <div>
            <p className="font-semibold">{step.title}</p>
            <p className="text-sm text-ink-faint">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function celebrate(accent = "#E4572E") {
  const colors = [accent, "#F5A623", "#191714", "#FFFFFF"];
  confetti({ particleCount: 130, spread: 75, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors }), 180);
  setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors }), 320);
}

interface Props {
  open: boolean;
  onClose: () => void;
  clientName: string;
  totalLabel: string;
  weeksLabel: string;
  accent?: string;
  onAccept: (signatureDataUrl: string) => Promise<void>;
}

export default function AcceptModal({ open, onClose, clientName, totalLabel, weeksLabel, accent, onAccept }: Props) {
  const [phase, setPhase] = useState<"sign" | "done">("sign");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hasInk, setHasInk] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const sigRef = useRef<SignatureCanvas>(null);

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setCanvasWidth(node.clientWidth);
  }, []);

  useEffect(() => {
    if (open) {
      setPhase("sign");
      setError("");
      setHasInk(false);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  async function confirm() {
    const canvas = sigRef.current;
    if (!canvas || canvas.isEmpty()) return;
    setBusy(true);
    setError("");
    try {
      await onAccept(canvas.toDataURL("image/png"));
      setPhase("done");
      celebrate(accent);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={phase === "sign" && !busy ? onClose : undefined}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="w-full max-w-lg rounded-t-3xl bg-cream p-6 shadow-pop sm:rounded-3xl md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {phase === "sign" ? (
              <>
                <p className="eyebrow">Almost there</p>
                <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                  Accept this proposal
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  You're accepting the package as configured — <strong>{totalLabel}</strong> over{" "}
                  <strong>{weeksLabel}</strong>. Sign below to make it official.
                </p>

                <div ref={measureRef} className="mt-5">
                  {canvasWidth > 0 && (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-ink/20 bg-white">
                      {!hasInk && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-lg italic text-ink/25">
                          Sign here, {clientName.split(" ")[0]}
                        </span>
                      )}
                      <SignatureCanvas
                        ref={sigRef}
                        penColor="#191714"
                        onEnd={() => setHasInk(!(sigRef.current?.isEmpty() ?? true))}
                        canvasProps={{ width: canvasWidth - 4, height: 180, className: "block touch-none" }}
                      />
                    </div>
                  )}
                </div>

                {error && <p className="mt-3 text-sm font-medium text-ember-deep">{error}</p>}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    className="text-sm font-medium text-ink-faint transition hover:text-ink"
                    onClick={() => {
                      sigRef.current?.clear();
                      setHasInk(false);
                    }}
                  >
                    Clear signature
                  </button>
                  <div className="flex gap-2">
                    <button className="btn-ghost" onClick={onClose} disabled={busy}>
                      Cancel
                    </button>
                    <button className="btn-primary" onClick={confirm} disabled={!hasInk || busy}>
                      {busy ? "Confirming…" : "Confirm & accept"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <CheckIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold md:text-3xl">
                  It's official 🎉
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Thank you, {clientName.split(" ")[0]}! Here's what happens next:
                </p>
                <div className="mt-6">
                  <NextSteps />
                </div>
                <button className="btn-primary mt-8 w-full" onClick={onClose}>
                  Done
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
