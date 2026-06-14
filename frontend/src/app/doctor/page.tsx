'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, UserCircle, Users } from 'lucide-react';
import Link from 'next/link';

export default function DoctorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({ upcoming: 0, today: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/doctor');
      } else if (user.role !== 'DOCTOR') {
        router.push('/unauthorized');
      } else {
        // Fetch schedule to get stats
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
        
        fetchApi<any[]>(`/doctor/appointments`)
          .then((appointments) => {
            const upcoming = appointments.filter((a: any) => new Date(a.slot_start_time) >= now).length;
            const today = appointments.filter((a: any) => 
              a.slot_start_time >= startOfToday && a.slot_start_time <= endOfToday
            ).length;
            
            setStats({ upcoming, today });
          })
          .catch(console.error)
          .finally(() => setFetching(false));
      }
    }
  }, [user, loading, router]);

  if (loading || fetching || !user || user.role !== 'DOCTOR') {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
          <UserCircle className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">Welcome, Dr. {user.name.split(' ')[1] || user.name}</h1>
          <p className="text-muted-foreground text-lg">Here is an overview of your schedule.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-primary tracking-wider uppercase flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Appointments Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold tracking-tight text-foreground">{stats.today}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-2">
              <Clock className="h-4 w-4" /> Upcoming Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold tracking-tight text-foreground">{stats.upcoming}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Calendar className="h-5 w-5 text-primary" />
              My Schedule
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">View your full calendar of assigned appointments.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Access your read-only schedule to see when patients are booked and the reasons for their visits.
              Changes to your availability must be coordinated with hospital administrators.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/doctor/schedule" className="w-full">
              <Button className="w-full h-11 text-base font-medium">View Schedule</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="opacity-50 border-dashed border-border bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-muted-foreground">
              <Users className="h-5 w-5 text-muted-foreground/50" />
              Patient Records
            </CardTitle>
            <CardDescription className="text-base mt-1">Access detailed patient history.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              Full EMR (Electronic Medical Record) integration is planned for a future release.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full h-11 text-base border-border text-muted-foreground" disabled>Coming Soon</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
