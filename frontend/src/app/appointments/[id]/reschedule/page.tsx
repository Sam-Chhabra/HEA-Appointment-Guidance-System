'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Clock, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  id: number;
  doctor_id: number;
  doctor_name: string;
  department_name: string;
  status: string;
  slot_start_time: string;
}

interface TimeSlot {
  id: number;
  doctor_id: number;
  start_time: string;
  end_time: string;
}

export default function ReschedulePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.id;
  const router = useRouter();
  const { user } = useAuth();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/appointments/${appointmentId}/reschedule`);
      return;
    }

    const fetchDetails = async () => {
      try {
        // Fetch user's appointments and find this one to get doctor info
        const appointments = await fetchApi<Appointment[]>('/appointments/my/future');
        const appt = appointments.find(a => a.id === parseInt(appointmentId, 10));
        
        if (!appt) {
          throw new Error('Appointment not found or not eligible for rescheduling.');
        }
        setAppointment(appt);

        // Fetch available slots for this doctor
        const now = new Date().toISOString();
        const nextWeek = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const docSlots = await fetchApi<TimeSlot[]>(`/doctors/${appt.doctor_id}/slots?from=${now}&to=${nextWeek}`);
        setSlots(docSlots);

      } catch (err: any) {
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId, user, router]);

  const handleReschedule = async () => {
    if (!selectedSlotId) return;
    
    setRescheduling(true);
    setError('');

    try {
      await fetchApi(`/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ newTimeSlotId: selectedSlotId })
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/appointments');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule appointment');
      setRescheduling(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (success) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card className="border-primary/50 shadow-lg bg-card">
          <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
            <CheckCircle2 className="h-20 w-20 text-primary mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Successfully Rescheduled!</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Your new appointment time has been confirmed.
            </p>
            <p className="text-sm font-medium text-muted-foreground">Redirecting to your appointments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <Link href="/appointments" className="text-primary hover:underline flex items-center text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Appointments
        </Link>
      </div>
      
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">Reschedule Appointment</h1>
        <p className="text-muted-foreground text-lg">Select a new time for your appointment with <span className="font-semibold text-foreground">Dr. {appointment?.doctor_name}</span>.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-10 border-primary/30 bg-primary/5 shadow-sm">
        <CardContent className="pt-6">
          <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">Current Appointment</h3>
          <div className="flex items-center gap-6 text-foreground font-medium">
            <span className="flex items-center gap-2"><Calendar className="h-5 w-5 text-muted-foreground" /> {appointment ? formatDate(appointment.slot_start_time) : ''}</span>
            <span className="flex items-center gap-2"><Clock className="h-5 w-5 text-muted-foreground" /> {appointment ? formatTime(appointment.slot_start_time) : ''}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card shadow-sm border-border">
        <CardHeader className="border-b bg-muted/20 pb-6">
          <CardTitle className="text-2xl">Available Slots</CardTitle>
          <CardDescription className="text-base mt-1">Select a new time slot below.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {slots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground italic bg-muted/20 rounded-lg border border-dashed border-border">
              No available slots found for this doctor in the next 30 days.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map((slot) => (
                <Button 
                  key={slot.id} 
                  variant={selectedSlotId === slot.id ? "default" : "outline"}
                  className={`h-auto py-4 flex flex-col gap-1.5 transition-all ${
                    selectedSlotId === slot.id 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border hover:border-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setSelectedSlotId(slot.id)}
                >
                  <span className="text-sm font-semibold">{formatDate(slot.start_time)}</span>
                  <span className={`text-xs flex items-center gap-1 font-medium ${selectedSlotId === slot.id ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                    <Clock className="h-3.5 w-3.5" /> {formatTime(slot.start_time)}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/20 border-t border-border flex justify-end gap-4 py-6 mt-6">
          <Link href="/appointments">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button 
            onClick={handleReschedule} 
            disabled={rescheduling || !selectedSlotId} 
            className="min-w-[160px]"
          >
            {rescheduling ? 'Confirming...' : 'Confirm New Time'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
