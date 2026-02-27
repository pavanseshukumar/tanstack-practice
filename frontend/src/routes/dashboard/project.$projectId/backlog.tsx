import { createFileRoute, Link } from "@tanstack/react-router";
import { getProjectById } from "@/lib/projects";
import { getTasksByProjectId } from "@/lib/tasks";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/project/$projectId/backlog")({
  component: ProjectBacklogPage,
});

function ProjectBacklogPage() {
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
          <Skeleton className="h-8 w-36 mb-2 bg-zinc-200/80" />
          <Skeleton className="h-4 w-52 mb-6 bg-zinc-200/60" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3">
                <Skeleton className="size-4 shrink-0 rounded bg-zinc-200/80" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4 bg-zinc-200/80" />
                  <Skeleton className="h-3 w-1/2 bg-zinc-200/60" />
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

  const tasks = getTasksByProjectId(projectId);

  return (
    <div className="min-h-full bg-zinc-100">
      <div className="px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Backlog</h1>
        <p className="mt-1 text-sm text-zinc-500">
          All tasks in {project.name} in one list.
        </p>
        <div className="mt-6 space-y-2">
          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              No tasks yet. Add tasks from the Board.
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3"
              >
                <span className="text-xs font-medium text-zinc-400 capitalize">{task.status}</span>
                <span className="flex-1 font-medium text-zinc-900">{task.title}</span>
                {task.assigned && (
                  <span className="text-xs text-zinc-500">{task.assigned}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
