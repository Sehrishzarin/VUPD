import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CardSkeleton = ({ count = 3, cols = null, showIcon = false, showProgress = false }) => {
  const gridCols = cols || (count === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3');
  
  return (
    <div className={`grid ${gridCols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {showIcon && <Skeleton className="h-4 w-4 rounded" />}
              <Skeleton className="h-8 w-24" />
            </div>
            {showProgress && (
              <>
                <Skeleton className="h-1 w-full mt-2" />
                {i === 1 && <Skeleton className="h-3 w-16 mt-2" />}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Specific skeleton for dashboard stats cards with icons
export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              <Skeleton className="h-4 w-24" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Specific skeleton for payment stats cards with progress bars
export const PaymentStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              <Skeleton className="h-4 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-1 w-full" />
            {i === 1 && <Skeleton className="h-3 w-20 mt-2" />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Specific skeleton for admin dashboard metrics
export const AdminMetricsSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

