import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api, getPasscode, savePasscode } from "@/lib/api";
import Spinner from "@/components/Spinner";

type GateState = "checking" | "locked" | "open";

export default function PasscodeGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = getPasscode();
    if (!stored) {
      setState("locked");
      return;
    }
    api("/api/auth/verify", { method: "POST", body: JSON.stringify({ passcode: stored }) })
      .then(() => setState("open"))
      .catch(() => setState("locked"));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/auth/verify", { method: "POST", body: JSON.stringify({ passcode }) });
      savePasscode(passcode);
      setState("open");
    } catch {
      setError("That passcode didn't match. Try again.");
    }
  }

  if (state === "open") return <>{children}</>;

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <form onSubmit={submit} className="card w-full max-w-sm p-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-ember font-display text-xl font-bold text-white">
          D
        </div>
        <h1 className="font-display text-2xl font-semibold">Owner dashboard</h1>
        <p className="mt-2 text-sm text-ink-faint">Enter your passcode to manage deals.</p>
        <input
          type="password"
          className="input mt-5"
          placeholder="Passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          autoFocus
        />
        {error && <p className="mt-2 text-sm font-medium text-ember-deep">{error}</p>}
        <button type="submit" className="btn-primary mt-5 w-full">
          Unlock
        </button>
      </form>
    </div>
  );
}
