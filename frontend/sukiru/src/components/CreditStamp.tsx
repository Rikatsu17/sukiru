interface CreditStampProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  tone?: "stamp" | "ink" | "teel";
  className?: string;
}

const sizeClasses: Record<NonNullable<CreditStampProps["size"]>, string> = {
  sm: "px-3 py-1 text-[0.65rem] gap-1",
  md: "px-4 py-1.5 text-xs gap-1.5",
  lg: "px-6 py-3 text-sm gap-2",
};

const toneClasses: Record<NonNullable<CreditStampProps["tone"]>, string> = {
  stamp: "text-stamp-dark",
  ink: "text-ink",
  teel: "text-teel",
};

export function CreditStamp({
  label = "1 credit = 1 hour",
  size = "md",
  tone = "stamp",
  className = "",
}: CreditStampProps) {
  return (
    <span
      className={`credit-stamp ${sizeClasses[size]} ${toneClasses[tone]} ${className}`}
    >
      {label}
    </span>
  );
}
