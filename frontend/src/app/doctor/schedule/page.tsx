'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, CalendarDays, Info, Clock, User, Plus, Trash2, ChevronDownIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
}

interface Appointment {
  id: number;
  patient_id: number;
  patient_name: string | null;
  slot_start_time: string;
  slot_end_time: string;
  time_slot_id: number;
  status: string;
  reason_or_need: string;
}

export default function DoctorSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Slot Form State
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

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
    if (!fromDate || !toDate) return;
    setLoading(true);
    setError('');
    
    try {
      const startIso = new Date(`${fromDate}T00:00:00`).toISOString();
      const endIso = new Date(`${toDate}T23:59:59`).toISOString();
      
      const res = await fetchApi<any>(`/doctor/schedule?from=${startIso}&to=${endIso}`);
      setSlots(res.slots || []);
      setAppointments(res.appointments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);

    if (!date || !startTime || !endTime) {
      setAddError('Please fill in all fields.');
      setAdding(false);
      return;
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const startIso = new Date(`${dateStr}T${startTime}:00`).toISOString();
    const endIso = new Date(`${dateStr}T${endTime}:00`).toISOString();

    if (new Date(startIso) >= new Date(endIso)) {
      setAddError('End time must be after start time.');
      setAdding(false);
      return;
    }

    try {
      await fetchApi(`/doctor/availability`, {
        method: 'POST',
        body: JSON.stringify({ startTime: startIso, endTime: endIso })
      });
      
      // Reset form
      setStartTime('');
      setEndTime('');
      
      // Refresh list
      fetchSchedule();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add availability slot.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (slotId: number) => {
    if (!confirm('Are you sure you want to remove this availability slot?')) return;
    
    try {
      await fetchApi(`/doctor/availability/${slotId}`, { method: 'DELETE' });
      fetchSchedule();
    } catch (err: any) {
      alert(err.message || 'Failed to remove slot.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Available</Badge>;
      case 'BOOKED': return <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Booked</Badge>;
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
          <p className="text-muted-foreground text-lg">Manage your availability and view upcoming appointments.</p>
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

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="sticky top-24 bg-card border-border shadow-sm">
            <form onSubmit={handleAdd}>
              <CardHeader>
                <CardTitle>Add New Slot</CardTitle>
                <CardDescription>Open your availability for a specific date and time.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {addError && (
                  <Alert variant="destructive" className="py-2 px-3">
                    <AlertDescription className="text-sm">{addError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2 flex flex-col">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-11 justify-between text-left font-normal bg-background hover:bg-muted/50 border-input",
                          !date && "text-muted-foreground"
                        )}
                      >
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border shadow-lg" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="startTime" className="px-1">Start Time</Label>
                    <Input 
                      type="time" id="startTime" required
                      className="bg-background border-input h-11 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      value={startTime} onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="endTime" className="px-1">End Time</Label>
                    <Input 
                      type="time" id="endTime" required
                      className="bg-background border-input h-11 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      value={endTime} onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={adding} className="w-full h-11 font-medium">
                  <Plus className="h-4 w-4 mr-2" /> {adding ? 'Adding...' : 'Add Availability'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Schedule Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[100px]">Time</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          Loading schedule...
                        </TableCell>
                      </TableRow>
                    ) : slots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          No availability slots in this date range.
                        </TableCell>
                      </TableRow>
                    ) : (
                      slots.map(slot => {
                        const start = formatDateTime(slot.start_time);
                        const end = formatDateTime(slot.end_time);
                        const isBooked = slot.status === 'BOOKED';
                        
                        // Find matching appointment if booked
                        const appt = isBooked 
                          ? appointments.find(a => a.time_slot_id === slot.id)
                          : null;
                        
                        return (
                          <TableRow key={slot.id} className={cn("hover:bg-muted/30", isBooked && "bg-secondary/5")}>
                            <TableCell className="font-semibold text-foreground whitespace-nowrap">
                              {start.date}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" /> {start.time} - {end.time}
                              </div>
                            </TableCell>
                            <TableCell>
                              {appt ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground/50" />
                                    <span className="font-medium text-foreground">{appt.patient_name || `Patient #${appt.patient_id}`}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]" title={appt.reason_or_need}>
                                    {appt.reason_or_need}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/50 text-sm italic">No appointment</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {getStatusBadge(appt ? appt.status : slot.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemove(slot.id)}
                                disabled={isBooked}
                                title={isBooked ? "Cannot remove a booked slot" : "Remove slot"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
      </div>
    </div>
  );
}
