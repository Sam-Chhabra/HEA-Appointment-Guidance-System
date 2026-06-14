'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertTriangle, Calendar, Clock, MapPin, UserCircle, Edit2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: number;
  doctor_name: string;
  department_name: string;
  status: string;
  slot_start_time: string;
  slot_end_time: string;
  reason_or_need: string;
}

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [futureAppts, setFutureAppts] = useState<Appointment[]>([]);
  const [pastAppts, setPastAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/appointments');
      return;
    }

    if (user) {
      fetchAppointments();
    }
  }, [user, authLoading, router]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [future, past] = await Promise.all([
        fetchApi<Appointment[]>('/appointments/my/future'),
        fetchApi<Appointment[]>('/appointments/my/past')
      ]);
      setFutureAppts(future);
      setPastAppts(past);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await fetchApi(`/appointments/${id}/cancel`, { method: 'PATCH' });
      fetchAppointments(); // Refresh lists
    } catch (err: any) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/20">Confirmed</Badge>;
      case 'RESCHEDULED':
        return <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary">Rescheduled</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Cancelled</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="text-muted-foreground border-border bg-muted/20">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const AppointmentCard = ({ appt, isPast = false }: { appt: Appointment, isPast?: boolean }) => {
    const isCancelled = appt.status === 'CANCELLED';
    return (
    <Card className={`mb-4 overflow-hidden border-border bg-card transition-colors shadow-sm ${isCancelled ? 'opacity-75 bg-muted/10 border-dashed' : 'hover:border-primary/50'}`}>
      <div className="md:flex">
        <div className="md:w-1/4 bg-muted/30 p-8 flex flex-col justify-center border-r border-border">
          <div className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-2">
            {new Date(appt.slot_start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className={`text-3xl font-bold mb-3 tracking-tight ${isCancelled ? 'text-muted-foreground line-through decoration-destructive/50' : 'text-foreground'}`}>
            {new Date(appt.slot_start_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </div>
          <div>{getStatusBadge(appt.status)}</div>
        </div>
        <div className="md:w-3/4 p-8 flex flex-col sm:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2 tracking-tight">
                <UserCircle className="h-6 w-6 text-primary" />
                Dr. {appt.doctor_name}
              </h3>
              <p className="text-muted-foreground font-semibold text-base">{appt.department_name}</p>
            </div>
            
            <div className="text-base text-muted-foreground space-y-2 bg-muted/20 p-4 rounded-xl border border-border">
              <p><span className="font-bold text-foreground">Reason for Visit:</span> {appt.reason_or_need}</p>
              <p className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-primary" /> Main Hospital Campus
              </p>
            </div>
          </div>
          
          {!isPast && appt.status !== 'CANCELLED' && (
            <div className="flex sm:flex-col gap-3 shrink-0 justify-end sm:justify-start mt-4 sm:mt-0">
              <Link href={`/appointments/${appt.id}/reschedule`}>
                <Button variant="outline" className="w-full sm:w-36 h-12 font-bold border-border hover:border-primary hover:bg-primary/5">
                  <Edit2 className="h-4 w-4 mr-2" /> Reschedule
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-36 h-12 font-bold border-destructive/20 text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your appointment with Dr. {appt.doctor_name}? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-border">Keep Appointment</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={() => handleCancel(appt.id)}>Confirm Cancellation</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
          <p className="text-muted-foreground text-lg">View and manage your upcoming and past hospital visits.</p>
        </div>
        <Link href="/doctors">
          <Button className="h-12 px-6 font-medium">Book New Appointment</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 max-w-[400px]">
          <TabsTrigger value="upcoming">Upcoming ({futureAppts.length})</TabsTrigger>
          <TabsTrigger value="past">Past History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {futureAppts.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 border border-border">
                <Calendar className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">No appointments yet</h3>
              <p className="text-muted-foreground mb-8">Start booking your first hospital appointment above.</p>
              <Link href="/guidance">
                <Button variant="outline" className="h-10 px-6">Start Symptom Guidance</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {futureAppts.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {pastAppts.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <h3 className="text-lg font-medium text-muted-foreground">No past appointments</h3>
            </div>
          ) : (
            <div className="space-y-6">
              {pastAppts.map(appt => (
                <AppointmentCard key={appt.id} appt={appt} isPast={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
