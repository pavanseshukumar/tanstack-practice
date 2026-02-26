const PROJECT_STORAGE_KEY = "taskboard_projects";

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
};

export function getProjectsFromStorage(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProjectsToStorage(projects: Project[]): void {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(name: string, description?: string): Project {
  const projects = getProjectsFromStorage();
  const id = crypto.randomUUID();
  const project: Project = {
    id,
    name: name.trim(),
    description: description?.trim(),
    createdAt: Date.now(),
  };
  projects.push(project);
  saveProjectsToStorage(projects);
  return project;
}

export function getProjectById(id: string): Project | undefined {
  return getProjectsFromStorage().find((p) => p.id === id);
}

export function updateProject(
  id: string,
  updates: Partial<Pick<Project, "name" | "description">>
): Project | null {
  const projects = getProjectsFromStorage();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], ...updates };
  saveProjectsToStorage(projects);
  return projects[idx];
}

export function deleteProject(id: string): boolean {
  const projects = getProjectsFromStorage().filter((p) => p.id !== id);
  if (projects.length === getProjectsFromStorage().length) return false;
  saveProjectsToStorage(projects);
  return true;
}
