'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveProject }               from '@/store/slices/uiSlice';
import Link                               from 'next/link';
import { usePathname }                    from 'next/navigation';
import { LayoutDashboard, FolderKanban, ChevronLeft } from 'lucide-react';
import { cn }                             from '@/lib/utils';

interface Project {
  _id:  string;
  name: string;
}

interface Props {
  projects: Project[];
}

export default function Sidebar({ projects }: Props) {
  const dispatch  = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const pathname  = usePathname();

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-300 shrink-0',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'h-14 flex items-center border-b px-4 gap-2 shrink-0',
        collapsed && 'justify-center px-0'
      )}>
        <FolderKanban className="w-5 h-5 text-primary shrink-0" />
        {!collapsed && (
          <span className="font-bold text-base tracking-tight">DevFlow</span>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">

        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
            'hover:bg-muted',
            pathname === '/dashboard'
              ? 'bg-muted font-medium'
              : 'text-muted-foreground',
            collapsed && 'justify-center px-0'
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Projects */}
        {!collapsed && (
          <p className="text-xs text-muted-foreground px-2 pt-4 pb-1 font-medium uppercase tracking-wider">
            Projects
          </p>
        )}

        {projects.map((project) => {
          const isActive = pathname === `/projects/${project._id}`;
          return (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              onClick={() => dispatch(setActiveProject(project._id))}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
                'hover:bg-muted',
                isActive
                  ? 'bg-muted font-medium'
                  : 'text-muted-foreground',
                collapsed && 'justify-center px-0'
              )}
            >
              <div className="w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary">
                  {project.name[0].toUpperCase()}
                </span>
              </div>
              {!collapsed && (
                <span className="truncate">{project.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle at bottom */}
      <div className="p-2 border-t">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            'w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm',
            'text-muted-foreground hover:bg-muted transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <ChevronLeft className={cn(
            'w-4 h-4 shrink-0 transition-transform duration-300',
            collapsed && 'rotate-180'
          )} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>

    </aside>
  );
}
