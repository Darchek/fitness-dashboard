"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const GREEN  = '#22d3a4';
const BLUE   = '#4f8ef7';
const ORANGE = '#f59e0b';
const PURPLE = '#a855f7';

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
      <div className="font-semibold mb-2" style={{ color:'var(--text-secondary)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold">{p.value != null ? p.value : '—'}{p.unit}</span>
        </div>
      ))}
    </div>
  );
};

export default function BikePage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bike?limit=200').then(r=>r.json()).then(setSessions).finally(()=>setLoading(false));
  }, []);

  const totalDist = sessions.reduce((s,w)=>s+parseFloat(w.distance_km||0),0);
  const totalCal  = sessions.reduce((s,w)=>s+(w.calories||0),0);
  const avgSpeed  = sessions.filter(w=>w.avg_speed_kmh).reduce((s,w,_,a)=>s+parseFloat(w.avg_speed_kmh)/a.length,0);
  const maxSpeed  = Math.max(...sessions.map(w=>parseFloat(w.max_speed||0)));
  const avgCal    = sessions.filter(w=>w.calories).reduce((s,w,_,a)=>s+(w.calories/a.length),0);

  // chronological, last 30 sessions for readability
  const chartData = [...sessions].reverse().slice(-30).map(w => ({
    date:     new Date(w.workout_date).toLocaleDateString('en-US',{month:'short',day:'numeric'}),
    Distance: parseFloat(parseFloat(w.distance_km||0).toFixed(2)),
    Speed:    w.avg_speed_kmh ? parseFloat(parseFloat(w.avg_speed_kmh).toFixed(1)) : null,
    Calories: w.calories || null,
    id:       w.id,
  }));

  return (
    <div className="space-y-8">
      <div className="fade-up" style={{ opacity:0 }}>
        <h1 className="text-3xl font-bold mb-1">🚴 Bike Sessions</h1>
        <p style={{ color:'var(--text-secondary)' }}>All your cycling workouts with detailed metrics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { l:'Sessions',       v: sessions.length,                          c: GREEN   },
          { l:'Total Distance', v:`${totalDist.toFixed(1)} km`,              c: BLUE    },
          { l:'Total Calories', v:`${totalCal.toLocaleString()} cal`,        c: ORANGE  },
          { l:'Avg Speed',      v: avgSpeed ? `${avgSpeed.toFixed(1)} km/h` : '—', c: GREEN  },
          { l:'Max Speed',      v: maxSpeed ? `${maxSpeed.toFixed(1)} km/h` : '—', c: PURPLE },
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

      {/* Combined chart: Distance bars + Speed line */}
      <div className="rounded-2xl p-6 fade-up delay-2" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold">Performance Overview</h3>
            <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>Distance (bars) · Avg speed (line) · Last {chartData.length} sessions</p>
          </div>
          <div className="flex gap-4 text-xs" style={{ color:'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background:BLUE }}></span>Distance</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block" style={{ background:GREEN }}></span>Speed</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 inline-block border-t-2 border-dashed" style={{ borderColor:ORANGE }}></span>Calories</span>
          </div>
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-sm" style={{ color:'var(--text-muted)' }}>Loading…</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData} margin={{ top:10, right:10, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              {/* Left Y: Distance */}
              <YAxis yAxisId="dist" orientation="left"
                tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={36} unit=" km" />
              {/* Right Y: Speed */}
              <YAxis yAxisId="speed" orientation="right"
                tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={42} unit=" km/h"
                domain={['auto','auto']} />
              <Tooltip content={<Tip />}
                contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)' }} />
              <Bar yAxisId="dist" dataKey="Distance" fill={BLUE} fillOpacity={0.7} radius={[4,4,0,0]} unit=" km" />
              <Line yAxisId="speed" type="monotone" dataKey="Speed" name="Speed" stroke={GREEN}
                strokeWidth={2} dot={{ fill:GREEN, r:3, strokeWidth:0 }} activeDot={{ r:5 }} unit=" km/h" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sessions table */}
      <div className="rounded-2xl p-6 fade-up delay-3" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <h3 className="text-base font-semibold mb-4">All Sessions</h3>
        {loading ? (
          <div className="text-sm py-8 text-center" style={{ color:'var(--text-muted)' }}>Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Date','Distance','Duration','Avg Speed','Max Speed','Avg Cadence','Calories',''].map(h=>(
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold uppercase tracking-wider"
                      style={{ color:'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(w=>(
                  <tr key={w.id} className="hover:bg-white/5 transition-colors" style={{ borderBottom:'1px solid rgba(39,39,54,0.6)' }}>
                    <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>
                      {new Date(w.workout_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </td>
                    <td className="py-3 pr-4 font-semibold" style={{ color:GREEN }}>{parseFloat(w.distance_km||0).toFixed(1)} km</td>
                    <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>
                      {w.duration_min
                        ? `${Math.floor(w.duration_min)}:${Math.round((w.duration_min % 1) * 60)
                            .toString()
                            .padStart(2, '0')}`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{w.avg_speed_kmh ? `${parseFloat(w.avg_speed_kmh).toFixed(1)} km/h` : '—'}</td>
                    <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{parseFloat(w.max_speed||0) > 0 ? `${parseFloat(w.max_speed).toFixed(1)} km/h` : '—'}</td>
                    <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{parseFloat(w.avg_cadence||0) > 0 ? `${parseFloat(w.avg_cadence).toFixed(0)} rpm` : '—'}</td>
                    <td className="py-3 pr-4" style={{ color:'var(--text-secondary)' }}>{w.calories ? `${w.calories} cal` : '—'}</td>
                    <td className="py-3">
                      {parseInt(w.data_points) > 0 && (
                        <Link href={`/bike/${w.id}`}
                          className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                          style={{ background:'rgba(34,211,164,0.12)', color:GREEN }}>
                          View →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
