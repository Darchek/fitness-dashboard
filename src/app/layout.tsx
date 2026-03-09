import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import AddWorkoutModal from '@/components/AddWorkoutModal';
import LoginModal from '@/components/LoginModal';

export const metadata: Metadata = {
  title: 'FitTrack',
  description: 'Personal fitness dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <AuthProvider>
          {/* Login gate — blocks everything until authenticated */}
          <LoginModal />

          {/* Mobile top bar (visible only on small screens) */}
          <MobileHeader />

          {/* Sidebar (always visible on desktop, slide-in overlay on mobile) */}
          <Sidebar />

          {/* Main content: offset by sidebar on desktop, offset by header on mobile */}
          <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0">
            <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
          </main>

          <AddWorkoutModal />
        </AuthProvider>
      </body>
    </html>
  );
}
