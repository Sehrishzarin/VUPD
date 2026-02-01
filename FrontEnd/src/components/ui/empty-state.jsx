import { cn } from "@/lib/utils";

export const EmptyState = ({ 
  icon: Icon, 
  title = "No data available", 
  description = "There's nothing to display here yet.",
  action,
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      {Icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

