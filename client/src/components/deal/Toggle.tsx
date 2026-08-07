import { motion } from "framer-motion";

interface Props {
  on: boolean;
  onToggle: () => void;
  label: string;
}

export default function Toggle({ on, onToggle, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-7 w-12 flex-none rounded-full p-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 ${
        on ? "bg-ember" : "bg-ink/15"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className={`block h-5 w-5 rounded-full bg-white shadow ${on ? "ml-auto" : ""}`}
      />
    </button>
  );
}
