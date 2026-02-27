import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ListTodo, LogOut, FolderOpen } from "lucide-react";
import { Link, useMatches } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjectsFromStorage, type Project } from "@/lib/projects";

function getUserEmail(): string {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.email ?? "user@example.com";
    }
  } catch {
    /* empty */
  }
  return "user@example.com";
}

function getInitials(email: string): string {
  const name = email.split("@")[0] ?? "";
  return name.slice(0, 2).toUpperCase();
}

function LogoutConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-50 w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-zinc-900">Log out?</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Are you sure you want to log out? You'll need to sign in again to
          access your tasks.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="default"
            className="bg-red-600 hover:bg-red-700"
            onClick={onConfirm}
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}

function getCurrentProjectId(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/project\/([^/]+)/);
  return match ? match[1] : null;
}

export function AppSidebar() {
  const navigate = useNavigate();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "";
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const currentProjectId = getCurrentProjectId(currentPath);

  useEffect(() => {
    setProjects(getProjectsFromStorage());
    const id = setTimeout(() => setSidebarLoading(false), 80);
    return () => clearTimeout(id);
  }, [currentPath]);

  const email = getUserEmail();
  const initials = getInitials(email);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate({ to: "/login" });
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-4 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white">
              <ListTodo className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-zinc-900 group-data-[collapsible=icon]:hidden">
              TaskBoard
            </span>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-zinc-500">Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              {sidebarLoading ? (
                <div className="flex flex-col gap-2 px-2 py-1">
                  <div className="flex items-center gap-2 rounded-md px-2 py-2">
                    <Skeleton className="size-4 shrink-0 rounded bg-zinc-200/80" />
                    <Skeleton className="h-4 w-24 bg-zinc-200/80" />
                  </div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md px-2 py-2">
                      <Skeleton className="size-4 shrink-0 rounded bg-zinc-200/80" />
                      <Skeleton className="h-4 w-full max-w-[140px] bg-zinc-200/60" />
                    </div>
                  ))}
                </div>
              ) : (
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={currentPath === "/dashboard" || currentPath === "/dashboard/"}
                      tooltip="All projects"
                    >
                      <Link to="/dashboard">
                        <FolderOpen className="size-4" />
                        <span>All projects</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {projects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={currentProjectId === project.id}
                        tooltip={project.name}
                      >
                        <Link
                          to="/dashboard/project/$projectId"
                          params={{ projectId: project.id }}
                        >
                          <ListTodo className="size-4" />
                          <span className="truncate">{project.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="px-3 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="gap-3"
                onClick={() => setShowLogoutConfirm(true)}
                tooltip="Log out"
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-zinc-200 text-zinc-700 text-[10px] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-left leading-tight">
                  <span className="truncate text-sm font-medium">{email}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <LogOut className="size-3" />
                    Log out
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
