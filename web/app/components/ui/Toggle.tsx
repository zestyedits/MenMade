"use client";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
};

export function Toggle({ checked, onChange, label, description, disabled }: Props) {
  return (
    <label
      className={`flex items-start justify-between gap-6 py-4 ${
        disabled ? "opacity-50" : "cursor-pointer"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-bone">{label}</div>
        {description ? (
          <p className="mt-0.5 max-w-[60ch] text-[12.5px] leading-relaxed text-ink-300/75">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400/50 ${
          checked
            ? "border-ember-400 bg-ember-400"
            : "border-white/20 bg-ink-900"
        }`}
      >
        <span
          aria-hidden
          className={`inline-block h-3 w-3 transform transition ${
            checked ? "translate-x-[18px] bg-ink-950" : "translate-x-[2px] bg-bone"
          }`}
        />
      </button>
    </label>
  );
}
