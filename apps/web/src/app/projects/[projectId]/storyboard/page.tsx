import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { StoryboardContainer } from "./_components/storyboard-container";

export default function StoryboardPage() {
  return (
    <main className="flex h-full w-full flex-col p-6">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        }
      >
        <StoryboardContainer />
      </Suspense>
    </main>
  );
}
