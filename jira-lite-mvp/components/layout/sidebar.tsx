"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Bell,
  ChevronDown,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamList } from "@/components/teams/team-list";
import { TeamCreateModal } from "@/components/teams/team-create-modal";
import { ProjectCreateModal } from "@/components/projects/project-create-modal";
import { useTeams } from "@/hooks/use-teams";
import { useProjects } from "@/hooks/use-projects";
import { getTeamColor } from "@/types/team";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: "대시보드", href: "/", icon: LayoutDashboard },
];

function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex md:w-sidebar md:flex-col md:fixed md:inset-y-0 bg-sidebar">
      <div className="flex items-center gap-2 px-3 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-gradient">
          <span className="text-sm font-bold text-white">L</span>
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          Litmers
        </span>
      </div>
      <Separator className="bg-sidebar-muted/30" />
      <div className="px-3 py-3">
        <Skeleton className="h-10 w-full bg-sidebar-muted/20" />
      </div>
      <div className="flex-1 space-y-2 px-3 py-2">
        <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
        <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
        <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
      </div>
    </aside>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: allProjects, isLoading: projectsLoading } = useProjects();

  // Get active team from URL
  const getActiveTeamId = (): string | null => {
    const match = pathname.match(/\/teams\/([^/]+)/);
    return match ? match[1] : null;
  };

  const activeTeamId = getActiveTeamId();
  const activeTeam = teams?.find((t) => t.id === activeTeamId);

  // Default to first team if no team is selected
  const selectedTeam = activeTeam || (teams && teams.length > 0 ? teams[0] : null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleTeamSelect = (teamId: string) => {
    setIsMobileOpen(false);
    router.push(`/teams/${teamId}`);
  };

  const handleCreateTeamSuccess = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  // 활성 프로젝트만 필터링 (아카이브되지 않은 것)
  const activeProjects = allProjects?.filter((p) => !p.is_archived) || [];

  // 현재 선택된 팀의 프로젝트만 표시
  const teamProjects = selectedTeam
    ? activeProjects.filter((p) => p.team_id === selectedTeam.id)
    : [];

  const NavLink = ({ item }: { item: NavItem }) => (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive(item.href)
          ? "bg-sidebar-active text-white"
          : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground"
      )}
      onClick={() => setIsMobileOpen(false)}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      {item.badge && item.badge > 0 && (
        <Badge
          variant="destructive"
          className="ml-auto h-5 min-w-[20px] px-1.5 text-xs"
        >
          {item.badge > 99 ? "99+" : item.badge}
        </Badge>
      )}
    </Link>
  );

  const TeamSelector = () => {
    if (teamsLoading) {
      return (
        <div className="px-3 py-3">
          <Skeleton className="h-10 w-full bg-sidebar-muted/20" />
        </div>
      );
    }

    if (!teams || teams.length === 0) {
      return (
        <div className="px-3 py-3">
          <Button
            variant="outline"
            className="w-full justify-start text-sidebar-foreground border-sidebar-muted/30 hover:bg-sidebar-hover"
            onClick={() => setIsCreateTeamModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            첫 팀 만들기
          </Button>
        </div>
      );
    }

    return (
      <div className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-hover"
            >
              <div className="flex items-center gap-2">
                {selectedTeam && (
                  <>
                    <div
                      className="h-6 w-6 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: getTeamColor(selectedTeam.id) }}
                    >
                      <span className="text-xs font-medium text-white">
                        {selectedTeam.name.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <span className="truncate text-sm">{selectedTeam.name}</span>
                  </>
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {teams.map((team) => (
              <DropdownMenuItem
                key={team.id}
                onClick={() => handleTeamSelect(team.id)}
                className={cn(
                  team.id === selectedTeam?.id && "bg-accent"
                )}
              >
                <div
                  className="mr-2 h-5 w-5 rounded flex items-center justify-center"
                  style={{ backgroundColor: getTeamColor(team.id) }}
                >
                  <span className="text-[10px] font-medium text-white">
                    {team.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>
                <span className="truncate">{team.name}</span>
                <Badge
                  variant="outline"
                  className="ml-auto text-[10px] px-1.5"
                >
                  {team.role}
                </Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsCreateTeamModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              새 팀 만들기
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const SidebarInnerContent = () => (
    <>
      {/* Logo & Brand */}
      <div className="flex items-center gap-2 px-3 py-4">
        <div className="relative h-8 w-8">
          <img
            src="/logo.png"
            alt="Litmers Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          Litmers
        </span>
      </div>

      <Separator className="bg-sidebar-muted/30" />

      {/* Team Selector */}
      <TeamSelector />

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}

        {/* Teams Section */}
        <div className="pt-4">
          <TeamList
            onTeamSelect={(teamId) => {
              setIsMobileOpen(false);
              handleTeamSelect(teamId);
            }}
          />
        </div>

        {/* Projects Section */}
        {selectedTeam && (
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-sidebar-muted">
                프로젝트
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-sidebar-muted hover:text-sidebar-foreground"
                onClick={() => setIsCreateProjectModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {projectsLoading ? (
              <div className="space-y-1 px-3">
                <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
                <Skeleton className="h-8 w-full bg-sidebar-muted/20" />
              </div>
            ) : teamProjects.length > 0 ? (
              <div className="space-y-1">
                {teamProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}/board`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname.includes(`/projects/${project.id}`)
                        ? "bg-sidebar-active text-white"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <FolderKanban className="h-4 w-4 shrink-0" />
                    <span className="truncate">{project.name}</span>
                    <Badge
                      variant="outline"
                      className="ml-auto text-xs text-sidebar-muted border-sidebar-muted/30"
                    >
                      {project.key}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2">
                <p className="text-xs text-sidebar-muted text-center">
                  프로젝트가 없습니다
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-sidebar-foreground"
                  onClick={() => setIsCreateProjectModalOpen(true)}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  프로젝트 만들기
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>

      <Separator className="bg-sidebar-muted/30" />

      {/* Bottom Section */}
      <div className="p-3 space-y-1">
        {/* Notifications */}
        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            isActive("/notifications")
              ? "bg-sidebar-active text-white"
              : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground"
          )}
          onClick={() => setIsMobileOpen(false)}
        >
          <Bell className="h-4 w-4 shrink-0" />
          <span className="truncate">알림</span>
        </Link>
      </div>

      {/* Create Team Modal */}
      <TeamCreateModal
        open={isCreateTeamModalOpen}
        onOpenChange={setIsCreateTeamModalOpen}
        onSuccess={handleCreateTeamSuccess}
      />

      {/* Create Project Modal */}
      <ProjectCreateModal
        open={isCreateProjectModalOpen}
        onOpenChange={setIsCreateProjectModalOpen}
        defaultTeamId={selectedTeam?.id}
      />
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-sidebar md:flex-col md:fixed md:inset-y-0 bg-sidebar">
        <SidebarInnerContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-sidebar transform bg-sidebar transition-transform duration-200 ease-in-out md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarInnerContent />
      </aside>
    </>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarContent />
    </Suspense>
  );
}
