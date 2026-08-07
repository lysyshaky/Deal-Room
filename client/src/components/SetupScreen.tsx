export default function SetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <div className="card w-full max-w-xl p-8 md:p-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-ember font-display text-2xl font-bold text-white">
          D
        </div>
        <h1 className="font-display text-3xl font-semibold">Welcome to Deal Room</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Almost there — connect your Supabase project and you're live. It takes about two minutes:
        </p>
        <ol className="mt-6 space-y-4">
          {[
            ["Create a free project at supabase.com", "Any region, any name."],
            ["Run schema.sql", "Open the SQL Editor in Supabase, paste the contents of schema.sql from this repo, and click Run."],
            ["Add your two keys", "Copy the Project URL and service_role key from Project Settings → API into your environment."],
          ].map(([title, detail], i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ember-soft text-sm font-bold text-ember-deep">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-ink-faint">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <pre className="mt-6 overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-cream">
          {`SUPABASE_URL=https://your-project-ref.supabase.co\nSUPABASE_SERVICE_KEY=your-service-role-key`}
        </pre>
        <p className="mt-4 text-sm text-ink-faint">
          Locally: copy <code className="font-semibold">.env.example</code> to{" "}
          <code className="font-semibold">.env</code>. On Replit: add both as Secrets. Then restart
          the server — full walkthrough in the README.
        </p>
      </div>
    </div>
  );
}
