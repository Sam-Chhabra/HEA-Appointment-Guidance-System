'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar as CalendarIcon, Clock, UserCircle, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const doctorId = searchParams.get('doctorId');
  const slotId = searchParams.get('slotId');
  const departmentId = searchParams.get('departmentId');

  // We need to fetch the doctor and slot details to show them
  const [doctor, setDoctor] = useState<any>(null);
  const [slot, setSlot] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    dateOfBirth: undefined as Date | undefined,
    phoneNumber: '',
    reasonOrNeed: ''
  });
  
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/book?doctorId=${doctorId}&slotId=${slotId}&departmentId=${departmentId}`);
      return;
    }

    if (!doctorId || !slotId || !departmentId) {
      router.push('/doctors');
      return;
    }

    const fetchDetails = async () => {
      try {
        // Fetch doctor and slots
        // In a real app we'd have a specific endpoint for these details, 
        // but here we can just use the search endpoint
        const doctors = await fetchApi<any[]>(`/doctors?departmentId=${departmentId}`);
        const foundDoctor = doctors.find(d => d.id === parseInt(doctorId, 10));
        
        if (!foundDoctor) throw new Error('Doctor not found');
        setDoctor(foundDoctor);

        // Fetch slot details
        const now = new Date().toISOString();
        const nextWeek = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const slots = await fetchApi<any[]>(`/doctors/${doctorId}/slots?from=${now}&to=${nextWeek}`);
        const foundSlot = slots.find(s => s.id === parseInt(slotId, 10));
        
        if (!foundSlot) throw new Error('Time slot is no longer available');
        setSlot(foundSlot);
        
      } catch (err: any) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [doctorId, slotId, departmentId, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Please fill out this field.";
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Please fill out this field.";
    if (!formData.dateOfBirth) errors.dateOfBirth = "Please select a date.";
    if (!formData.reasonOrNeed.trim()) errors.reasonOrNeed = "Please fill out this field.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setBooking(true);
    setError('');

    try {
      await fetchApi('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctorId: parseInt(doctorId as string, 10),
          timeSlotId: parseInt(slotId as string, 10),
          departmentId: parseInt(departmentId as string, 10),
          reasonOrNeed: formData.reasonOrNeed,
          patientInfo: {
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : null,
            phoneNumber: formData.phoneNumber,
            reasonOrNeed: formData.reasonOrNeed
          }
        })
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/appointments');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
      setBooking(false);
    }
  };

  if (!user) return null;

  if (loadingDetails) {
    return <div className="text-center py-12">Loading appointment details...</div>;
  }

  if (success) {
    return (
      <Card className="border-primary/50 shadow-lg max-w-lg mx-auto mt-12 bg-card">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
          <CheckCircle2 className="h-20 w-20 text-primary mb-6" />
          <h2 className="text-3xl font-bold tracking-tight mb-4">Appointment Confirmed!</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Your appointment with <span className="font-semibold text-foreground">{doctor?.full_name}</span> has been successfully booked.
          </p>
          <p className="text-sm font-medium text-muted-foreground">Redirecting to your appointments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Summary Sidebar */}
      <div className="md:col-span-1">
        <Card className="sticky top-24 bg-card border-border shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg">Appointment Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4 items-start">
              <UserCircle className="h-10 w-10 text-muted-foreground shrink-0" />
              <div>
                <p className="font-bold text-lg text-foreground">{doctor?.full_name}</p>
                <p className="text-sm text-primary font-semibold">{doctor?.department_name}</p>
                {doctor?.specialization && (
                  <p className="text-xs text-muted-foreground mt-1">{doctor.specialization}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-muted-foreground">
                <CalendarIcon className="h-5 w-5 shrink-0" />
                <span className="font-medium text-foreground">
                  {slot ? new Date(slot.start_time).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-5 w-5 shrink-0" />
                <span className="font-medium text-foreground">
                  {slot ? new Date(slot.start_time).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 shrink-0" />
                <span className="text-foreground">Main Hospital Campus</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Form */}
      <div className="md:col-span-2">
        <Card className="bg-card border-border shadow-sm">
          <form onSubmit={handleSubmit} noValidate>
            <CardHeader>
              <CardTitle className="text-2xl">Patient Details</CardTitle>
              <CardDescription className="text-base">
                Please provide your information to complete the booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8 pt-6">
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2.5">
                  <Label htmlFor="fullName" className={cn("text-sm font-semibold", fieldErrors.fullName && "text-destructive")}>Full Name</Label>
                  <Input 
                    id="fullName" name="fullName" required 
                    value={formData.fullName} onChange={handleChange}
                    className={cn("h-11", fieldErrors.fullName && "border-destructive focus-visible:ring-destructive")}
                  />
                  {fieldErrors.fullName && <p className="text-xs text-destructive mt-1">{fieldErrors.fullName}</p>}
                </div>
                <div className="flex flex-col gap-2.5">
                  <Label className={cn("text-sm font-semibold", fieldErrors.dateOfBirth && "text-destructive")}>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-11 justify-start text-left font-normal bg-background hover:bg-muted/50 border-input",
                          !formData.dateOfBirth && "text-muted-foreground",
                          fieldErrors.dateOfBirth && "border-destructive focus-visible:ring-destructive text-destructive hover:text-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card border-border shadow-lg" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateOfBirth}
                        onSelect={(date) => {
                          setFormData(prev => ({ ...prev, dateOfBirth: date }));
                          if (fieldErrors.dateOfBirth) setFieldErrors(prev => ({ ...prev, dateOfBirth: '' }));
                        }}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        captionLayout="dropdown"
                        startMonth={new Date(1900, 0)}
                        endMonth={new Date()}
                        defaultMonth={formData.dateOfBirth || new Date(2000, 0)}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldErrors.dateOfBirth && <p className="text-xs text-destructive mt-1">{fieldErrors.dateOfBirth}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Label htmlFor="phoneNumber" className={cn("text-sm font-semibold", fieldErrors.phoneNumber && "text-destructive")}>Phone Number</Label>
                <Input 
                  id="phoneNumber" name="phoneNumber" type="tel" required 
                  value={formData.phoneNumber} onChange={handleChange}
                  className={cn("h-11", fieldErrors.phoneNumber && "border-destructive focus-visible:ring-destructive")}
                />
                {fieldErrors.phoneNumber && <p className="text-xs text-destructive mt-1">{fieldErrors.phoneNumber}</p>}
              </div>

              <div className="flex flex-col gap-2.5">
                <Label htmlFor="reasonOrNeed" className={cn("text-sm font-semibold", fieldErrors.reasonOrNeed && "text-destructive")}>Reason for Appointment</Label>
                <Textarea 
                  id="reasonOrNeed" name="reasonOrNeed" required 
                  placeholder="Briefly describe why you need this appointment..."
                  value={formData.reasonOrNeed} onChange={handleChange} 
                  className={cn("min-h-[120px] resize-none", fieldErrors.reasonOrNeed && "border-destructive focus-visible:ring-destructive")}
                />
                {fieldErrors.reasonOrNeed && <p className="text-xs text-destructive mt-1">{fieldErrors.reasonOrNeed}</p>}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t border-border flex justify-end gap-4 py-6">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={booking || !slot} className="min-w-[150px]">
                {booking ? 'Confirming...' : 'Confirm Booking'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Book Appointment</h1>
        <p className="text-muted-foreground text-lg">Review details and confirm your appointment.</p>
      </div>
      <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
        <BookingForm />
      </Suspense>
    </div>
  );
}
