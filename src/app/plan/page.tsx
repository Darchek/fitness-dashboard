"use client";

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TYPE_CONFIG: Record<string, { color: string; bg: string; badge: string; icon: string }> = {
  zone2:    { color: '#22d3a4', bg: 'rgba(34,211,164,0.10)',  badge: 'rgba(34,211,164,0.18)',  icon: '🟢' },
  hiit:     { color: '#f87171', bg: 'rgba(248,113,113,0.10)', badge: 'rgba(248,113,113,0.18)', icon: '🔴' },
  tempo:    { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  badge: 'rgba(251,191,36,0.18)',  icon: '🟡' },
  recovery: { color: '#818cf8', bg: 'rgba(129,140,248,0.10)', badge: 'rgba(129,140,248,0.18)', icon: '🟣' },
  rest:     { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', badge: 'rgba(107,114,128,0.15)', icon: '⚫' },
};

const TYPE_LABEL: Record<string, string> = {
  zone2: 'Zone 2', hiit: 'HIIT', tempo: 'Tempo', recovery: 'Recovery', rest: 'Rest',
};

const PLAN = [
  {
    day_of_week: 0, day_name: 'Sunday', workout_type: 'zone2', label: 'Intro Zone 2',
    resistance_min: 3, resistance_max: 4, hr_min: 113, hr_max: 132, duration_min: 40, distance_km: 16,
    notes: 'First day easy. If HR goes above 132 reduce resistance. ~16km expected.',
  },
  {
    day_of_week: 1, day_name: 'Monday', workout_type: 'hiit', label: 'HIIT Intervals',
    resistance_min: 3, resistance_max: 9, hr_min: 135, hr_max: 165, duration_min: 30, distance_km: 11,
    notes: '5min warmup at R4. 10 rounds: 40s at R9 (HR>160) + 80s at R3 (HR<135). 5min cooldown.',
  },
  {
    day_of_week: 2, day_name: 'Tuesday', workout_type: 'rest', label: 'Rest Day',
    resistance_min: null, resistance_max: null, hr_min: null, hr_max: null, duration_min: null, distance_km: null,
    notes: 'Full rest. Light walking allowed. No cycling.',
  },
  {
    day_of_week: 3, day_name: 'Wednesday', workout_type: 'zone2', label: 'Long Zone 2',
    resistance_min: 3, resistance_max: 4, hr_min: 113, hr_max: 132, duration_min: 50, distance_km: 20,
    notes: 'Longest Zone 2 session. Stay strictly under 132bpm. ~20km expected.',
  },
  {
    day_of_week: 4, day_name: 'Thursday', workout_type: 'tempo', label: 'Progressive Tempo',
    resistance_min: 4, resistance_max: 7, hr_min: 145, hr_max: 155, duration_min: 35, distance_km: 14,
    notes: '10min R4 warmup → 10min R6 (HR~145) → 10min R7 (HR~155) → 5min R4 cooldown.',
  },
  {
    day_of_week: 5, day_name: 'Friday', workout_type: 'hiit', label: 'Short Intense HIIT',
    resistance_min: 3, resistance_max: 10, hr_min: 135, hr_max: 170, duration_min: 20, distance_km: 8,
    notes: '5min warmup. 6 rounds: 30s at R10 (max effort) + 90s at R3 (recovery). 5min cooldown.',
  },
  {
    day_of_week: 6, day_name: 'Saturday', workout_type: 'recovery', label: 'Recovery Zone 2',
    resistance_min: 3, resistance_max: 3, hr_min: 110, hr_max: 120, duration_min: 40, distance_km: 14,
    notes: 'Easy recovery ride. Keep HR 110-120bpm. No pushing. ~14km expected.',
  },
];

function HRZoneBar({ hr_min, hr_max }: { hr_min: number; hr_max: number }) {
  const maxHR = 188;
  const leftPct  = (hr_min / maxHR) * 100;
  const widthPct = ((hr_max - hr_min) / maxHR) * 100;
  return (
    <div className="relative w-full h-2 rounded-full mt-1" style={{ background: 'var(--bg-secondary)' }}>
      <div className="absolute h-2 rounded-full"
        style={{ left: `${leftPct}%`, width: `${widthPct}%`, background: 'linear-gradient(90deg, #22d3a4, #4f8ef7)' }} />
    </div>
  );
}

function ResistancePips({ min, max }: { min: number; max: number }) {
  return (
    <div className="flex gap-1 mt-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <div key={n} className="h-2 flex-1 rounded-sm" style={{
          background: n >= min && n <= max ? 'var(--blue)' : 'var(--bg-secondary)',
          opacity: n >= min && n <= max ? 1 : 0.3,
        }} />
      ))}
    </div>
  );
}

export default function PlanPage() {
  const today = new Date().getDay();
  const todayPlan = PLAN.find(p => p.day_of_week === today);
  const cfg = todayPlan ? TYPE_CONFIG[todayPlan.workout_type] : null;

  return (
    <div className="space-y-8">
      <div className="fade-up" style={{ opacity: 0 }}>
        <h1 className="text-3xl font-bold mb-1">📋 Weekly Cycling Plan</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Weight loss programme · 32 yr · 182 cm · 96 kg · Max HR 188 bpm</p>
      </div>

      {todayPlan && cfg && (
        <div className="rounded-2xl p-6 fade-up" style={{
          background: cfg.bg, border: `1px solid ${cfg.color}40`, opacity: 0, animationDelay: '0.05s',
        }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: cfg.color }}>
              Today — {todayPlan.day_name}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: cfg.badge, color: cfg.color }}>
              {TYPE_LABEL[todayPlan.workout_type]}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-2xl font-bold mb-1">{cfg.icon} {todayPlan.label}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{todayPlan.notes}</div>
            </div>
            <div className="flex gap-6 flex-shrink-0 flex-wrap">
              {todayPlan.duration_min && (
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: cfg.color }}>{todayPlan.duration_min}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>min</div>
                </div>
              )}
              {todayPlan.distance_km && (
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: cfg.color }}>~{todayPlan.distance_km}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>km</div>
                </div>
              )}
              {todayPlan.hr_min && (
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: cfg.color }}>{todayPlan.hr_min}–{todayPlan.hr_max}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>bpm</div>
                </div>
              )}
            </div>
          </div>
          {todayPlan.resistance_min && (
            <div className="mt-4">
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                Resistance R{todayPlan.resistance_min}{todayPlan.resistance_min !== todayPlan.resistance_max ? `–R${todayPlan.resistance_max}` : ''}
              </div>
              <ResistancePips min={todayPlan.resistance_min} max={todayPlan.resistance_max!} />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {PLAN.map((day, i) => {
          const c = TYPE_CONFIG[day.workout_type];
          const isToday = day.day_of_week === today;
          const isPast = day.day_of_week < today;
          return (
            <div key={day.day_of_week} className="rounded-2xl p-5 fade-up" style={{
              background: isToday ? c.bg : 'var(--bg-card)',
              border: isToday ? `1.5px solid ${c.color}` : '1px solid var(--border)',
              opacity: 0, animationDelay: `${0.05 + i * 0.04}s`,
            }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: isToday ? c.color : 'var(--text-muted)' }}>
                    {isToday ? '⚡ Today' : isPast ? '✓ Done' : DAYS[day.day_of_week].slice(0, 3)}
                  </div>
                  <div className="font-bold text-sm mt-0.5">{day.day_name}</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: c.badge, color: c.color }}>
                  {TYPE_LABEL[day.workout_type]}
                </span>
              </div>
              <div className="text-base font-semibold mb-2">{c.icon} {day.label}</div>
              {day.workout_type !== 'rest' && (
                <div className="flex gap-3 mb-3 flex-wrap">
                  {day.duration_min && (
                    <div className="text-xs">
                      <span className="font-bold" style={{ color: c.color }}>{day.duration_min} min</span>
                      <span style={{ color: 'var(--text-muted)' }}> duration</span>
                    </div>
                  )}
                  {day.distance_km && (
                    <div className="text-xs">
                      <span className="font-bold" style={{ color: c.color }}>~{day.distance_km} km</span>
                    </div>
                  )}
                </div>
              )}
              {day.hr_min && day.hr_max && (
                <div className="mb-3">
                  <div className="text-xs mb-0.5 flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Heart Rate</span>
                    <span style={{ color: c.color }} className="font-semibold">{day.hr_min}–{day.hr_max} bpm</span>
                  </div>
                  <HRZoneBar hr_min={day.hr_min} hr_max={day.hr_max} />
                </div>
              )}
              {day.resistance_min && (
                <div className="mb-3">
                  <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>
                    Resistance R{day.resistance_min}{day.resistance_min !== day.resistance_max ? `–R${day.resistance_max}` : ''}
                  </div>
                  <ResistancePips min={day.resistance_min} max={day.resistance_max!} />
                </div>
              )}
              <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{day.notes}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-5 fade-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', opacity: 0 }}>
        <h3 className="text-sm font-semibold mb-3">Zone reference — Max HR 188 bpm</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Zone 2 — Fat Burn',   range: '113–132', color: '#22d3a4', pct: '60–70%' },
            { label: 'Zone 3 — Aerobic',    range: '132–150', color: '#fbbf24', pct: '70–80%' },
            { label: 'Zone 4 — Threshold',  range: '150–169', color: '#f97316', pct: '80–90%' },
            { label: 'Zone 5 — Max Effort', range: '169–188', color: '#f87171', pct: '90–100%' },
          ].map(z => (
            <div key={z.label} className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
              <div className="w-3 h-3 rounded-full mb-1.5" style={{ background: z.color }} />
              <div className="text-xs font-semibold mb-0.5" style={{ color: z.color }}>{z.range} bpm</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{z.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{z.pct} max HR</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
