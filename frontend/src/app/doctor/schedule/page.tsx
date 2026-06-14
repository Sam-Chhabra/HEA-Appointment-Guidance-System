'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CalendarDays, Info, Clock, User } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string | null;
  slot_start_time: string;
  slot_end_time: string;
  status: string;
  reason_or_need: string;
}

export default function DoctorSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Date range filter
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7); // Default to next 7 days
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'DOCTOR') {
        router.push('/login?redirect=/doctor/schedule');
        return;
      }
      fetchSchedule();
    }
  }, [user, authLoading, router, fromDate, toDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    
    try {
      const startIso = new Date(`${fromDate}T00:00:00`).toISOString();
      const endIso = new Date(`${toDate}T23:59:59`).toISOString();
      
      const appts = await fetchApi<Appointment[]>(`/doctor/appointments?from=${startIso}&to=${endIso}`);
      setAppointments(appts);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Confirmed</Badge>;
      case 'RESCHEDULED': return <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary/50">Rescheduled</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="text-muted-foreground border-border">Completed</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };
  };

  if (authLoading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/doctor" className="text-primary hover:underline flex items-center text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">My Schedule</h1>
          <p className="text-muted-foreground text-lg">View your assigned patient appointments.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-background p-2 rounded-lg border border-input shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter:</span>
          </div>
          <input 
            type="date" 
            className="text-sm border-input bg-transparent rounded px-2 py-1 outline-none text-foreground"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-muted-foreground/50">to</span>
          <input 
            type="date" 
            className="text-sm border-input bg-transparent rounded px-2 py-1 outline-none text-foreground"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6 bg-primary/5 text-primary border-primary/20">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Read-only view:</strong> Changes to your schedule or cancellations must be handled by hospital administrators or initiated by the patient.
        </AlertDescription>
      </Alert>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason / Need</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      Loading schedule...
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No appointments scheduled in this date range.
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map(appt => {
                    const start = formatDateTime(appt.slot_start_time);
                    return (
                      <TableRow key={appt.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-foreground whitespace-nowrap">
                          {start.date}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" /> {start.time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground/50" />
                            <span className="font-medium text-foreground">{appt.patient_name || `Patient #${appt.patient_id}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-md" title={appt.reason_or_need}>
                            {appt.reason_or_need}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          {getStatusBadge(appt.status)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
