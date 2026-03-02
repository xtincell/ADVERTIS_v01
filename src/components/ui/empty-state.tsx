// ==========================================================================
// UI — EmptyState
// Standardized empty state component used across all portals.
// ==========================================================================

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { type LucideIcon } from "lucide-react";

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "outline" | "ghost";
  icon?: LucideIcon;
  disabled?: boolean;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  const renderAction = (act: EmptyStateAction, key: string) => {
    const ActionIcon = act.icon;
    const btn = (
      <Button
        key={key}
        variant={act.variant ?? "default"}
        size={compact ? "sm" : "default"}
        onClick={act.onClick}
        disabled={act.disabled}
      >
        {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
        {act.label}
      </Button>
    );

    if (act.href) {
      return (
        <a key={key} href={act.href}>
          {btn}
        </a>
      );
    }
    return btn;
  };

  return (
    <div
      className={cn(
        "bg-mesh animate-scale-in flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-8" : "gap-3 py-16 border border-dashed border-border/50 rounded-2xl",
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted ring-1 ring-muted-foreground/10",
            compact ? "size-10" : "size-14",
          )}
        >
          <Icon
            className={cn(
              "text-muted-foreground",
              compact ? "size-5" : "size-6",
            )}
          />
        </div>
      )}
      <div className="space-y-1">
        <p
          className={cn(
            "font-medium text-foreground/80",
            compact ? "text-sm" : "text-base",
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "mx-auto max-w-sm text-muted-foreground",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-2 flex items-center gap-2">
          {action && renderAction(action, "primary")}
          {secondaryAction && renderAction(secondaryAction, "secondary")}
        </div>
      )}
    </div>
  );
}
