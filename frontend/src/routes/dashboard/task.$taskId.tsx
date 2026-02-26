import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getTasksFromStorage,
  saveTasksToStorage,
  type Task,
} from "@/lib/tasks";

const TASK_STATUSES = ["todo", "in progress", "review", "completed"] as const;

export const Route = createFileRoute("/dashboard/task/$taskId")({
  component: TaskDetailComponent,
});

const statusColors: Record<string, string> = {
  todo: "bg-zinc-100 text-zinc-700 border-zinc-200",
  "in progress": "bg-blue-50 text-blue-700 border-blue-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function TaskDetailComponent() {
  const { taskId } = Route.useParams();
  const id = Number(taskId);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tasks = getTasksFromStorage();
    const found = tasks.find((t) => t.id === id);
    setTask(found ?? null);
    setLoading(false);
  }, [id]);

  const handleStatusChange = (newStatus: string) => {
    if (!task) return;
    const tasks = getTasksFromStorage();
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, status: newStatus } : t
    );
    saveTasksToStorage(updated);
    setTask((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-zinc-100">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (task === null) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-zinc-100 p-4">
        <p className="text-zinc-600">Task not found.</p>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          Back to board
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-100">
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to="/dashboard"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          &larr; Back to board
        </Link>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusColors[task.status] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"}`}
        >
          {task.status}
        </span>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            {task.title}
          </h1>
          {task.description ? (
            <p className="mt-3 text-zinc-600 leading-relaxed">
              {task.description}
            </p>
          ) : (
            <p className="mt-3 text-zinc-400 text-sm">No description.</p>
          )}
          {(task.assigned || task.createdBy) && (
            <div className="mt-4 flex flex-col gap-2 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
              {task.assigned && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-500">Assigned to:</span>
                  <span className="text-sm text-zinc-900">{task.assigned}</span>
                </div>
              )}
              {task.createdBy && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-500">Created by:</span>
                  <span className="text-sm text-zinc-900">{task.createdBy}</span>
                </div>
              )}
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-zinc-200">
            <Label className="text-zinc-700 text-sm font-medium">Status</Label>
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger
                className={`mt-2 w-full max-w-xs ${statusColors[task.status] ?? "bg-zinc-100 text-zinc-700 border-zinc-200"}`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-200 bg-white">
                {TASK_STATUSES.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="capitalize"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
