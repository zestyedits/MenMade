"use client";

type Option<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type Props<T extends string> = {
  legend: string;
  description?: string;
  value: T;
  options: Option<T>[];
  onChange: (next: T) => void;
};

export function RadioGroup<T extends string>({
  legend,
  description,
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-[14px] font-medium text-bone">{legend}</legend>
      {description ? (
        <p className="-mt-2 max-w-[60ch] text-[12.5px] leading-relaxed text-ink-300/75">
          {description}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => {
          const on = opt.value === value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 border px-4 py-3 transition ${
                on
                  ? "border-ember-400/60 bg-ember-400/[0.04]"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <input
                type="radio"
                name={legend}
                value={opt.value}
                checked={on}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 grid h-4 w-4 place-items-center rounded-full border ${
                  on ? "border-ember-400" : "border-white/30"
                }`}
              >
                {on ? (
                  <span className="h-2 w-2 rounded-full bg-ember-400" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[13.5px] font-medium text-bone">
                  {opt.label}
                </span>
                {opt.description ? (
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-300/75">
                    {opt.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
