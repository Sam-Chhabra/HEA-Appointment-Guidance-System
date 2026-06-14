import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navigation } from "@/components/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HEA Appointment Guidance System",
  description: "Hospital Appointment Guidance and Booking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <AuthProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-background border-t py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} HEA Appointment Guidance System. This is a non-diagnostic guidance tool.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
