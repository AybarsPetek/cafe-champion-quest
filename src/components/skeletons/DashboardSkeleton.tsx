import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="mb-8 md:mb-12 space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-soft">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-12 shadow-soft">
        <CardContent className="pt-6 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>

      <div className="mb-12 space-y-4">
        <Skeleton className="h-7 w-48" />
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="shadow-soft">
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
