import { createFileRoute, Link } from "@tanstack/react-router";
import { getProjectById } from "@/lib/projects";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/project/$projectId/settings")({
  component: ProjectSettingsPage,
});

function ProjectSettingsPage() {
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
          <Skeleton className="h-8 w-40 mb-2 bg-zinc-200/80" />
          <Skeleton className="h-4 w-56 mb-6 bg-zinc-200/60" />
          <div className="space-y-4 max-w-xl">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2">
                <Skeleton className="h-4 w-24 bg-zinc-200/80" />
                <Skeleton className="h-9 w-full bg-zinc-200/60" />
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
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Configure {project.name}.
        </p>
        <div className="mt-6 max-w-xl space-y-6 rounded-lg border border-zinc-200 bg-white p-6">
          <div>
            <h2 className="text-sm font-medium text-zinc-800">Project name</h2>
            <p className="mt-1 text-sm text-zinc-600">{project.name}</p>
          </div>
          {project.description && (
            <div>
              <h2 className="text-sm font-medium text-zinc-800">Description</h2>
              <p className="mt-1 text-sm text-zinc-600">{project.description}</p>
            </div>
          )}
          <p className="text-sm text-zinc-500">
            More settings (visibility, defaults, integrations) can be added here.
          </p>
        </div>
      </div>
    </div>
  );
}
