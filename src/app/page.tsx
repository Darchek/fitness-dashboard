"use client";
import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, LabelList,
} from 'recharts';

const EMOJI: Record<string,string> = {
  running:'🏃',cycling:'🚴',walking:'🚶',hiking:'⛰️',swimming:'🏊',other:'🏋️',
  'push-ups':'💪','sit-ups':'🧘',squats:'🦵','pull-ups':'🏋️',
  lunges:'🦴',plank:'🧱',burpees:'⚡',
};
const TYPE_COLORS: Record<string,string> = {
  running:  '#f97316',
  cycling:  '#06b6d4',
  walking:  '#22c55e',
  hiking:   '#84cc16',
  swimming: '#3b82f6',
  other:    '#8b5cf6',
};
const PIE_COLORS = ['#f97316','#06b6d4','#22c55e','#84cc16','#3b82f6','#8b5cf6'];

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
      <div className="font-semibold mb-1" style={{ color:'var(--text-primary)' }}>{label}</div>
      {payload.map((p:any) => (
        <div key={p.name} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span style={{ color:'var(--text-secondary)' }}>{p.name}: </span>
          <span style={{ color:'var(--text-primary)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function Card({ label, value, sub, icon, grad, delay='0' }: any) {
  return (
    <div className="rounded-2xl p-5 fade-up" style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      animationDelay: delay+'s', opacity: 0,
    }}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color:'var(--text-muted)' }}>{label}</div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: grad || 'var(--bg-secondary)' }}>{icon}</div>
      </div>
      <div className="text-3xl font-bold" style={{ fontFamily:'Space Grotesk' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => { fetch('/api/stats').then(r=>r.json()).then(setStats); }, []);

  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-sm" style={{ color:'var(--text-muted)' }}>Loading…</div>
    </div>
  );

  const splitData = [
    { name:'Cardio',   value: stats.totalCardio   },
    { name:'Strength', value: stats.totalStrength },
  ];

  return (
    <div className="space-y-8">
      <div className="fade-up" style={{ opacity:0 }}>
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p style={{ color:'var(--text-secondary)' }}>Your fitness overview at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Total Workouts" value={stats.totalWorkouts}
          icon="🏋️" grad="linear-gradient(135deg,#4f8ef7,#7c3aed)" delay="0.05" />
        <Card label="Total Distance" value={`${stats.totalDistance} km`}
          icon="📍" grad="linear-gradient(135deg,#22d3a4,#059669)" delay="0.10" />
        <Card label="Calories Burned" value={Number(stats.totalCalories).toLocaleString()}
          icon="🔥" grad="linear-gradient(135deg,#fb923c,#f59e0b)" delay="0.15" sub="from cardio" />
        <Card label="Most Active Day" value={stats.mostActiveDay}
          icon="⭐" grad="linear-gradient(135deg,#a855f7,#ec4899)" delay="0.20" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly bar */}
        <div className="lg:col-span-2 rounded-2xl p-6 fade-up delay-3"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <h3 className="text-base font-semibold mb-1">Weekly Activity</h3>
          <p className="text-xs mb-5" style={{ color:'var(--text-muted)' }}>Last 12 weeks</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.weeklyActivity} barSize={8} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} width={20} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="cardio"   name="Cardio"   fill="#4f8ef7" radius={[3,3,0,0]} />
              <Bar dataKey="strength" name="Strength" fill="#a855f7" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[['#4f8ef7','Cardio'],['#a855f7','Strength']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5 text-xs" style={{ color:'var(--text-muted)' }}>
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background:c }} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Split donut */}
        <div className="rounded-2xl p-6 fade-up delay-4"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <h3 className="text-base font-semibold mb-1">Workout Split</h3>
          <p className="text-xs mb-2" style={{ color:'var(--text-muted)' }}>Cardio vs Strength</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={splitData} cx="50%" cy="50%" innerRadius={42} outerRadius={65}
                dataKey="value" paddingAngle={4}>
                <Cell fill="#4f8ef7" /><Cell fill="#a855f7" />
              </Pie>
              <Tooltip content={<Tip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {splitData.map((d,i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: i===0?'#4f8ef7':'#a855f7' }} />
                  <span style={{ color:'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span className="font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cardio by type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 fade-up delay-4"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <h3 className="text-base font-semibold mb-1">Cardio by Type</h3>
          <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>Sessions &amp; distance per activity</p>
          <ResponsiveContainer width="100%" height={Math.max(160, stats.cardioByType.length * 46)}>
            <BarChart
              data={stats.cardioByType}
              layout="vertical"
              margin={{ left: 0, right: 60, top: 0, bottom: 0 }}
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill:'var(--text-primary)', fontSize:12, fontWeight:500 }}
                axisLine={false}
                tickLine={false}
                width={72}
                tickFormatter={(v:string) => `${EMOJI[v]||'🏃'} ${v.charAt(0).toUpperCase()+v.slice(1)}`}
              />
              <Tooltip content={<Tip />} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" name="Sessions" radius={[0,6,6,0]}>
                {stats.cardioByType.map((d:any,i:number) => (
                  <Cell key={i} fill={TYPE_COLORS[d.name] || PIE_COLORS[i%PIE_COLORS.length]} />
                ))}
                <LabelList
                  dataKey="total_km"
                  position="right"
                  style={{ fill:'var(--text-secondary)', fontSize:11 }}
                  formatter={(v:any) => v ? `${v} km` : ''}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent workouts */}
        <div className="rounded-2xl p-6 fade-up delay-5"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <h3 className="text-base font-semibold mb-4">Recent Workouts</h3>
          <div className="space-y-2">
            {stats.recentWorkouts.map((w:any) => (
              <div key={`${w.category}-${w.id}`} className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{ background:'var(--bg-secondary)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: w.category==='cardio' ? 'rgba(79,142,247,0.15)' : 'rgba(168,85,247,0.15)' }}>
                  {EMOJI[w.activity] || (w.category==='cardio'?'❤️':'💪')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs capitalize">{w.activity}</div>
                  <div className="text-xs" style={{ color:'var(--text-muted)' }}>
                    {new Date(w.workout_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                  </div>
                </div>
                <div className="text-right text-xs flex-shrink-0">
                  {w.distance_km ? <div className="font-semibold">{parseFloat(w.distance_km).toFixed(1)} km</div> : null}
                  {w.calories ? <div style={{ color:'var(--text-muted)' }}>{w.calories} cal</div> : null}
                  {!w.distance_km && !w.calories && (
                    <span className="px-2 py-0.5 rounded-lg text-xs"
                      style={{ background:'rgba(168,85,247,0.15)', color:'#a855f7' }}>strength</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
