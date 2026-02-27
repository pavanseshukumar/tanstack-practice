import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, type CSSProperties } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarResizeProvider, useSidebarResize } from "@/contexts/SidebarResizeContext";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayoutInner() {
  const navigate = useNavigate();
  const resize = useSidebarResize();
  const sidebarWidth = resize?.width ?? 256;

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) navigate({ to: "/login" });
  }, [navigate]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
          "--sidebar-width-icon": "3rem",
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        {/* Mobile: header with menu trigger to open sidebar */}
        <header className="flex md:hidden h-12 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 sticky top-0 z-[9]">
          <SidebarTrigger className="-ml-1" aria-label="Open menu" />
          <span className="text-sm font-semibold text-zinc-800">TaskBoard</span>
        </header>
        <div className="flex-1 overflow-auto min-h-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function DashboardLayout() {
  return (
    <SidebarResizeProvider>
      <DashboardLayoutInner />
    </SidebarResizeProvider>
  );
}
