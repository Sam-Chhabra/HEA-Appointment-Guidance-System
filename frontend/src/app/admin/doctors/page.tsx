'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, CalendarPlus } from 'lucide-react';
import Link from 'next/link';

interface Doctor {
  id: number;
  full_name: string;
  department_name: string;
  specialization: string | null;
}

export default function AdminDoctorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login?redirect=/admin/doctors');
        return;
      }
      
      fetchApi<Doctor[]>('/doctors')
        .then((data) => {
          setDoctors(data);
          setFilteredDoctors(data);
        })
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  useEffect(() => {
    const term = search.toLowerCase();
    const filtered = doctors.filter(
      d => d.full_name.toLowerCase().includes(term) || d.department_name.toLowerCase().includes(term)
    );
    setFilteredDoctors(filtered);
  }, [search, doctors]);

  if (loading || fetching) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/admin" className="text-primary hover:underline flex items-center text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">Doctor Management</h1>
          <p className="text-muted-foreground text-lg">Select a doctor to manage their availability schedule.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
          <Input 
            placeholder="Search by name or department..." 
            className="pl-9 h-11 bg-background border-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No doctors found matching "{search}"
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-semibold text-foreground">{doc.full_name}</TableCell>
                    <TableCell>{doc.department_name}</TableCell>
                    <TableCell className="text-muted-foreground">{doc.specialization || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/doctors/${doc.id}/availability`}>
                        <Button variant="outline" size="sm" className="text-primary border-primary/20 hover:bg-primary/10">
                          <CalendarPlus className="h-4 w-4 mr-2" /> Manage Schedule
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
