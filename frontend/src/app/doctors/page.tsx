'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Calendar, Clock, HeartPulse, Brain, Bone, Baby, Activity, Eye, Stethoscope } from 'lucide-react';

interface Department {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  full_name: string;
  department_name: string;
  specialization: string | null;
}

interface TimeSlot {
  id: number;
  doctor_id: number;
  start_time: string;
  end_time: string;
}

export default function DoctorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const initialDeptId = searchParams.get('departmentId');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDeptId || '');
  const [specialization, setSpecialization] = useState('');
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Record<number, TimeSlot[]>>({});
  const [loading, setLoading] = useState(false);
  const [expandedDoctors, setExpandedDoctors] = useState<Record<number, boolean>>({});

  const toggleExpand = (doctorId: number) => {
    setExpandedDoctors(prev => ({ ...prev, [doctorId]: !prev[doctorId] }));
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/doctors');
        return;
      }
      fetchApi<Department[]>('/departments').then(setDepartments).catch(console.error);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (selectedDeptId && user) {
      handleSearch();
    }
  }, [selectedDeptId, user]);

  const handleSearch = async () => {
    if (!selectedDeptId) return;
    
    setLoading(true);
    try {
      const query = new URLSearchParams({ departmentId: selectedDeptId });
      if (specialization) query.append('specialization', specialization);
      
      const doctorsData = await fetchApi<Doctor[]>(`/doctors?${query.toString()}`);
      setDoctors(doctorsData);
      
      // Fetch availability for all returned doctors (up to 7 days for demo)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const slotsData: Record<number, TimeSlot[]> = {};
      for (const doc of doctorsData) {
        const docSlots = await fetchApi<TimeSlot[]>(
          `/doctors/${doc.id}/slots?from=${now.toISOString()}&to=${nextWeek.toISOString()}`
        );
        slotsData[doc.id] = docSlots;
      }
      setSlots(slotsData);
      
    } catch (error) {
      console.error('Failed to search doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (doctorId: number, slotId: number) => {
    router.push(`/book?doctorId=${doctorId}&slotId=${slotId}&departmentId=${selectedDeptId}`);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Find a Doctor</h1>
        <p className="text-muted-foreground text-lg">
          Browse our specialists and book an appointment time that works for you.
        </p>
      </div>

      <Card className="mb-12 shadow-sm border-border bg-card">
        <CardContent className="pt-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-6 items-start">
            
            <div className="flex flex-col gap-3 w-full min-w-0">
              <Label className="text-base font-bold text-foreground">Department</Label>
              <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                <SelectTrigger className="w-full h-12 bg-background border-input text-base truncate">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => {
                    // Map department name to an appropriate icon
                    const Icon = (() => {
                      const name = dept.name.toLowerCase();
                      if (name.includes('cardio')) return HeartPulse;
                      if (name.includes('neuro')) return Brain;
                      if (name.includes('ortho')) return Bone;
                      if (name.includes('pediatric')) return Baby;
                      if (name.includes('derma')) return Activity;
                      if (name.includes('eye') || name.includes('ophthal')) return Eye;
                      return Stethoscope;
                    })();
                    
                    return (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{dept.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-3 w-full min-w-0">
              <Label className="text-base font-bold text-foreground truncate">Specialization (Optional)</Label>
              <Input 
                placeholder="e.g. Sports Medicine" 
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full h-12 bg-background border-input text-base"
              />
            </div>
            
            <div className="flex flex-col justify-end h-full pt-[34px]">
              <Button onClick={handleSearch} disabled={!selectedDeptId || loading} className="w-full md:w-auto h-12 px-8 text-base font-bold">
                {loading ? 'Searching...' : 'Search Doctors'}
              </Button>
            </div>
            
          </div>
        </CardContent>
      </Card>

      {!selectedDeptId ? (
        <div className="text-center py-16 text-muted-foreground font-medium">
          Please select a department to view available doctors.
        </div>
      ) : doctors.length === 0 && !loading ? (
        <div className="text-center py-16 text-muted-foreground font-medium">
          No doctors found matching your criteria. Try adjusting your filters.
        </div>
      ) : (
        <div className="space-y-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden border-border bg-card hover:border-primary/50 transition-colors">
              <div className="md:flex">
                <div className="md:w-1/3 bg-muted/30 p-8 border-r border-border flex flex-col items-center justify-center text-center">
                  <UserCircle className="h-24 w-24 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold">{doctor.full_name}</h3>
                  <p className="text-primary font-semibold mb-3 mt-1">{doctor.department_name}</p>
                  {doctor.specialization && (
                    <Badge variant="secondary" className="mb-2 bg-secondary text-secondary-foreground">{doctor.specialization}</Badge>
                  )}
                </div>
                
                <div className="md:w-2/3 p-8 flex flex-col">
                  <h4 className="text-lg font-bold mb-6 flex items-center gap-2 tracking-tight">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    Available Appointments
                  </h4>
                  
                  {slots[doctor.id] && slots[doctor.id].length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 content-start">
                      {slots[doctor.id].slice(0, expandedDoctors[doctor.id] ? undefined : 6).map((slot) => (
                        <Button 
                          key={slot.id} 
                          variant="outline" 
                          className="h-auto py-3 px-4 flex flex-col items-start gap-1.5 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                          onClick={() => handleBook(doctor.id, slot.id)}
                        >
                          <span className="text-sm font-semibold">{formatDate(slot.start_time)}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            <Clock className="h-3.5 w-3.5" /> {formatTime(slot.start_time)}
                          </span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium bg-muted/20 rounded-lg border border-dashed border-border py-8">
                      No available slots in the next 7 days.
                    </div>
                  )}
                  
                  {slots[doctor.id] && slots[doctor.id].length > 6 && (
                    <div className="mt-6 pt-4 border-t border-border text-center">
                      <Button 
                        variant="ghost" 
                        className="text-primary text-sm font-medium hover:bg-primary/10"
                        onClick={() => toggleExpand(doctor.id)}
                      >
                        {expandedDoctors[doctor.id] ? "View Less" : "View More Availability"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
