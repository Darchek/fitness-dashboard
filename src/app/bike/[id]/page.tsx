"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';

const COLORS = {
  speed:      '#22d3a4',
  cadence:    '#4f8ef7',
  resistance: '#f59e0b',
  heartRate:  '#f43f5e',
  distance:   '#a855f7',
};

const ChartTip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p:any)=>(
        <div key={p.name} style={{ color:p.color }}>{p.name}: <span className="font-bold">{p.value}{unit}</span></div>
      ))}
    </div>
  );
};

function MetricChart({ data, dataKey, label, color, unit, avg }: any) {
  const hasData = data.some((d:any) => d[dataKey] != null && d[dataKey] > 0);
  if (!hasData) return null;
  return (
    <div className="rounded-2xl p-6 fade-up" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">{label}</h3>
        {avg > 0 && (
          <span className="text-xs px-2 py-1 rounded-full font-semibold"
            style={{ background:`${color}20`, color }}>
            avg {avg.toFixed(1)}{unit}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="t" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={38} unit={unit} />
          <Tooltip content={<ChartTip unit={unit} />} />
          {avg > 0 && <ReferenceLine y={avg} stroke={color} strokeDasharray="4 4" strokeOpacity={0.4} />}
          <Line type="monotone" dataKey={dataKey} name={label} stroke={color} strokeWidth={2}
            dot={false} activeDot={{ r:4, fill:color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BikeSessionPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/bike/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-sm" style={{ color:'var(--text-muted)' }}>Loading…</div>
  );
  if (error || !data) return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">😕</div>
      <p style={{ color:'var(--text-muted)' }}>Session not found</p>
      <Link href="/bike" className="mt-4 inline-block text-sm" style={{ color:'var(--blue)' }}>← Back to sessions</Link>
    </div>
  );

  // Build time-series: use elapsed minutes from first point
  const t0 = data.metrics.length ? new Date(data.metrics[0].measured_at).getTime() : 0;
  const chartData = data.metrics.map((m: any) => {
    const elapsedMin = ((new Date(m.measured_at).getTime() - t0) / 60000).toFixed(1);
    return {
      t: `${elapsedMin}m`,
      speed:      m.speed      != null ? parseFloat(m.speed)      : null,
      cadence:    m.cadence    != null ? m.cadence                 : null,
      resistance: m.resistance != null ? m.resistance              : null,
      heartRate:  m.heart_rate != null ? m.heart_rate              : null,
      distance:   m.distance   != null ? parseFloat(m.distance)    : null,
    };
  });

  const avg = (key: string) => {
    const vals = chartData.filter((d:any) => d[key] != null && d[key] > 0).map((d:any) => d[key]);
    return vals.length ? vals.reduce((a:number, b:number) => a + b, 0) / vals.length : 0;
  };
  const max = (key: string) => {
    const vals = chartData.filter((d:any) => d[key] != null).map((d:any) => d[key]);
    return vals.length ? Math.max(...vals) : 0;
  };

  const sessionDate = new Date(data.workout_date).toLocaleDateString('en-US', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });

  const stats = [
    { l:'Distance',    v:`${parseFloat(data.distance_km||0).toFixed(2)} km`, c:COLORS.distance },
    { l:'Duration',    v:data.duration_min ? `${Math.floor(data.duration_min)}:${String(Math.round((data.duration_min % 1) * 60)).padStart(2, '0')} min` : '—', c:'var(--text-secondary)' },
    { l:'Avg Speed',   v:data.avg_speed_kmh ? `${parseFloat(data.avg_speed_kmh).toFixed(1)} km/h` : '—', c:COLORS.speed },
    { l:'Max Speed',   v:max('speed') > 0 ? `${max('speed').toFixed(1)} km/h` : '—', c:COLORS.speed },
    { l:'Avg Cadence', v:avg('cadence') > 0 ? `${avg('cadence').toFixed(0)} rpm` : '—', c:COLORS.cadence },
    { l:'Max Cadence', v:max('cadence') > 0 ? `${max('cadence').toFixed(0)} rpm` : '—', c:COLORS.cadence },
    { l:'Avg Resistance', v:avg('resistance') > 0 ? avg('resistance').toFixed(1) : '—', c:COLORS.resistance },
    { l:'Avg Heart Rate', v:avg('heartRate') > 0 ? `${avg('heartRate').toFixed(0)} bpm` : '—', c:COLORS.heartRate },
    { l:'Calories',    v:data.calories ? `${data.calories} cal` : '—', c:'var(--orange)' },
    { l:'Data Points', v:data.metrics.length, c:'var(--text-muted)' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="fade-up" style={{ opacity:0 }}>
        <Link href="/bike" className="text-xs mb-3 inline-flex items-center gap-1 transition-colors"
          style={{ color:'var(--text-muted)' }}>
          ← All bike sessions
        </Link>
        <h1 className="text-3xl font-bold mb-1">🚴 Bike Session</h1>
        <p style={{ color:'var(--text-secondary)' }}>{sessionDate}</p>
        {data.notes && (
          <p className="mt-2 text-sm px-3 py-2 rounded-lg inline-block" style={{ background:'var(--bg-card)', color:'var(--text-muted)' }}>
            📝 {data.notes}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <div key={s.l} className="rounded-2xl p-4 fade-up" style={{
            background:'var(--bg-card)', border:'1px solid var(--border)',
            animationDelay:`${i*0.04}s`, opacity:0,
          }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color:'var(--text-muted)' }}>{s.l}</div>
            <div className="text-lg font-bold" style={{ color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {data.metrics.length === 0 ? (
        <div className="rounded-2xl p-8 text-center" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div className="text-3xl mb-2">📭</div>
          <p style={{ color:'var(--text-muted)' }}>No detailed metrics recorded for this session.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <MetricChart data={chartData} dataKey="speed"      label="Speed"      color={COLORS.speed}      unit=" km/h" avg={avg('speed')} />
          <MetricChart data={chartData} dataKey="cadence"    label="Cadence"    color={COLORS.cadence}    unit=" rpm"  avg={avg('cadence')} />
          <MetricChart data={chartData} dataKey="resistance" label="Resistance" color={COLORS.resistance} unit=""      avg={avg('resistance')} />
          <MetricChart data={chartData} dataKey="heartRate"  label="Heart Rate" color={COLORS.heartRate}  unit=" bpm"  avg={avg('heartRate')} />
          <MetricChart data={chartData} dataKey="distance"   label="Distance"   color={COLORS.distance}   unit=" km"   avg={0} />
        </div>
      )}
    </div>
  );
}
