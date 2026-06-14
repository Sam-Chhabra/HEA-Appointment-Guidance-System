import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[calc(100vh-140px)]">
      <Card className="w-full max-w-md text-center shadow-lg border-destructive/20 bg-card">
        <CardHeader>
          <div className="flex justify-center mb-6">
            <div className="bg-destructive/10 p-5 rounded-full border border-destructive/20">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Access Denied</CardTitle>
          <CardDescription className="text-base mt-2">
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This section is restricted to specific staff roles. If you believe this is an error, please contact the hospital administration.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pb-8 pt-4">
          <Link href="/">
            <Button className="h-11 px-8 font-medium">
              <Home className="h-4 w-4 mr-2" /> Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
