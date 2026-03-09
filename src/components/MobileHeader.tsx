"use client";
import { useAuth } from '@/lib/auth';

export default function MobileHeader() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center px-4 gap-3 lg:hidden"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Hamburger */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)' }}
        >
          🔥
        </div>
        <span className="font-bold text-sm">FitTrack</span>
      </div>

      <div className="flex-1" />

      {/* Quick add — admin only */}
      {isAdmin && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-add-workout'))}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)', color: 'white' }}
        >
          + Add
        </button>
      )}
    </header>
  );
}
