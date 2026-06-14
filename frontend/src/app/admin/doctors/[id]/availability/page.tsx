'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, AlertTriangle, Plus, Trash2, Calendar as CalendarIcon, Clock, ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
}

export default function AdminAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const doctorId = resolvedParams.id;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  
  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login?redirect=/admin/doctors');
        return;
      }
      fetchData();
    }
  }, [user, authLoading, doctorId, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get doctor info (via search API trick)
      const doctors = await fetchApi<any[]>('/doctors');
      const doc = doctors.find(d => d.id === parseInt(doctorId, 10));
      if (doc) setDoctorInfo(doc);

      // Fetch availability
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const slotsData = await fetchApi<TimeSlot[]>(
        `/admin/doctors/${doctorId}/availability?from=${now.toISOString()}&to=${nextMonth.toISOString()}`
      );
      setSlots(slotsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load availability');
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
      await fetchApi(`/admin/doctors/${doctorId}/availability`, {
        method: 'POST',
        body: JSON.stringify({ startTime: startIso, endTime: endIso })
      });
      
      // Reset form
      setStartTime('');
      setEndTime('');
      
      // Refresh list
      fetchData();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add availability slot.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (slotId: number) => {
    if (!confirm('Are you sure you want to remove this availability slot?')) return;
    
    try {
      await fetchApi(`/admin/availability/${slotId}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove slot.');
    }
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };
  };

  if (authLoading || loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/doctors" className="text-primary hover:underline flex items-center text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Doctors
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">Manage Availability</h1>
        {doctorInfo && (
          <p className="text-muted-foreground text-lg">
            Dr. {doctorInfo.full_name} <span className="text-muted-foreground/30 mx-2">|</span> {doctorInfo.department_name}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card className="sticky top-24 bg-card border-border shadow-sm">
            <form onSubmit={handleAdd}>
              <CardHeader>
                <CardTitle>Add New Slot</CardTitle>
                <CardDescription>Create a new availability block for this doctor.</CardDescription>
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
                        initialFocus
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
                  <Plus className="h-4 w-4 mr-2" /> {adding ? 'Adding...' : 'Add Slot'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Current Schedule (Next 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No availability slots scheduled.
                      </TableCell>
                    </TableRow>
                  ) : (
                    slots.map(slot => {
                      const start = formatDateTime(slot.start_time);
                      const end = formatDateTime(slot.end_time);
                      const isBooked = slot.status === 'BOOKED';
                      
                      return (
                        <TableRow key={slot.id} className={isBooked ? 'bg-secondary/10' : ''}>
                          <TableCell className="font-semibold text-foreground">{start.date}</TableCell>
                          <TableCell className="text-muted-foreground">{start.time} - {end.time}</TableCell>
                          <TableCell>
                            <Badge variant={isBooked ? "default" : "outline"} 
                                   className={isBooked ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary/50" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}>
                              {slot.status}
                            </Badge>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
