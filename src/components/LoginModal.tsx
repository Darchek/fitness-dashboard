"use client";
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function LoginModal() {
  const { user, login } = useAuth();
  const [username, setUsername]               = useState('');
  const [password, setPassword]               = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [error, setError]                     = useState('');
  const [loading, setLoading]                 = useState(false);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body: Record<string, string> = { username: username.trim() };
      if (requiresPassword) body.password = password;

      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();

      if (r.status === 404) {
        setError('Name not found. Check the spelling.');
      } else if (r.status === 401) {
        setError('Wrong password. Try again.');
      } else if (data.requiresPassword) {
        setRequiresPassword(true);
      } else if (data.user) {
        login(data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 fade-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg,#4f8ef7,#7c3aed)' }}
          >
            🔥
          </div>
          <div>
            <div className="font-bold text-xl">FitTrack</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {requiresPassword ? 'Enter your password' : 'Who are you?'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Your name
            </label>
            <input
              type="text"
              required
              autoFocus={!requiresPassword}
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setRequiresPassword(false);
                setPassword('');
                setError('');
              }}
              placeholder="Enter your name"
              className="fit-input"
              disabled={requiresPassword}
              style={requiresPassword ? { opacity: 0.5 } : {}}
            />
          </div>

          {/* Password field (admin only) */}
          {requiresPassword && (
            <div className="fade-up">
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Password
              </label>
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                className="fit-input"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="text-xs p-3 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: loading ? 'var(--border)' : 'linear-gradient(135deg,#4f8ef7,#7c3aed)',
              color: 'white',
            }}
          >
            {loading ? 'Checking…' : requiresPassword ? 'Login' : 'Enter'}
          </button>

          {/* Back link when password shown */}
          {requiresPassword && (
            <button
              type="button"
              onClick={() => { setRequiresPassword(false); setPassword(''); setError(''); }}
              className="w-full text-xs text-center pt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              ← Not you?
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
