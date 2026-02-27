import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getProjectsFromStorage,
  saveProjectsToStorage,
  createProject,
  type Project,
} from "@/lib/projects";
import {
  getTasksFromStorage,
  getTasksByProjectId,
  saveTasksToStorage,
  setDefaultProjectIdForMigration,
} from "@/lib/tasks";
import { FolderOpen, Plus, ListTodo } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard/")({
  component: ProjectsListPage,
});

// Ensure existing tasks have a home: create default project if we have tasks but no projects
function ensureDefaultProject() {
  const projects = getProjectsFromStorage();
  const tasks = getTasksFromStorage();
  if (projects.length > 0) return;
  if (tasks.length === 0) return;
  const defaultProject: Project = {
    id: "default",
    name: "Default Project",
    description: "Tasks migrated from the original board.",
    createdAt: Date.now(),
  };
  const stored = getProjectsFromStorage();
  if (stored.some((p) => p.id === "default")) return;
  setDefaultProjectIdForMigration("default");
  saveProjectsToStorage([...stored, defaultProject]);
  // Persist migrated tasks (with projectId "default") to storage
  saveTasksToStorage(getTasksFromStorage());
}

function ProjectsListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    ensureDefaultProject();
    setProjects(getProjectsFromStorage());
    const id = setTimeout(() => setIsLoading(false), 80);
    return () => clearTimeout(id);
  }, []);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    const name = newName.trim();
    if (!name) {
      setCreateError("Project name is required.");
      return;
    }
    if (name.length > 100) {
      setCreateError("Name must be 100 characters or less.");
      return;
    }
    const project = createProject(name, newDescription.trim() || undefined);
    setProjects(getProjectsFromStorage());
    setNewName("");
    setNewDescription("");
    setCreateOpen(false);
    navigate({ to: "/dashboard/project/$projectId", params: { projectId: project.id } });
  };

  const noteRotations = [
    "rotate-[-2deg]",
    "rotate-[1.5deg]",
    "rotate-[-1deg]",
    "rotate-[2deg]",
    "rotate-[-1.5deg]",
    "rotate-[1deg]",
  ];
  const noteColors = [
    "bg-amber-50 border-amber-200/80 shadow-amber-200/20",
    "bg-sky-50/90 border-sky-200/80 shadow-sky-200/20",
    "bg-rose-50/90 border-rose-200/80 shadow-rose-200/20",
    "bg-emerald-50/90 border-emerald-200/80 shadow-emerald-200/20",
    "bg-violet-50/90 border-violet-200/80 shadow-violet-200/20",
    "bg-amber-50 border-amber-200/80 shadow-amber-200/20",
  ];

  if (isLoading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-100">
        <div className="mr-auto max-w-6xl pl-20 pr-6 py-10">
          <header className="mb-12">
            <Skeleton className="h-9 w-48 bg-stone-200/80" />
            <Skeleton className="mt-2 h-5 w-80 max-w-md bg-stone-200/60" />
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex min-h-[220px] flex-col rounded-sm border-2 border-stone-200/60 bg-white/80 p-6"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-lg bg-stone-200/80" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-stone-200/80" />
                    <Skeleton className="h-4 w-full bg-stone-200/60" />
                    <Skeleton className="h-4 w-2/3 bg-stone-200/60" />
                    <Skeleton className="mt-3 h-4 w-20 bg-stone-200/60" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-4 w-24 bg-stone-200/60" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-stone-100 via-amber-50/40 to-stone-100">
      <div className="mr-auto max-w-6xl pl-20 pr-6 py-10">
        <header className="mb-12">
          <h1 className="text-[32px] font-bold text-stone-800 tracking-tight">
            Projects
          </h1>
          <p className="mt-2 text-base text-stone-500 max-w-md">
            Pick a note to open its board, or pin a new one.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex w-full min-h-[220px] flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-stone-300 bg-white/60 p-6 text-stone-500 transition-all duration-200 hover:rotate-0 hover:border-stone-400 hover:bg-white/80 hover:text-stone-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-4"
                style={{ transform: "rotate(1.5deg)" }}
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-stone-100">
                  <Plus className="size-6" />
                </div>
                <span className="text-base font-medium">New project</span>
                <span className="text-sm text-stone-400">Pin a new note</span>
              </button>
            </SheetTrigger>
            <SheetContent className="border-zinc-200 bg-white sm:max-w-md">
              <SheetHeader className="space-y-1">
                <SheetTitle className="text-lg font-semibold text-zinc-900">Create project</SheetTitle>
                <SheetDescription className="text-zinc-500 text-sm">
                  Add a project to organize tasks. You can open its task board
                  right after.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleCreateProject} className="mt-6 space-y-5 px-6 pb-8">
                {createError && (
                  <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {createError}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-zinc-700">
                    Name
                  </Label>
                  <input
                    id="project-name"
                    type="text"
                    placeholder="e.g. Website redesign"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setCreateError("");
                    }}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-desc" className="text-zinc-700">
                    Description (optional)
                  </Label>
                  <textarea
                    id="project-desc"
                    placeholder="Short description of the project"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-zinc-900 hover:bg-zinc-800">
                    Create & open board
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>

          {projects.map((project, i) => {
            const taskCount = getTasksByProjectId(project.id).length;
            const rotation = noteRotations[i % noteRotations.length];
            const colors = noteColors[i % noteColors.length];
            return (
              <Link
                key={project.id}
                to="/dashboard/project/$projectId"
                params={{ projectId: project.id }}
                className="group block w-full"
              >
                <div
                  className={`relative flex min-h-[220px] flex-col rounded-sm border-2 ${colors} p-6 shadow-lg transition-transform duration-200 hover:rotate-0 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-4 focus:ring-offset-transparent ${rotation}`}
                  style={{ boxShadow: "4px 6px 12px rgba(0,0,0,0.08)" }}
                >
                  <div className="absolute right-2 top-2 h-4 w-4 rounded-full bg-stone-300/40 group-hover:bg-stone-400/50" title="Pin" />
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <h2 className="text-lg font-semibold text-stone-800 truncate pr-4">
                      {project.name}
                    </h2>
                    <div className="min-h-[3.75rem]">
                      {project.description ? (
                        <p className="text-base text-stone-600 line-clamp-3">
                          {project.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-auto flex items-center gap-1.5 text-sm text-stone-500">
                      <ListTodo className="size-3.5 shrink-0" />
                      <span>{taskCount} task{taskCount !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <span className="mt-3 inline-flex text-base font-medium text-stone-600 group-hover:text-stone-800 transition-colors">
                    Open board →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="mx-auto mt-16 max-w-sm rounded-sm border-2 border-dashed border-stone-300 bg-white/70 p-10 text-center shadow-md" style={{ transform: "rotate(-0.5deg)" }}>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-stone-100">
              <FolderOpen className="size-7 text-stone-500" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-stone-800">
              No notes yet
            </h2>
            <p className="mt-2 text-base text-stone-500">
              Pin your first project to get started.
            </p>
            <Button
              className="mt-6 bg-stone-800 hover:bg-stone-700"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4 mr-2" />
              New project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
