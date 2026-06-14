'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, ShieldCheck, UserCircle, Activity, Home, Compass, Users, CalendarDays, UserCog } from 'lucide-react';
import { NavBar, NavItem } from '@/components/ui/tubelight-navbar';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';

export function Navigation() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  let navItems: NavItem[] = [];
  if (!user || user.role === 'PATIENT') {
    navItems = [
      { name: 'Home', url: '/', icon: Home },
      { name: 'Guidance', url: '/guidance', icon: Compass },
      { name: 'Doctors', url: '/doctors', icon: Users },
    ];
    if (user) {
      navItems.push({ name: 'Appointments', url: '/appointments', icon: CalendarDays });
    }
  } else if (user.role === 'ADMIN') {
    navItems = [
      { name: 'Dashboard', url: '/admin', icon: Home },
      { name: 'Doctors', url: '/admin/doctors', icon: UserCog },
    ];
  } else if (user.role === 'DOCTOR') {
    navItems = [
      { name: 'Dashboard', url: '/doctor', icon: Home },
      { name: 'Schedule', url: '/doctor/schedule', icon: CalendarDays },
    ];
  }

  useEffect(() => {
    if (user && user.role === 'PATIENT') {
      fetchApi<any[]>('/notifications/my')
        .then(notifications => {
          setUnreadCount(notifications.filter(n => n.status !== 'READ').length);
        })
        .catch(() => {});

      const handleNotificationRead = () => {
        setUnreadCount(prev => Math.max(0, prev - 1));
      };

      window.addEventListener('notificationRead', handleNotificationRead);
      return () => window.removeEventListener('notificationRead', handleNotificationRead);
    }
  }, [user]);

  return (
    <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={user?.role === 'ADMIN' ? '/admin' : user?.role === 'DOCTOR' ? '/doctor' : '/'} className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground hidden sm:inline-block tracking-tight">HEA Guidance</span>
        </Link>
        <NavBar items={navItems} activePath={pathname} />
        <div className="flex items-center gap-2 sm:gap-4">
          {!user ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-medium">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              {user.role === 'PATIENT' && (
                <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-background">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full border">
                {user.role === 'ADMIN' ? (
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                ) : user.role === 'DOCTOR' ? (
                  <UserCircle className="h-4 w-4 text-blue-500" />
                ) : (
                  <UserCircle className="h-4 w-4 text-green-500" />
                )}
                <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 px-2 sm:px-3">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
