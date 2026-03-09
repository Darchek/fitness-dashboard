"use client";
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from 'recharts';

const EX_EMOJI: Record<string,string> = {
  'push-ups':'💪','sit-ups':'🧘',squats:'🦵','pull-ups':'🏋️',
  lunges:'🦴',plank:'🧱',burpees:'⚡',other:'🏅',
};
const COLORS = ['#a855f7','#4f8ef7','#22d3a4','#fb923c','#f87171','#fbbf24','#34d399','#60a5fa'];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
      <div className="font-semibold mb-1 capitalize">{label}</div>
      {payload.map((p:any)=>(
        <div key={p.name}><span style={{ color:'var(--text-secondary)' }}>{p.name}: </span><span>{p.value}</span></div>
      ))}
    </div>
  );
};

export default function StrengthPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{
    fetch('/api/strength?limit=200').then(r=>r.json()).then(setWorkouts);
  },[]);

  // Aggregate by exercise
  const byEx = Array.from(new Set(workouts.map(w=>w.exercise))).map(ex=>{
    const ws = workouts.filter(w=>w.exercise===ex);
    const totalReps = ws.reduce((s,w)=>s+(w.total_reps||0),0);
    const maxWeight = Math.max(...ws.filter(w=>w.weight_kg).map(w=>parseFloat(w.weight_kg)));
    return { exercise: ex, count: ws.length, total_reps: totalReps, max_weight: isFinite(maxWeight) ? maxWeight : null };
  }).sort((a,b)=>b.total_reps - a.total_reps);

  // Weekly volume
  const weeklyMap: Record<string,number> = {};
  workouts.forEach(w=>{
    const d = new Date(w.workout_date);
    // ISO week label
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay()+6)%7));
    const key = monday.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    weeklyMap[key] = (weeklyMap[key]||0) + (w.total_reps||0);
  });
  const weeklyData = Object.entries(weeklyMap).slice(-12).map(([label, total_reps])=>({ label, total_reps }));

  const totalSessions = workouts.length;
  const totalReps     = workouts.reduce((s,w)=>s+(w.total_reps||0),0);
  const uniqueEx      = new Set(workouts.map(w=>w.exercise)).size;
  const maxSets       = Math.max(...workouts.map(w=>w.sets||0));

  return (
    <div className="space-y-8">
      <div className="fade-up" style={{ opacity:0 }}>
        <h1 className="text-3xl font-bold mb-1">Strength</h1>
        <p style={{ color:'var(--text-secondary)' }}>Your resistance training history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l:'Sessions',     v:totalSessions,                c:'var(--purple)' },
          { l:'Total Reps',   v:totalReps.toLocaleString(),   c:'var(--blue)'   },
          { l:'Exercises',    v:uniqueEx,                      c:'var(--green)'  },
          { l:'Max Sets',     v:isFinite(maxSets)?maxSets:'—', c:'var(--orange)' },
        ].map((s,i)=>(
          <div key={s.l} className="rounded-2xl p-5 fade-up" style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            animationDelay:`${i*0.05}s`, opacity:0,
          }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color:'var(--text-muted)' }}>{s.l}</div>
            <div className="text-2xl font-bold" style={{ color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reps by exercise */}
        <div className="rounded-2xl p-6 fade-up delay-2" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <h3 className="text-base font-semibold mb-1">Total Reps by Exercise</h3>
          <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>All time</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byEx} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="exercise" tick={{ fill:'var(--text-secondary)', fontSize:10 }}
                axisLine={false} tickLine={false} width={65} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="total_reps" name="Total Reps" radius={[0,4,4,0]}>
                {byEx.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly volume */}
        <div className="rounded-2xl p-6 fade-up delay-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <h3 className="text-base font-semibold mb-1">Weekly Volume</h3>
          <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>Total reps per week</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="total_reps" name="Total Reps" fill="#a855f7" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="rounded-2xl p-6 fade-up delay-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <h3 className="text-base font-semibold mb-4">Exercise Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {byEx.map((e,i)=>(
            <div key={e.exercise} className="rounded-xl p-4"
              style={{ background:'var(--bg-secondary)', borderLeft:`3px solid ${COLORS[i%COLORS.length]}` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{EX_EMOJI[e.exercise]||'🏅'}</span>
                <span className="font-semibold text-xs capitalize">{e.exercise}</span>
              </div>
              <div className="text-xs space-y-0.5" style={{ color:'var(--text-muted)' }}>
                <div>Sessions: <span style={{ color:'var(--text-primary)' }}>{e.count}</span></div>
                <div>Total reps: <span style={{ color:'var(--text-primary)' }}>{e.total_reps||'—'}</span></div>
                {e.max_weight && <div>Max weight: <span style={{ color:'var(--text-primary)' }}>{e.max_weight} kg</span></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl p-6 fade-up delay-4" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <h3 className="text-base font-semibold mb-4">All Strength Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Date','Exercise','Sets','Reps/Set','Total Reps','Weight','Notes'].map(h=>(
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color:'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workouts.map(w=>(
                <tr key={w.id} style={{ borderBottom:'1px solid rgba(39,39,54,0.6)' }}>
                  <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>
                    {new Date(w.workout_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2">
                      {EX_EMOJI[w.exercise]||'🏅'}
                      <span className="capitalize">{w.exercise}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{w.sets??'—'}</td>
                  <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{w.reps_per_set??'—'}</td>
                  <td className="py-3 pr-4 font-semibold">{w.total_reps??'—'}</td>
                  <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{w.weight_kg ? `${parseFloat(w.weight_kg).toFixed(1)} kg` : '—'}</td>
                  <td className="py-3 truncate max-w-xs text-xs" style={{ color:'var(--text-muted)' }}>{w.notes||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
