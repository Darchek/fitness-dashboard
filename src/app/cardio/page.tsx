"use client";
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

const TYPE_COLORS: Record<string,string> = {
  running:'#4f8ef7',cycling:'#22d3a4',walking:'#fb923c',hiking:'#a855f7',swimming:'#60a5fa',other:'#9ca3af',
};
const TYPE_EMOJI: Record<string,string> = {
  running:'🏃',cycling:'🚴',walking:'🚶',hiking:'⛰️',swimming:'🏊',other:'🏋️',
};

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p:any)=>(
        <div key={p.name}><span style={{ color:'var(--text-secondary)' }}>{p.name}: </span>
          <span>{p.value}{p.name==='Distance'?' km':p.name==='Speed'?' km/h':''}</span></div>
      ))}
    </div>
  );
};

export default function CardioPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    fetch('/api/cardio?limit=200&exclude=cycling').then(r=>r.json()).then(setWorkouts).finally(()=>setLoading(false));
  }, []);

  const filtered  = filter==='all' ? workouts : workouts.filter(w=>w.type===filter);
  const types     = Array.from(new Set(workouts.map(w=>w.type)));
  const totalDist = filtered.reduce((s,w)=>s+parseFloat(w.distance_km||0),0);
  const totalCal  = filtered.reduce((s,w)=>s+(w.calories||0),0);
  const avgSpeed  = filtered.filter(w=>w.avg_speed_kmh).reduce((s,w,_,a)=>s+parseFloat(w.avg_speed_kmh)/a.length,0);

  // Chart data: chronological for area chart
  const chartData = [...filtered].reverse().map(w=>({
    date: new Date(w.workout_date).toLocaleDateString('en-US',{month:'short',day:'numeric'}),
    Distance: parseFloat(parseFloat(w.distance_km).toFixed(1)),
    Speed: w.avg_speed_kmh ? parseFloat(parseFloat(w.avg_speed_kmh).toFixed(1)) : 0,
  }));

  return (
    <div className="space-y-8">
      <div className="fade-up" style={{ opacity:0 }}>
        <h1 className="text-3xl font-bold mb-1">Cardio</h1>
        <p style={{ color:'var(--text-secondary)' }}>Your cardiovascular training history</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l:'Sessions',       v: filtered.length,           c:'var(--blue)'   },
          { l:'Total Distance', v:`${totalDist.toFixed(1)} km`, c:'var(--green)' },
          { l:'Total Calories', v:`${totalCal.toLocaleString()} cal`, c:'var(--orange)' },
          { l:'Avg Speed',      v: avgSpeed ? `${avgSpeed.toFixed(1)} km/h` : '—', c:'var(--purple)' },
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

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {['all',...types].map(t=>(
          <button key={t} onClick={()=>setFilter(t)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all"
            style={{
              background: filter===t?'var(--blue)':'var(--bg-card)',
              color:       filter===t?'white':'var(--text-secondary)',
              border:'1px solid var(--border)',
            }}>
            {t==='all'?'All':TYPE_EMOJI[t]||''} {t==='all'?'activities':t}
          </button>
        ))}
      </div>

      {/* Distance area chart */}
      <div className="rounded-2xl p-6 fade-up delay-2" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <h3 className="text-base font-semibold mb-1">Distance per Session</h3>
        <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>{filtered.length} sessions shown</p>
        {loading ? <div className="h-48 flex items-center justify-center text-sm" style={{ color:'var(--text-muted)' }}>Loading…</div> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4f8ef7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={35} unit=" km" />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="Distance" stroke="#4f8ef7" strokeWidth={2}
                fill="url(#dGrad)" dot={{ fill:'#4f8ef7', r:3, strokeWidth:0 }} activeDot={{ r:5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Activity type breakdown */}
      <div className="rounded-2xl p-6 fade-up delay-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <h3 className="text-base font-semibold mb-4">Activity Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {types.map(t=>{
            const tw = workouts.filter(w=>w.type===t);
            const tdist = tw.reduce((s,w)=>s+parseFloat(w.distance_km||0),0);
            return (
              <div key={t} className="rounded-xl p-4 text-center" style={{ background:'var(--bg-secondary)' }}>
                <div className="text-2xl mb-1">{TYPE_EMOJI[t]||'🏅'}</div>
                <div className="font-semibold text-xs capitalize mb-1">{t}</div>
                <div className="text-xl font-bold" style={{ color:TYPE_COLORS[t]||'var(--text-primary)' }}>{tw.length}</div>
                <div className="text-xs" style={{ color:'var(--text-muted)' }}>{tdist.toFixed(1)} km</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl p-6 fade-up delay-4" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <h3 className="text-base font-semibold mb-4">All Cardio Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Date','Type','Distance','Duration','Avg Speed','Calories','Notes'].map(h=>(
                  <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color:'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(w=>(
                <tr key={w.id} style={{ borderBottom:'1px solid rgba(39,39,54,0.6)' }}>
                  <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>
                    {new Date(w.workout_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-2">
                      {TYPE_EMOJI[w.type]}
                      <span className="capitalize" style={{ color:TYPE_COLORS[w.type]||'var(--text-primary)' }}>{w.type}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold">{parseFloat(w.distance_km).toFixed(1)} km</td>
                  <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{w.duration_min ? `${w.duration_min} min` : '—'}</td>
                  <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{w.avg_speed_kmh ? `${parseFloat(w.avg_speed_kmh).toFixed(1)} km/h` : '—'}</td>
                  <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{w.calories ? `${w.calories} cal` : '—'}</td>
                  <td className="py-3 pr-4 truncate max-w-xs text-xs" style={{ color:'var(--text-muted)' }}>{w.notes||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
