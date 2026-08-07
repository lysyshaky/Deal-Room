import { animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Smoothly tweens toward `value` whenever it changes. */
export function useAnimatedNumber(value: number): number {
  const [display, setDisplay] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) return;
    const controls = animate(previous.current, value, {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value]);

  return display;
}
