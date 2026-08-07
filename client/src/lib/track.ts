export function track(slug: string, type: string, meta: Record<string, unknown> = {}) {
  fetch(`/api/public/deals/${slug}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, meta }),
  }).catch(() => {
    // Analytics must never break the proposal page.
  });
}

export function trackOncePerSession(
  slug: string,
  key: string,
  type: string,
  meta: Record<string, unknown> = {}
) {
  const storageKey = `dealroom:${slug}:${key}`;
  if (sessionStorage.getItem(storageKey)) return;
  sessionStorage.setItem(storageKey, "1");
  track(slug, type, meta);
}
