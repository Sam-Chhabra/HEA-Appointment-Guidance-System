'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Clock, CalendarX, CalendarCheck, CalendarClock } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  message: string;
  status: string;
  created_at: string;
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/notifications');
        return;
      }
      fetchNotifications();
    }
  }, [user, authLoading, router]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchApi<Notification[]>('/notifications/my');
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, status: 'READ' } : n)
      );
      window.dispatchEvent(new Event('notificationRead'));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CONFIRMATION': return <CalendarCheck className="h-6 w-6 text-primary" />;
      case 'UPDATE': return <CalendarClock className="h-6 w-6 text-secondary-foreground" />;
      case 'CANCELLATION': return <CalendarX className="h-6 w-6 text-destructive" />;
      default: return <Bell className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (authLoading || loading) return <div className="text-center py-12">Loading...</div>;

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="relative">
          <Bell className="h-8 w-8 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-background">
              {unreadCount}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Notifications</h1>
          <p className="text-muted-foreground text-lg">Updates regarding your appointments.</p>
        </div>
      </div>

      {error ? (
        <div className="text-destructive text-center py-8 bg-destructive/10 rounded-lg">{error}</div>
      ) : notifications.length === 0 ? (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-xl font-bold tracking-tight text-foreground mb-2">You're all caught up!</p>
            <p className="text-muted-foreground">No notifications to display.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const isUnread = notification.status !== 'READ';
            return (
              <Card key={notification.id} className={`overflow-hidden transition-colors shadow-sm ${isUnread ? 'bg-primary/5 border-primary/30' : 'bg-card border-border opacity-70'}`}>
                <CardContent className="p-5 sm:p-6 flex gap-5">
                  <div className="shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-base leading-snug ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground font-medium'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTimeAgo(notification.created_at)}
                    </div>
                  </div>
                  {isUnread && (
                    <div className="shrink-0 flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary hover:bg-primary/10 h-10 w-10 rounded-full p-0"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
