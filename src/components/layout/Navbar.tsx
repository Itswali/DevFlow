'use client';

import { useUIStore }   from '@/store/uiStore';
import { Button }       from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, User } from 'lucide-react';
import { authClient }         from '@/lib/auth/auth-client';
import { useRouter }          from 'next/navigation';

interface Props {
  user: { name: string; email: string; image?: string | null; };
}

export default function Navbar({ user }: Props) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const router        = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/auth/login');
  }

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-background">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full outline-none">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {user.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            <User className="w-4 h-4 mr-2" /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
