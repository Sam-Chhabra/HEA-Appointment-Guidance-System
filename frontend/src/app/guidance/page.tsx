'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Info, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

interface GuidanceResult {
  isEmergency: boolean;
  message?: string;
  sessionId?: number;
  recommendedDepartment?: { id: number; name: string } | null;
  explanation?: string;
  alternatives?: { id: number; name: string }[];
  disclaimer: string;
}

export default function GuidancePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GuidanceResult | null>(null);
  
  // For department override
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchApi<any[]>('/departments')
      .then(setDepartments)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please describe your symptoms.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchApi<GuidanceResult>('/guidance', {
        method: 'POST',
        body: JSON.stringify({ inputText: symptoms })
      });
      
      setResult(data);
      if (data.recommendedDepartment) {
        setSelectedDeptId(data.recommendedDepartment.id.toString());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!result || result.isEmergency) return;
    
    if (result.sessionId && selectedDeptId && result.recommendedDepartment?.id.toString() !== selectedDeptId) {
      // User overrode the department, we should update the session
      try {
        await fetchApi(`/guidance/${result.sessionId}/override`, {
          method: 'POST',
          body: JSON.stringify({ departmentId: parseInt(selectedDeptId, 10) })
        });
      } catch (err) {
        console.error('Failed to save override', err);
        // Continue anyway to the doctors page
      }
    }
    
    // Redirect to doctors page with the selected department
    router.push(`/doctors?departmentId=${selectedDeptId}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Symptom Guidance</h1>
        <p className="text-muted-foreground text-lg">
          Describe how you are feeling, and we will recommend the best medical department for your needs.
        </p>
      </div>

      {!result ? (
        <Card className="border-border shadow-sm bg-card">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">Describe Your Symptoms</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Please provide details about your symptoms, duration, and any other relevant information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="symptoms" className="text-sm font-semibold text-foreground">Symptoms or Needs</Label>
                <Textarea
                  id="symptoms"
                  placeholder="e.g., I have been having frequent headaches for the past three days, accompanied by slight dizziness..."
                  className="min-h-[160px] resize-none bg-background border-input p-4 text-base leading-relaxed"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>
              
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Alert className="bg-primary/5 border-primary/20 text-primary">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This system does not provide medical diagnoses. For emergencies, please call emergency services.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-medium">
                {loading ? 'Analyzing...' : 'Get Recommendation'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {result.isEmergency ? (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30 text-destructive p-8 rounded-2xl shadow-sm">
              <AlertTriangle className="h-8 w-8 mb-4 !text-destructive" />
              <AlertTitle className="font-bold text-2xl mb-3 tracking-tight">Emergency Detected</AlertTitle>
              <AlertDescription className="text-lg leading-relaxed opacity-90">
                {result.message}
              </AlertDescription>
              <div className="mt-8">
                <Button variant="destructive" className="h-12 px-8 font-medium" onClick={() => setResult(null)}>
                  Start Over
                </Button>
              </div>
            </Alert>
          ) : (
            <Card className="border-border shadow-md bg-card overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border pb-8 pt-8 px-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/20 p-3 rounded-2xl border border-primary/20">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold tracking-tight">Recommendation</CardTitle>
                </div>
                <CardDescription className="text-foreground text-lg leading-relaxed">
                  {result.explanation}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8 px-8 space-y-8">
                <div className="space-y-4">
                  <Label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Confirm Department</Label>
                  <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                    <SelectTrigger className="w-full text-lg h-14 bg-background border-input font-medium">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => {
                        const isRecommended = result.recommendedDepartment?.id === dept.id;
                        return (
                          <SelectItem 
                            key={dept.id} 
                            value={dept.id.toString()}
                            className={isRecommended ? "font-semibold text-primary focus:bg-primary/10" : ""}
                          >
                            {dept.name} {isRecommended && "(Recommended)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    If you prefer a different department, you can change it here.
                  </p>
                </div>
                
                <Alert className="bg-muted/30 text-muted-foreground border-border">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs leading-relaxed">
                    {result.disclaimer}
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 px-8 pb-8 pt-4">
                <Button variant="outline" onClick={() => setResult(null)} className="w-full sm:flex-1 h-12 text-base font-medium">
                  Edit Symptoms
                </Button>
                <Button 
                  onClick={handleContinue} 
                  disabled={!selectedDeptId}
                  className="w-full sm:flex-1 h-12 text-base font-medium"
                >
                  Find Doctors <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
