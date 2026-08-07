export default function Spinner() {
  return (
    <div
      className="h-8 w-8 animate-spin rounded-full border-[3px] border-ink/10 border-t-ember"
      role="status"
      aria-label="Loading"
    />
  );
}
