import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function StoryboardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-8">
      {/* Placeholder for Scene List */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-1/3 rounded-md" />
                <Skeleton className="h-6 w-1/6 rounded-md" />
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Card key={j} className="w-full">
                    <CardHeader>
                      <Skeleton className="h-5 w-1/2 rounded-md" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-32 w-full rounded-md" />
                      <div className="mt-4 flex items-center justify-between">
                        <Skeleton className="h-4 w-1/4 rounded-md" />
                        <Skeleton className="h-4 w-1/4 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
