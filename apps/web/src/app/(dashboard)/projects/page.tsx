"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@repo/convex/api";
import { usePaginatedQuery } from "convex/react";
import { FolderOpen } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.project.list,
    {},
    { initialNumItems: 10 },
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
      </div>

      {results.length === 0 && status === "Exhausted" ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FolderOpen className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-muted-foreground text-sm">
            Create your first project to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}/storyboard`}
              className="transition-transform hover:scale-[1.02]"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="truncate">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-xs">
                    Created{" "}
                    {new Date(project._creationTime).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {status === "CanLoadMore" && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              loadMore(10);
            }}
            className="text-sm font-medium hover:underline"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
