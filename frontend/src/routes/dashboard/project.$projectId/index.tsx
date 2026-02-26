import TaskCard from "@/components/TaskCard";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  getTasksFromStorage,
  getTasksByProjectId,
  saveTasksToStorage,
  type Task,
} from "@/lib/tasks";
import { getProjectById } from "@/lib/projects";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  useEffect(() => {
    setTasks(getTasksByProjectId(projectId));
  }, [projectId]);

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
  };

  if (!project) {
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

  return (
    <Sheet>
      <div className="bg-zinc-100 min-h-full">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-zinc-500 hover:text-zinc-900 text-sm transition-colors"
            >
              &larr; Projects
            </Link>
            <span className="text-zinc-300">/</span>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
                {project.name}
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">
                {tasks.length} tasks across {COLUMN_ORDER.length} columns
              </p>
            </div>
          </div>
          <SheetTrigger asChild>
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-colors">
              + Add task
            </button>
          </SheetTrigger>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMN_ORDER.map((column) => {
              const meta = columnMeta[column] ?? { label: column, accent: "" };
              return (
                <div
                  key={column}
                  className={`rounded-xl border-2 ${meta.accent} flex min-h-[520px] flex-col overflow-hidden`}
                >
                  <div className="border-b border-inherit px-4 py-3">
                    <h2 className="text-sm font-semibold text-zinc-800 capitalize">
                      {meta.label}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {tasks.filter((t) => t.status === column).length} tasks
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
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

      <SheetContent className="w-full max-w-md border-zinc-200 bg-white sm:max-w-md">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-lg font-semibold text-zinc-900">
            New task
          </SheetTitle>
          <SheetDescription className="text-zinc-500 text-sm">
            Add a task to {project.name}. You can change status from the card
            later.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleAddTask} className="mt-6 space-y-5 px-6 pb-8">
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
