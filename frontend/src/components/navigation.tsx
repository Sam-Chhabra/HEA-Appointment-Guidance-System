'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, ShieldCheck, UserCircle, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';

export function Navigation() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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
        
        <nav className="hidden md:flex gap-8 items-center absolute left-1/2 -translate-x-1/2">
          {!user || user.role === 'PATIENT' ? (
            <>
              <Link href="/guidance" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Guidance</Link>
              <Link href="/doctors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Doctors</Link>
              {user && (
                <Link href="/appointments" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Appointments</Link>
              )}
            </>
          ) : user.role === 'ADMIN' ? (
            <>
              <Link href="/admin/doctors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Manage Doctors</Link>
            </>
          ) : user.role === 'DOCTOR' ? (
            <>
              <Link href="/doctor/schedule" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Schedule</Link>
            </>
          ) : null}
        </nav>

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
