const TASK_STORAGE_KEY = "taskboard_tasks";
const DEFAULT_PROJECT_ID_KEY = "taskboard_default_project_id";

export type Task = {
  id: number;
  projectId: string;
  title: string;
  description: string;
  status: string;
  createdBy?: string;
  assigned?: string;
};

export function getTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(TASK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    return migrateTasks(list);
  } catch {
    return [];
  }
}

function migrateTasks(list: unknown[]): Task[] {
  const defaultProjectId =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(DEFAULT_PROJECT_ID_KEY)
      : null;
  const tasks = list.map((t: Record<string, unknown>) => {
    const task = t as Partial<Task> & { projectId?: string };
    if (!task.projectId && defaultProjectId) {
      return { ...task, projectId: defaultProjectId } as Task;
    }
    if (!task.projectId) {
      return { ...task, projectId: "default" } as Task;
    }
    return task as Task;
  });
  return tasks as Task[];
}

export function getTasksByProjectId(projectId: string): Task[] {
  return getTasksFromStorage().filter((t) => t.projectId === projectId);
}

export function saveTasksToStorage(tasks: Task[]): void {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

export function setDefaultProjectIdForMigration(projectId: string): void {
  localStorage.setItem(DEFAULT_PROJECT_ID_KEY, projectId);
}
