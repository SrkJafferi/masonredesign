import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function StatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Hidden",
}: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent",
        active ? "bg-success/12 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-success" : "bg-muted-foreground/60",
        )}
        aria-hidden
      />
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
