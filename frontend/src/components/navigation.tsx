'use client';

import { useAuth } from '@/lib/auth-context';
import { Bell, Activity, Home, Compass, Users, CalendarDays, UserCog } from 'lucide-react';
import { Navbar1, MenuItem } from '@/components/ui/shadcnblocks-com-navbar1';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export function Navigation() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

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

  let menu: MenuItem[] = [];
  if (!user || user.role === 'PATIENT') {
    menu = [
      { title: 'Home', url: '/' },
      { title: 'Guidance', url: '/guidance' },
      { title: 'Doctors', url: '/doctors' },
    ];
    if (user) {
      menu.push({ title: 'Appointments', url: '/appointments' });
    }
  } else if (user.role === 'ADMIN') {
    menu = [
      { title: 'Dashboard', url: '/admin' },
      { title: 'Manage Doctors', url: '/admin/doctors' },
    ];
  } else if (user.role === 'DOCTOR') {
    menu = [
      { title: 'Dashboard', url: '/doctor' },
      { title: 'Schedule', url: '/doctor/schedule' },
    ];
  }

  const logoUrl = user?.role === 'ADMIN' ? '/admin' : user?.role === 'DOCTOR' ? '/doctor' : '/';

  const rightElements = user?.role === 'PATIENT' ? (
    <Link href="/notifications" className="relative p-2 mr-2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-background">
          {unreadCount}
        </span>
      )}
    </Link>
  ) : null;

  return (
    <Navbar1 
      logo={{
        url: logoUrl,
        alt: "logo",
        title: "HEA Guidance",
        icon: <Activity className="h-6 w-6 text-primary" />
      }}
      menu={menu}
      userRole={user?.role}
      onLogout={logout}
      rightElements={rightElements}
    />
  );
}
