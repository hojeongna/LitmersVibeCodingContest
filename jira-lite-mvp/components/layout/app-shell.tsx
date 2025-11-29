"use client";

import { Suspense } from "react";
import { Sidebar } from "./sidebar";
import { Header, HeaderSkeleton } from "./header";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  className?: string;
}

function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex md:w-sidebar md:flex-col md:fixed md:inset-y-0 bg-sidebar">
      <div className="flex items-center gap-2 px-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-gradient">
          <span className="text-sm font-bold text-white">JL</span>
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          Jira Lite
        </span>
      </div>
      <div className="flex-1 space-y-2 px-3 py-4">
        <Skeleton className="h-10 w-full bg-sidebar-muted/20" />
        <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
        <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
        <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
      </div>
    </aside>
  );
}

export function AppShellSkeleton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarSkeleton />
      <div className="md:pl-sidebar flex flex-col min-h-screen">
        <HeaderSkeleton />
        <main className={cn("flex-1 p-4 md:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children, title, actions, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="md:pl-sidebar flex flex-col min-h-screen">
        {/* Header */}
        <Suspense fallback={<HeaderSkeleton />}>
          <Header title={title} actions={actions} />
        </Suspense>

        {/* Main Content */}
        <main className={cn("flex-1 p-4 md:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
