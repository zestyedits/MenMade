import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = ComponentPropsWithoutRef<"input"> & {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  mono?: boolean;
};

export function Input({
  label,
  hint,
  error,
  mono = false,
  id,
  className = "",
  ...rest
}: Props) {
  const inputId = id ?? `i-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const describedBy = error
    ? `${inputId}-err`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className={
          mono
            ? "font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink-200/80"
            : "text-[13px] font-medium text-bone"
        }
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`block w-full bg-ink-900 border border-white/10 rounded-sm px-3.5 py-2.5 text-[14px] text-bone placeholder:text-ink-400 outline-none transition focus:border-ember-400/60 focus:ring-1 focus:ring-ember-400/30 ${
          error ? "border-ember-400/60" : ""
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p
          id={`${inputId}-err`}
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember-400"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-[12.5px] text-ink-300/80">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
