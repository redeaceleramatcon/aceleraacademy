import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  variant = "rounded",
  className,
}: {
  value: number;
  variant?: "rounded" | "flush";
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "w-full overflow-hidden bg-white/15",
        variant === "rounded" ? "h-1.5 rounded-full" : "h-[3px]",
        className
      )}
    >
      <div
        className="h-full bg-brand-orange transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
