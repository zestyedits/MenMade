type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-[12px]",
  lg: "h-12 w-12 text-[15px]",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type Props = {
  name: string;
  size?: Size;
  className?: string;
};

export function Avatar({ name, size = "md", className = "" }: Props) {
  return (
    <span
      aria-label={name}
      className={`inline-grid ${sizes[size]} place-items-center rounded-full bg-bone font-mono font-bold uppercase tracking-tight text-ink-950 ${className}`}
    >
      {initials(name)}
    </span>
  );
}
