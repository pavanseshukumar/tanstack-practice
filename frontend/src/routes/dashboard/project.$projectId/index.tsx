import TaskCard from "@/components/TaskCard";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  getTasksFromStorage,
  getTasksByProjectId,
  saveTasksToStorage,
  type Task,
} from "@/lib/tasks";
import { getProjectById } from "@/lib/projects";
import { useEffect, useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getCurrentUserInitials(): string {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      const email = parsed?.email ?? "";
      return email.slice(0, 2).toUpperCase() || "U";
    }
  } catch {
    /* empty */
  }
  return "U";
}

export const Route = createFileRoute("/dashboard/project/$projectId/")({
  component: ProjectBoardPage,
});

const TASK_STATUSES = ["todo", "in progress", "review", "completed"] as const;
const COLUMN_ORDER: readonly string[] = [...TASK_STATUSES];
const columnMeta: Record<string, { label: string; accent: string }> = {
  todo: { label: "To do", accent: "border-zinc-300 bg-zinc-50/50" },
  "in progress": {
    label: "In progress",
    accent: "border-blue-200 bg-blue-50/30",
  },
  review: { label: "Review", accent: "border-amber-200 bg-amber-50/30" },
  completed: {
    label: "Completed",
    accent: "border-emerald-200 bg-emerald-50/30",
  },
};

function ProjectBoardPage() {
  const { projectId } = Route.useParams();
  const project = getProjectById(projectId);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskCreatedBy, setNewTaskCreatedBy] = useState("");
  const [newTaskAssigned, setNewTaskAssigned] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<string>("todo");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTasks(getTasksByProjectId(projectId));
    const id = setTimeout(() => setIsLoading(false), 80);
    return () => clearTimeout(id);
  }, [projectId]);

  const projectPeople = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => {
      if (t.assigned?.trim()) names.add(t.assigned.trim());
      if (t.createdBy?.trim()) names.add(t.createdBy.trim());
    });
    const current = getCurrentUserInitials();
    if (!names.size) return [{ id: "you", initials: current }];
    return Array.from(names).slice(0, 5).map((name, i) => ({
      id: String(i),
      initials: name.slice(0, 2).toUpperCase(),
    }));
  }, [tasks]);

  const persistProjectTasks = (projectTasks: Task[]) => {
    const all = getTasksFromStorage();
    const others = all.filter((t) => t.projectId !== projectId);
    saveTasksToStorage([...others, ...projectTasks]);
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t,
      );
      persistProjectTasks(next);
      return next;
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    const errors: string[] = [];
    if (!newTaskTitle.trim()) errors.push("Title is required.");
    if (newTaskTitle.length > 200)
      errors.push("Title must be 200 characters or less.");
    if (newTaskDescription.length > 1000)
      errors.push("Description must be 1000 characters or less.");
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    const allTasks = getTasksFromStorage();
    const nextId =
      allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.id)) + 1 : 1;
    const newTask: Task = {
      id: nextId,
      projectId,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      status: newTaskStatus,
      createdBy: newTaskCreatedBy.trim() || undefined,
      assigned: newTaskAssigned.trim() || undefined,
    };
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    persistProjectTasks(nextTasks);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskCreatedBy("");
    setNewTaskAssigned("");
    setNewTaskStatus("todo");
    setAddTaskOpen(false);
  };

  if (!project && !isLoading) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-zinc-100 p-4">
        <p className="text-zinc-600">Project not found.</p>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-zinc-100 min-h-full">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-4 w-20 bg-zinc-200/80" />
            <Skeleton className="h-3 w-3 rounded-full bg-zinc-200/80 hidden sm:block" />
            <div className="space-y-1">
              <Skeleton className="h-6 w-32 bg-zinc-200/80 sm:w-40" />
              <Skeleton className="h-4 w-40 bg-zinc-200/60 sm:w-48" />
            </div>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="size-6 rounded-full bg-zinc-200/80 ring-2 ring-zinc-100" />
            ))}
          </div>
        </div>
        <div className="px-4 pb-6 sm:px-6">
          <div
            className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:gap-4 lg:pb-0"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {COLUMN_ORDER.map((column) => {
              const meta = columnMeta[column] ?? { label: column, accent: "" };
              return (
                <div
                  key={column}
                  className={`rounded-xl border-2 ${meta.accent} flex min-h-[280px] flex-shrink-0 flex-col overflow-hidden w-[min(85vw,300px)] sm:w-[min(88vw,340px)] sm:min-h-[400px] lg:min-h-[520px] lg:min-w-0 lg:w-auto`}
                >
                  <div className="border-b border-inherit px-4 py-3">
                    <Skeleton className="h-4 w-16 bg-zinc-200/80" />
                    <Skeleton className="mt-1 h-3 w-12 bg-zinc-200/60" />
                  </div>
                  <div className="flex-1 p-3 space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-lg border border-zinc-200 bg-white p-4 space-y-2">
                        <Skeleton className="h-4 w-full bg-zinc-200/80" />
                        <Skeleton className="h-3 w-3/4 bg-zinc-200/60" />
                        <Skeleton className="h-3 w-1/3 bg-zinc-200/60" />
                        <Skeleton className="h-8 w-full rounded-md bg-zinc-200/60" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sheet open={addTaskOpen} onOpenChange={setAddTaskOpen}>
      <div className="relative bg-zinc-100 min-h-full">
        <header className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard"
              className="shrink-0 text-zinc-500 hover:text-zinc-900 text-sm transition-colors"
            >
              &larr; Projects
            </Link>
            <span className="shrink-0 text-zinc-300 hidden sm:inline">/</span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-zinc-900 tracking-tight sm:text-xl">
                {project.name}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5 sm:text-sm">
                {tasks.length} tasks across {COLUMN_ORDER.length} columns
              </p>
            </div>
          </div>
          <AvatarGroup className="flex shrink-0 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-zinc-100">
            {projectPeople.map((p) => (
              <Avatar key={p.id} size="sm">
                <AvatarFallback className="bg-zinc-300 text-zinc-700 text-xs font-medium">
                  {p.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </header>

        <div className="px-4 pb-24 sm:pb-6 sm:px-6">
          {/* Responsive: horizontal scroll on mobile/tablet, 4-col grid on lg+ */}
          <div
            className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible lg:gap-4 lg:snap-none lg:pb-0"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {COLUMN_ORDER.map((column) => {
              const meta = columnMeta[column] ?? { label: column, accent: "" };
              return (
                <div
                  key={column}
                  className={`rounded-xl border-2 ${meta.accent} flex min-h-[280px] flex-shrink-0 flex-col overflow-hidden sm:min-h-[400px] lg:min-h-[520px] lg:min-w-0 lg:w-auto w-[min(85vw,300px)] sm:w-[min(88vw,340px)] snap-start`}
                >
                  <div className="border-b border-inherit px-3 py-2 sm:px-4 sm:py-3">
                    <h2 className="text-xs font-semibold text-zinc-800 capitalize sm:text-sm">
                      {meta.label}
                    </h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5 sm:text-xs">
                      {tasks.filter((t) => t.status === column).length} tasks
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 sm:p-3 sm:space-y-3">
                    {tasks
                      .filter((task) => task.status === column)
                      .map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          projectId={projectId}
                          statusOptions={TASK_STATUSES}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAddTaskOpen(true)}
        className="fixed bottom-6 right-4 z-10 flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 sm:bottom-8 sm:right-8 sm:px-4"
        aria-label="Add task"
      >
        <Plus className="size-4" />
        Add task
      </button>

      <SheetContent className="w-full max-w-[calc(100vw-2rem)] border-zinc-200 bg-white sm:max-w-md">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-lg font-semibold text-zinc-900">
            New task
          </SheetTitle>
          <SheetDescription className="text-zinc-500 text-sm">
            Add a task to {project.name}. You can change status from the card
            later.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleAddTask} className="mt-6 space-y-5 px-4 pb-8 sm:px-6">
          {validationErrors.length > 0 && (
            <div
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              <p className="font-medium">Please fix the following:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {validationErrors.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-zinc-700 text-sm font-medium"
            >
              Title
            </Label>
            <input
              id="title"
              type="text"
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => {
                setNewTaskTitle(e.target.value);
                if (validationErrors.length) setValidationErrors([]);
              }}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-zinc-700 text-sm font-medium"
            >
              Description
            </Label>
            <input
              id="description"
              type="text"
              placeholder="Optional description"
              value={newTaskDescription}
              onChange={(e) => {
                setNewTaskDescription(e.target.value);
                if (validationErrors.length) setValidationErrors([]);
              }}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="createdBy"
              className="text-zinc-700 text-sm font-medium"
            >
              Created by
            </Label>
            <input
              id="createdBy"
              type="text"
              placeholder="e.g. Alice"
              value={newTaskCreatedBy}
              onChange={(e) => setNewTaskCreatedBy(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="assigned"
              className="text-zinc-700 text-sm font-medium"
            >
              Assigned to
            </Label>
            <input
              id="assigned"
              type="text"
              placeholder="e.g. Bob"
              value={newTaskAssigned}
              onChange={(e) => setNewTaskAssigned(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-700 text-sm font-medium">Status</Label>
            <Select value={newTaskStatus} onValueChange={setNewTaskStatus}>
              <SelectTrigger className="w-full rounded-lg border-zinc-300 bg-white text-zinc-900">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="border-zinc-200 bg-white">
                {TASK_STATUSES.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-colors"
          >
            Add task
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
