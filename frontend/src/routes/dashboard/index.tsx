import TaskCard from "@/components/TaskCard";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

const initialTasks = [
  { id: 1, title: "Task 1", description: "Description 1", status: "todo" },
  { id: 2, title: "Task 2", description: "Description 2", status: "todo" },
  { id: 3, title: "Task 3", description: "Description 3", status: "in progress" },
  { id: 4, title: "Task 4", description: "Description 4", status: "review" },
  { id: 5, title: "Task 5", description: "Description 5", status: "completed" },
  { id: 6, title: "Task 6", description: "Description 6", status: "todo" },
  { id: 7, title: "Task 7", description: "Description 7", status: "in progress" },
  { id: 8, title: "Task 8", description: "Description 8", status: "review" },
  { id: 9, title: "Task 9", description: "Description 9", status: "completed" },
  { id: 10, title: "Task 10", description: "Description 10", status: "todo" },
];

type Task = (typeof initialTasks)[number];

const TASK_STATUSES = ["todo", "in progress", "review", "completed"] as const;

const columnMeta: Record<string, { label: string; accent: string }> = {
  todo: { label: "To do", accent: "border-zinc-300 bg-zinc-50/50" },
  "in progress": { label: "In progress", accent: "border-blue-200 bg-blue-50/30" },
  review: { label: "Review", accent: "border-amber-200 bg-amber-50/30" },
  completed: { label: "Completed", accent: "border-emerald-200 bg-emerald-50/30" },
};

function RouteComponent() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<string>("todo");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    setTasks(initialTasks);
    const cols = [...new Set(initialTasks.map((task) => task.status))];
    setColumns(cols);
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) navigate({ to: "/login" });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate({ to: "/login" });
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    const errors: string[] = [];
    if (!newTaskTitle.trim()) errors.push("Title is required.");
    if (newTaskTitle.length > 200) errors.push("Title must be 200 characters or less.");
    if (newTaskDescription.length > 1000) errors.push("Description must be 1000 characters or less.");
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    const newTask: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      status: newTaskStatus,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskStatus("todo");
  };

  return (
    <Sheet>
      <div className="min-h-screen bg-zinc-100">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
              Task board
            </h1>
            <div className="flex items-center gap-3">
              <SheetTrigger asChild>
                <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-colors">
                  Add task
                </button>
              </SheetTrigger>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-6">
          <div className="grid grid-cols-4 gap-4">
            {columns.map((column) => {
              const meta = columnMeta[column] ?? { label: column, accent: "" };
              return (
                <div
                  key={column}
                  className={`rounded-xl border ${meta.accent} flex min-h-[520px] flex-col overflow-hidden`}
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
                          statusOptions={TASK_STATUSES}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <SheetContent className="w-full max-w-md border-zinc-200 bg-white sm:max-w-md">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-lg font-semibold text-zinc-900">
            New task
          </SheetTitle>
          <SheetDescription className="text-zinc-500 text-sm">
            Add a task and assign a status. You can change it from the card later.
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
            <Label htmlFor="title" className="text-zinc-700 text-sm font-medium">
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
            <Label htmlFor="description" className="text-zinc-700 text-sm font-medium">
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
