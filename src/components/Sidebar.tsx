"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

const nav = [
  { href: '/',          label: 'Dashboard', icon: '⚡' },
  { href: '/calendar',  label: 'Calendar',  icon: '📅' },
  { href: '/bike',      label: 'Bike',      icon: '🚴' },
  { href: '/cardio',    label: 'Cardio',    icon: '🏃' },
  { href: '/strength',  label: 'Strength',  icon: '💪' },
  { href: '/plan',      label: 'Plan',      icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Listen for hamburger toggle from MobileHeader
  useEffect(() => {
    const h = () => setOpen(o => !o);
    window.addEventListener('toggle-sidebar', h);
    return () => window.removeEventListener('toggle-sidebar', h);
  }, []);

  // Close on route change (mobile nav)
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-60 flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)' }}>🔥</div>
            <div>
              <div className="font-bold text-sm leading-tight">FitTrack</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Your fitness hub</div>
            </div>
          </div>
        </div>

        {/* Add button — admin only */}
        {isAdmin && (
          <div className="px-4 pb-5">
            <button
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new CustomEvent('open-add-workout'));
              }}
              className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)', color: 'white' }}>
              + Add Workout
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          <div className="text-xs font-semibold mb-2 px-2 uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}>Menu</div>
          {nav.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? 'rgba(79,142,247,0.12)' : 'transparent',
                  color:      active ? 'var(--blue)' : 'var(--text-secondary)',
                  borderLeft: active ? '2px solid var(--blue)' : '2px solid transparent',
                }}>
                <span className="text-base">{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-2">
          <div className="rounded-xl p-3" style={{ background: 'var(--bg-card)' }}>
            <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Keep it up! 💯</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Consistency beats intensity.</div>
          </div>
          {user && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                👤 <span style={{ color: 'var(--text-secondary)' }}>{user.username}</span>
                {user.role === 'admin' && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(79,142,247,0.18)', color: 'var(--blue)' }}>admin</span>}
              </span>
              <button onClick={logout} className="text-[10px] px-2 py-1 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
