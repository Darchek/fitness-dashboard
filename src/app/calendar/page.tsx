"use client";
import { useState } from 'react';
import Calendar from 'react-calendar';

const EMOJI: Record<string,string> = {
  running:'🏃',cycling:'🚴',walking:'🚶',hiking:'⛰️',swimming:'🏊',other:'🏋️',
  'push-ups':'💪','sit-ups':'🧘',squats:'🦵','pull-ups':'🏋️',lunges:'🦴',plank:'🧱',burpees:'⚡',
};

const localDateStr = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const DOT_COLORS: Record<string, string> = {
  cardio:   '#4f8ef7',
  strength: '#a855f7',
  weight:   '#f97316',
  alcohol:  '#ef4444',
};

const DOT_LABELS: Record<string, string> = {
  cardio:   'Cardio',
  strength: 'Strength',
  weight:   'Weight',
  alcohol:  'Alcohol',
};

export default function CalendarPage() {
  const [selected, setSelected] = useState<Date|null>(null);
  const [dayData,  setDayData]  = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [dotMap,   setDotMap]   = useState<Record<string,string[]>>({});

  useState(() => {
    fetch('/api/stats').then(r=>r.json()).then(data => {
      const m: Record<string,string[]> = {};
      (data.workoutDays || []).forEach((d: any) => {
        m[d.day] = d.categories.split(',');
      });
      setDotMap(m);
    });
  });

  const handleDay = async (date: Date) => {
    setSelected(date);
    setLoading(true);
    const d = localDateStr(date);
    const [cr, sr, wr, hr] = await Promise.all([
      fetch(`/api/cardio?from=${d} 00:00:00&to=${d} 23:59:59`).then(r=>r.json()),
      fetch(`/api/strength?from=${d} 00:00:00&to=${d} 23:59:59`).then(r=>r.json()),
      fetch(`/api/weight?from=${d} 00:00:00&to=${d} 23:59:59`).then(r=>r.json()),
      fetch(`/api/habits?from=${d} 00:00:00&to=${d} 23:59:59`).then(r=>r.json()),
    ]);
    setDayData([
      ...cr.map((w:any) => ({ ...w, activity: w.type,     category: 'cardio',   date: w.workout_date })),
      ...sr.map((w:any) => ({ ...w, activity: w.exercise, category: 'strength', date: w.workout_date })),
      ...wr.map((w:any) => ({ ...w, activity: 'weight',   category: 'weight',   date: w.measured_at  })),
      ...hr.map((w:any) => ({ ...w, activity: w.habit,    category: 'alcohol',  date: w.event_date   })),
    ].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setLoading(false);
  };

  const tileContent = ({ date }: { date: Date }) => {
    const key = localDateStr(date);
    const cats = dotMap[key];
    if (!cats) return null;
    return (
      <div className="flex gap-1 justify-center mt-1 flex-wrap">
        {['cardio','strength','weight','alcohol'].map(cat =>
          cats.includes(cat) && (
            <div key={cat} className="w-2 h-2 rounded-full" style={{ background: DOT_COLORS[cat] }} />
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="fade-up" style={{ opacity:0 }}>
        <h1 className="text-3xl font-bold mb-1">Calendar</h1>
        <p style={{ color:'var(--text-secondary)' }}>Click a day to see your activity</p>
      </div>

      <div className="rounded-2xl p-6 fade-up delay-1"
        style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        <div className="flex gap-4 mb-4 text-xs flex-wrap" style={{ color:'var(--text-muted)' }}>
          {Object.entries(DOT_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {DOT_LABELS[cat]}
            </div>
          ))}
        </div>
        <Calendar onClickDay={handleDay} tileContent={tileContent} value={selected} />
      </div>

      <div className="rounded-2xl p-6 fade-up delay-2"
        style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
        {selected ? (
          <>
            <h3 className="text-base font-semibold mb-0.5">
              {selected.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
            </h3>
            <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>
              {loading ? 'Loading…' : `${dayData.length} entr${dayData.length!==1?'ies':'y'}`}
            </p>
            {!loading && dayData.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <div className="text-3xl mb-2">😴</div>
                <div className="text-sm" style={{ color:'var(--text-muted)' }}>Rest day</div>
              </div>
            )}
            <div className="space-y-3">
              {dayData.map((w:any, i:number) => (
                <div key={`${w.category}-${w.id ?? i}`} className="p-3 rounded-xl"
                  style={{ background:'var(--bg-secondary)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">
                      {w.category === 'weight'  ? '⚖️' :
                       w.category === 'alcohol' ? '🍺' :
                       EMOJI[w.activity] || '🏋️'}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-sm capitalize">
                        {w.category === 'weight'  ? `Weight: ${parseFloat(w.weight_kg).toFixed(1)} kg` :
                         w.category === 'alcohol' ? 'Alcohol consumed' :
                         w.activity}
                      </div>
                      <div className="text-xs" style={{ color:'var(--text-muted)' }}>
                        {new Date(w.date).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-lg" style={{
                      background: `${DOT_COLORS[w.category]}22`,
                      color:       DOT_COLORS[w.category],
                    }}>{w.category}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs" style={{ color:'var(--text-secondary)' }}>
                    {w.distance_km && <div>📍 {parseFloat(w.distance_km).toFixed(1)} km</div>}
                    {w.duration_min && <div>⏱ {w.duration_min} min</div>}
                    {w.calories && <div>🔥 {w.calories} cal</div>}
                    {w.total_reps && <div>🔄 {w.total_reps} reps</div>}
                    {w.notes && <div className="col-span-2">📝 {w.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-52 text-center">
            <div className="text-4xl mb-3">📅</div>
            <div className="font-medium mb-1">Select a day</div>
            <div className="text-sm" style={{ color:'var(--text-muted)' }}>Click any date to view activity</div>
          </div>
        )}
      </div>
    </div>
  );
}
