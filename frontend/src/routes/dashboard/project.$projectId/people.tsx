import { createFileRoute, Link } from "@tanstack/react-router";
import { getProjectById } from "@/lib/projects";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/project/$projectId/people")({
  component: ProjectPeoplePage,
});

function ProjectPeoplePage() {
  const { projectId } = Route.useParams();
  const project = getProjectById(projectId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setIsLoading(false), 80);
    return () => clearTimeout(id);
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="min-h-full bg-zinc-100">
        <div className="px-4 py-4 sm:px-6">
          <Skeleton className="h-8 w-48 mb-2 bg-zinc-200/80" />
          <Skeleton className="h-4 w-64 mb-6 bg-zinc-200/60" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4">
                <Skeleton className="size-10 rounded-full bg-zinc-200/80" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-zinc-200/80" />
                  <Skeleton className="h-3 w-48 bg-zinc-200/60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-zinc-100 p-4">
        <p className="text-zinc-600">Project not found.</p>
        <Link to="/dashboard" className="text-sm font-medium text-zinc-900 hover:underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-100">
      <div className="px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">People</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Team members and collaborators for {project.name}.
        </p>
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">
            People and roles for this project will appear here. Connect your team directory or add members manually.
          </p>
        </div>
      </div>
    </div>
  );
}
