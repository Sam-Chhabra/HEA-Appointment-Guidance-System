'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ doctors: 0, departments: 0 });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (user.role !== 'ADMIN') {
        router.push('/unauthorized');
      } else {
        // Fetch basic stats
        Promise.all([
          fetchApi<any[]>('/doctors'),
          fetchApi<any[]>('/departments')
        ]).then(([doctors, depts]) => {
          setStats({ doctors: doctors.length, departments: depts.length });
        }).catch(console.error);
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage hospital staff and availability schedules.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Total Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground tracking-tight">{stats.doctors}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground tracking-tight">{stats.departments}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-emerald-500 flex items-center gap-2">
              <Activity className="h-5 w-5" /> Online
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Doctor Management
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">View all doctors and manage their availability schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Administrators are responsible for defining when doctors are available for appointments. You can add, edit, or remove time slots for any doctor.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/doctors" className="w-full">
              <Button className="w-full h-11 text-base font-medium">Manage Doctors</Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card className="opacity-50 border-dashed border-border bg-transparent shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-muted-foreground">
              <CalendarDays className="h-5 w-5 text-muted-foreground/50" />
              Global Settings
            </CardTitle>
            <CardDescription className="text-base mt-1">Configure hospital-wide parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              This module is not active in the current MVP version.
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
