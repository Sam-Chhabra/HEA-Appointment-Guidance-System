import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Activity, CalendarSearch, Stethoscope, Search, CalendarCheck } from "lucide-react";
import { Hero } from "@/components/blocks/hero";
import { BentoGrid } from "@/components/blocks/bento-grid";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full pb-24">
      
      {/* Glow / Lamp Hero */}
      <Hero
        title="Find the right care. Faster."
        subtitle="Describe your symptoms, get instantaneous department recommendations, and book an appointment with our specialists in minutes."
        actions={[
          {
            label: "Get started",
            href: "/guidance",
            variant: "default"
          },
          {
            label: "Browse Doctors",
            href: "/doctors",
            variant: "outline"
          }
        ]}
        titleClassName="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight"
        subtitleClassName="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto"
        actionsClassName="mt-10 justify-center gap-6 *:h-14 *:px-10 *:text-lg *:rounded-xl"
      />

      <div className="w-full mx-auto px-4 mt-8 sm:mt-0">
        
        {/* Separator line */}
        <div className="w-full h-px bg-border mb-16 max-w-5xl mx-auto"></div>

        {/* Animated Bento Grid */}
        <BentoGrid />


        {/* Disclaimer */}
        <div className="max-w-3xl mx-auto mt-32">
          <Alert variant="destructive" className="bg-red-950/20 border-red-900 text-red-400 rounded-xl">
            <AlertTriangle className="h-5 w-5 !text-red-500" />
            <AlertTitle className="font-bold text-red-400">Important Disclaimer</AlertTitle>
            <AlertDescription className="text-red-400/80 mt-2 text-sm leading-relaxed">
              This system is for appointment guidance only and <strong>does not provide medical diagnosis, triage, or clinical decision-making</strong>. 
              If you are experiencing a medical emergency, please call emergency services immediately or go to the nearest emergency room.
            </AlertDescription>
          </Alert>
        </div>

      </div>
    </div>
  );
}
