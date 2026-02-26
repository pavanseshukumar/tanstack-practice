import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/project/$projectId")({
  component: ProjectLayout,
});

function ProjectLayout() {
  return <Outlet />;
}
