import { LucideIcon, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

const EmptyState = ({
  icon: Icon = Coffee,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-lg border border-dashed border-border bg-muted/30">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Button asChild>
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !actionTo && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
