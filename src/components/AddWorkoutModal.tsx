"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CARDIO_TYPES = ['running','cycling','walking','hiking','swimming','other'];
const STRENGTH_EX  = ['push-ups','sit-ups','squats','pull-ups','lunges','plank','burpees','other'];

function Label({ t }: { t: string }) {
  return <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
    style={{ color: 'var(--text-muted)' }}>{t}</label>;
}

export default function AddWorkoutModal() {
  const [open,    setOpen]    = useState(false);
  const [tab,     setTab]     = useState<'cardio'|'strength'>('cardio');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const now = new Date().toISOString().slice(0,16);

  const [cf, setCf] = useState({ workout_date: now, type: 'running', distance_km: '', duration_min: '', calories: '', notes: '' });
  const [sf, setSf] = useState({ workout_date: now, exercise: 'push-ups', sets: '', reps_per_set: '', weight_kg: '', duration_sec: '', notes: '' });

  useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener('open-add-workout', h);
    return () => window.removeEventListener('open-add-workout', h);
  }, []);

  const submit = async (url: string, data: object) => {
    setLoading(true);
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (r.ok) { setSuccess(true); setTimeout(() => { setSuccess(false); setOpen(false); router.refresh(); }, 1400); }
    } finally { setLoading(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div className="w-full max-w-lg rounded-2xl p-6 fade-up"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Add Workout</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
          {(['cardio','strength'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
              style={{ background: tab===t ? 'var(--blue)' : 'transparent', color: tab===t ? 'white' : 'var(--text-secondary)' }}>
              {t === 'cardio' ? '🏃 Cardio' : '💪 Strength'}
            </button>
          ))}
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-xl text-center text-sm font-medium"
            style={{ background: 'rgba(34,211,164,0.12)', color: 'var(--green)' }}>
            ✓ Workout saved!
          </div>
        )}

        {tab === 'cardio' ? (
          <form onSubmit={e => { e.preventDefault(); submit('/api/cardio', { ...cf, distance_km: parseFloat(cf.distance_km), duration_min: cf.duration_min ? parseFloat(cf.duration_min) : null, calories: cf.calories ? parseInt(cf.calories) : null }); }}
            className="space-y-4">
            <div><Label t="Date & Time" /><input type="datetime-local" required value={cf.workout_date} onChange={e => setCf({...cf, workout_date: e.target.value})} className="fit-input" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label t="Type" /><select value={cf.type} onChange={e => setCf({...cf, type: e.target.value})} className="fit-input">{CARDIO_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div><Label t="Distance (km)" /><input type="number" step="0.1" min="0" required value={cf.distance_km} onChange={e => setCf({...cf, distance_km: e.target.value})} placeholder="0.0" className="fit-input" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label t="Duration (min)" /><input type="number" step="0.5" min="0" value={cf.duration_min} onChange={e => setCf({...cf, duration_min: e.target.value})} placeholder="optional" className="fit-input" /></div>
              <div><Label t="Calories" /><input type="number" min="0" value={cf.calories} onChange={e => setCf({...cf, calories: e.target.value})} placeholder="optional" className="fit-input" /></div>
            </div>
            <div><Label t="Notes" /><input type="text" value={cf.notes} onChange={e => setCf({...cf, notes: e.target.value})} placeholder="optional" className="fit-input" /></div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-sm mt-1"
              style={{ background: loading ? 'var(--border)' : 'linear-gradient(135deg,#4f8ef7,#7c3aed)', color: 'white' }}>
              {loading ? 'Saving…' : 'Save Workout'}
            </button>
          </form>
        ) : (
          <form onSubmit={e => { e.preventDefault(); submit('/api/strength', { ...sf, sets: sf.sets ? parseInt(sf.sets) : null, reps_per_set: sf.reps_per_set ? parseInt(sf.reps_per_set) : null, weight_kg: sf.weight_kg ? parseFloat(sf.weight_kg) : null, duration_sec: sf.duration_sec ? parseInt(sf.duration_sec) : null }); }}
            className="space-y-4">
            <div><Label t="Date & Time" /><input type="datetime-local" required value={sf.workout_date} onChange={e => setSf({...sf, workout_date: e.target.value})} className="fit-input" /></div>
            <div><Label t="Exercise" /><select value={sf.exercise} onChange={e => setSf({...sf, exercise: e.target.value})} className="fit-input">{STRENGTH_EX.map(e=><option key={e} value={e}>{e}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label t="Sets" /><input type="number" min="1" value={sf.sets} onChange={e => setSf({...sf, sets: e.target.value})} placeholder="optional" className="fit-input" /></div>
              <div><Label t="Reps / Set" /><input type="number" min="1" value={sf.reps_per_set} onChange={e => setSf({...sf, reps_per_set: e.target.value})} placeholder="optional" className="fit-input" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label t="Weight (kg)" /><input type="number" step="0.5" min="0" value={sf.weight_kg} onChange={e => setSf({...sf, weight_kg: e.target.value})} placeholder="optional" className="fit-input" /></div>
              <div><Label t="Duration (sec)" /><input type="number" min="0" value={sf.duration_sec} onChange={e => setSf({...sf, duration_sec: e.target.value})} placeholder="optional" className="fit-input" /></div>
            </div>
            <div><Label t="Notes" /><input type="text" value={sf.notes} onChange={e => setSf({...sf, notes: e.target.value})} placeholder="optional" className="fit-input" /></div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-sm mt-1"
              style={{ background: loading ? 'var(--border)' : 'linear-gradient(135deg,#a855f7,#ec4899)', color: 'white' }}>
              {loading ? 'Saving…' : 'Save Workout'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
