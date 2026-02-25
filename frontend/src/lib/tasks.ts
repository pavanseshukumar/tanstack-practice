const TASK_STORAGE_KEY = "taskboard_tasks";

export type Task = {
  id: number;
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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}
