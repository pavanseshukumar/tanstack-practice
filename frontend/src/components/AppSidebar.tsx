import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ListTodo, LogOut, LayoutDashboard, Users, Settings, ListChecks, X } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebarResize } from "@/contexts/SidebarResizeContext";
import { getProjectsFromStorage, getProjectById, type Project } from "@/lib/projects";

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

const PROJECT_SELECT_ALL = "__all__";

function getCurrentProjectId(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/project\/([^/]+)/);
  return match ? match[1] : null;
}

const PROJECT_PAGES = [
  { path: "" as const, label: "Board", icon: LayoutDashboard },
  { path: "people" as const, label: "People", icon: Users },
  { path: "settings" as const, label: "Settings", icon: Settings },
  { path: "backlog" as const, label: "Backlog", icon: ListChecks },
] as const;

export function AppSidebar() {
  const navigate = useNavigate();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "";
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const currentProjectId = getCurrentProjectId(currentPath);
  const resize = useSidebarResize();
  const { isMobile, state, setOpenMobile } = useSidebar();
  const isExpanded = state === "expanded";
  const dragRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    setProjects(getProjectsFromStorage());
    const id = setTimeout(() => setSidebarLoading(false), 80);
    return () => clearTimeout(id);
  }, [currentPath]);

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current || !resize) return;
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.round(startWidthRef.current + delta);
      resize.setWidth(newWidth);
    },
    [resize]
  );

  const handleResizeEnd = useCallback(() => {
    dragRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!resize || isMobile) return;
      e.preventDefault();
      dragRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = resize.width;
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    },
    [resize, isMobile, handleResizeMove, handleResizeEnd]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  const email = getUserEmail();
  const initials = getInitials(email);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate({ to: "/login" });
  };

  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <SidebarHeader className="px-4 py-5 border-b border-zinc-200 shrink-0">
            <div className="flex items-center gap-2.5 w-full">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white">
                <ListTodo className="size-4" />
              </div>
              <span className="text-base font-semibold tracking-tight text-zinc-900 group-data-[collapsible=icon]:hidden flex-1 min-w-0">
                TaskBoard
              </span>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={closeMobileSidebar}
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="min-h-0 flex-1 overflow-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-zinc-500">Project</SidebarGroupLabel>
            <SidebarGroupContent>
              {sidebarLoading ? (
                <div className="px-2 py-1">
                  <Skeleton className="h-9 w-full rounded-md bg-zinc-200/80" />
                </div>
              ) : (
                <Select
                  value={currentProjectId ?? PROJECT_SELECT_ALL}
                  onValueChange={(value) => {
                    closeMobileSidebar();
                    if (value === PROJECT_SELECT_ALL) {
                      navigate({ to: "/dashboard" });
                    } else {
                      navigate({ to: "/dashboard/project/$projectId", params: { projectId: value } });
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-md border-zinc-200 bg-white/80 text-zinc-900 group-data-[collapsible=icon]:hidden">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent align="start" className="max-h-[min(60vh,400px)]">
                    <SelectItem value={PROJECT_SELECT_ALL} className="capitalize">
                      All projects
                    </SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <span className="truncate">{project.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {currentProjectId && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs text-zinc-500">Pages</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {PROJECT_PAGES.map(({ path, label, icon: Icon }) => {
                    const isIndex = path === "";
                    const isActive =
                      isIndex
                        ? currentPath === `/dashboard/project/${currentProjectId}` || currentPath === `/dashboard/project/${currentProjectId}/`
                        : currentPath === `/dashboard/project/${currentProjectId}/${path}`;
                    return (
                      <SidebarMenuItem key={path || "board"}>
                        <SidebarMenuButton
                          asChild
                          isActive={!!isActive}
                          tooltip={label}
                        >
                          {isIndex ? (
                            <Link
                              to="/dashboard/project/$projectId"
                              params={{ projectId: currentProjectId }}
                              onClick={closeMobileSidebar}
                            >
                              <Icon className="size-4" />
                              <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                            </Link>
                          ) : (
                            <Link
                              to={`/dashboard/project/$projectId/${path}`}
                              params={{ projectId: currentProjectId }}
                              onClick={closeMobileSidebar}
                            >
                              <Icon className="size-4" />
                              <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                            </Link>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="px-3 py-3 border-t border-zinc-200 shrink-0 mt-auto">
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
        </div>

        {!isMobile && isExpanded && resize && (
          <div
            role="separator"
            aria-label="Resize sidebar"
            onMouseDown={handleResizeStart}
            className="absolute top-0 right-0 bottom-0 z-30 w-1.5 cursor-ew-resize hover:bg-zinc-300/50 active:bg-zinc-400/50 transition-colors rounded-r group-data-[side=right]:left-0 group-data-[side=right]:right-auto"
          />
        )}
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
