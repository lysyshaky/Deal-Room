import { useEffect, useRef } from "react";
import { trackOncePerSession } from "@/lib/track";

/**
 * Returns a ref for a <section>. Fires a section_view event (once per
 * session) when roughly a third of the section scrolls into view.
 */
export function useSectionRef(slug: string, section: string) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !slug) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          trackOncePerSession(slug, `section:${section}`, "section_view", { section });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [slug, section]);

  return ref;
}
