import Link from "next/link";

const sizes = {
  sm: { box: "h-7 w-7", letter: "text-[16px]", word: "text-[15px]", gap: "gap-2" },
  md: { box: "h-8 w-8", letter: "text-[18px]", word: "text-[17px]", gap: "gap-2.5" },
  lg: { box: "h-10 w-10", letter: "text-[22px]", word: "text-[21px]", gap: "gap-3" },
} as const;

type Props = {
  size?: keyof typeof sizes;
  href?: string | null;
  className?: string;
};

export function Logo({ size = "md", href = "/", className = "" }: Props) {
  const s = sizes[size];

  const inner = (
    <>
      <span
        className={`grid ${s.box} place-items-center bg-bone text-ink-950 transition-colors group-hover:bg-white`}
      >
        <span className={`font-sans ${s.letter} font-black leading-none`}>M</span>
      </span>
      <span
        className={`font-sans ${s.word} font-extrabold uppercase tracking-[0.02em] text-bone`}
      >
        Men<span className="text-ember-400">Made</span>
      </span>
    </>
  );

  const baseClass = `group inline-flex items-center ${s.gap} ${className}`;

  if (href === null) {
    return <span className={baseClass}>{inner}</span>;
  }

  return (
    <Link href={href} className={baseClass}>
      {inner}
    </Link>
  );
}
