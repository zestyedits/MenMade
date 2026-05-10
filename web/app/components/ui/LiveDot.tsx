type Props = {
  label?: string;
  className?: string;
};

export function LiveDot({ label, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="relative flex h-2 w-2"
        role="presentation"
        aria-hidden
      >
        <span className="pulse-ring absolute inset-0 rounded-full bg-ember-400" />
        <span className="relative h-2 w-2 rounded-full bg-ember-400" />
      </span>
      {label ? (
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink-300/70">
          {label}
        </span>
      ) : null}
    </span>
  );
}
