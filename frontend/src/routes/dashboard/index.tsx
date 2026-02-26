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
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    ensureDefaultProject();
    setProjects(getProjectsFromStorage());
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

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Projects
          </h1>
          <p className="text-sm text-zinc-500">
            Select a project to open its task board, or create a new one.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const taskCount = getTasksByProjectId(project.id).length;
            return (
              <Link
                key={project.id}
                to="/dashboard/project/$projectId"
                params={{ projectId: project.id }}
                className="group flex min-h-[152px] flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
              >
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 transition-colors">
                      <FolderOpen className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <h2 className="font-semibold text-zinc-900 truncate">
                        {project.name}
                      </h2>
                      <div className="min-h-[2.5rem]">
                        {project.description ? (
                          <p className="text-sm text-zinc-500 line-clamp-2">
                            {project.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <ListTodo className="size-3.5 shrink-0" />
                        <span>{taskCount} task{taskCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="mt-4 inline-flex text-sm font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors">
                  Open board →
                </span>
              </Link>
            );
          })}

          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex min-h-[152px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white p-5 text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-zinc-100">
                  <Plus className="size-5" />
                </div>
                <span className="text-sm font-medium">New project</span>
              </button>
            </SheetTrigger>
            <SheetContent className="border-zinc-200 bg-white sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="text-zinc-900">Create project</SheetTitle>
                <SheetDescription className="text-zinc-500">
                  Add a project to organize tasks. You can open its task board
                  right after.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleCreateProject} className="space-y-4 py-6 px-1">
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
        </div>

        {projects.length === 0 && (
          <div className="mt-12 rounded-xl border border-zinc-200 bg-white p-8 text-center">
            <FolderOpen className="mx-auto size-12 text-zinc-300" />
            <h2 className="mt-4 text-lg font-medium text-zinc-900">
              No projects yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
              Create your first project to start organizing tasks on a board.
            </p>
            <Button
              className="mt-6 bg-zinc-900 hover:bg-zinc-800"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4 mr-2" />
              Create project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
