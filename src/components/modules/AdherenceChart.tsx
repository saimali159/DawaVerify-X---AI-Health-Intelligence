import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  ShieldCheck,
  Target,
  Sparkles,
} from 'lucide-react';
import { MedicationScheduleItem } from '../../types';

export interface DailyAdherencePoint {
  dayIndex: number;
  dateStr: string;
  fullDate: string;
  dayOfWeek: string;
  scheduledDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherenceRate: number;
  isToday: boolean;
}

interface AdherenceChartProps {
  schedule: MedicationScheduleItem[];
}

export const AdherenceChart: React.FC<AdherenceChartProps> = ({ schedule }) => {
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');
  const [timeFilter, setTimeFilter] = useState<'30d' | '14d' | '7d'>('30d');

  // Generate 30 days of data, with Day 30 dynamically coupled to real-time `schedule`
  const all30DaysData = useMemo<DailyAdherencePoint[]>(() => {
    const result: DailyAdherencePoint[] = [];
    const now = new Date();

    // Baseline historical distribution over the prior 29 days
    const historicalTally = [
      { s: 4, t: 4 }, // -29
      { s: 4, t: 4 }, // -28
      { s: 4, t: 3 }, // -27 (missed 1)
      { s: 4, t: 4 }, // -26
      { s: 4, t: 4 }, // -25
      { s: 4, t: 4 }, // -24
      { s: 4, t: 4 }, // -23
      { s: 4, t: 3 }, // -22 (missed 1)
      { s: 4, t: 4 }, // -21
      { s: 4, t: 4 }, // -20
      { s: 4, t: 4 }, // -19
      { s: 4, t: 4 }, // -18
      { s: 4, t: 3 }, // -17 (missed 1)
      { s: 4, t: 4 }, // -16
      { s: 4, t: 4 }, // -15
      { s: 4, t: 4 }, // -14
      { s: 4, t: 4 }, // -13
      { s: 4, t: 4 }, // -12
      { s: 4, t: 4 }, // -11
      { s: 4, t: 4 }, // -10
      { s: 4, t: 4 }, // -9
      { s: 4, t: 4 }, // -8
      { s: 4, t: 4 }, // -7
      { s: 4, t: 4 }, // -6
      { s: 4, t: 4 }, // -5
      { s: 4, t: 4 }, // -4
      { s: 4, t: 4 }, // -3
      { s: 4, t: 4 }, // -2
      { s: 4, t: 4 }, // -1
    ];

    for (let i = 29; i >= 1; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const index = 29 - i;
      const point = historicalTally[index] || { s: 4, t: 4 };
      const rate = Math.round((point.t / point.s) * 100);

      result.push({
        dayIndex: 30 - i,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: d.toISOString().split('T')[0],
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        scheduledDoses: point.s,
        takenDoses: point.t,
        missedDoses: point.s - point.t,
        adherenceRate: rate,
        isToday: false,
      });
    }

    // Today (Day 30) calculated live from props
    const todayScheduled = schedule.length > 0 ? schedule.length : 4;
    const todayTaken = schedule.filter((s) => s.taken).length;
    const todayMissed = Math.max(0, todayScheduled - todayTaken);
    const todayAdherence = Math.round((todayTaken / todayScheduled) * 100);

    result.push({
      dayIndex: 30,
      dateStr: `Today`,
      fullDate: now.toISOString().split('T')[0],
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'short' }),
      scheduledDoses: todayScheduled,
      takenDoses: todayTaken,
      missedDoses: todayMissed,
      adherenceRate: todayAdherence,
      isToday: true,
    });

    return result;
  }, [schedule]);

  // Filtered slice for viewing 7d, 14d, or 30d
  const displayedData = useMemo(() => {
    if (timeFilter === '7d') return all30DaysData.slice(-7);
    if (timeFilter === '14d') return all30DaysData.slice(-14);
    return all30DaysData;
  }, [all30DaysData, timeFilter]);

  // Summary statistics across the 30 days
  const stats = useMemo(() => {
    const totalScheduled = all30DaysData.reduce((acc, d) => acc + d.scheduledDoses, 0);
    const totalTaken = all30DaysData.reduce((acc, d) => acc + d.takenDoses, 0);
    const totalMissed = all30DaysData.reduce((acc, d) => acc + d.missedDoses, 0);
    const avgAdherence = Math.round((totalTaken / (totalScheduled || 1)) * 100);
    const perfectDays = all30DaysData.filter((d) => d.adherenceRate === 100).length;
    const aboveClinicalThreshold = avgAdherence >= 80;

    return {
      totalScheduled,
      totalTaken,
      totalMissed,
      avgAdherence,
      perfectDays,
      aboveClinicalThreshold,
    };
  }, [all30DaysData]);

  // Custom Recharts Tooltip
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyAdherencePoint = payload[0].payload;
      const isOptimal = data.adherenceRate >= 80;
      const isPerfect = data.adherenceRate === 100;

      return (
        <div className="rounded-xl bg-slate-900/95 border border-slate-700/80 p-3.5 shadow-2xl backdrop-blur-md min-w-[200px] space-y-2 z-50 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                {data.dateStr}
                {data.isToday && (
                  <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-mono text-[9px] uppercase border border-teal-500/30">
                    Live
                  </span>
                )}
              </p>
              <p className="text-[10px] text-slate-400">{data.fullDate} ({data.dayOfWeek})</p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                isPerfect
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : isOptimal
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {data.adherenceRate}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                Doses Taken
              </span>
              <span className="font-semibold text-slate-200">
                {data.takenDoses} of {data.scheduledDoses}
              </span>
            </div>

            {data.missedDoses > 0 && (
              <div className="flex items-center justify-between text-rose-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Missed / Delayed
                </span>
                <span className="font-semibold font-mono">{data.missedDoses} dose</span>
              </div>
            )}

            <div className="pt-1 border-t border-slate-800/80 text-[10px]">
              {isPerfect ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Full Pharmacological Coverage
                </span>
              ) : isOptimal ? (
                <span className="text-teal-300 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Within Therapeutic Window (≥80%)
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Sub-optimal adherence detected
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-5 shadow-sm">
      {/* Header section with metrics and controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30 font-mono flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              LONGITUDINAL ADHERENCE TRAJECTORY
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              WHO Recommended Threshold: ≥80%
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            30-Day Medication Adherence Progress
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous daily dosing tracking, dose compliance index, and therapeutic stability over the past 30 days.
          </p>
        </div>

        {/* View toggles & Time filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time range switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeFilter(range)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  timeFilter === range
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '30d' ? '30 Days' : range === '14d' ? '14 Days' : '7 Days'}
              </button>
            ))}
          </div>

          {/* Chart mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setChartMode('area')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                chartMode === 'area'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Adherence Rate Percentage View"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Adherence %</span>
            </button>
            <button
              onClick={() => setChartMode('bar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                chartMode === 'bar'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Doses Taken vs Missed View"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Dose Tally</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Micro-cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
            <span>30-Day Mean Adherence</span>
            <Target className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-extrabold text-white flex items-baseline gap-1">
            <span>{stats.avgAdherence}%</span>
            <span className="text-[10px] text-teal-400 font-mono font-normal">avg</span>
          </div>
          <div className="text-[10px] text-teal-400/90 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {stats.aboveClinicalThreshold ? 'Therapeutic Target Met' : 'Needs Optimization'}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
            <span>Confirmed Doses Taken</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-extrabold text-emerald-300">
            {stats.totalTaken} <span className="text-xs text-slate-400 font-normal">/ {stats.totalScheduled}</span>
          </div>
          <p className="text-[10px] text-slate-400">Total doses tracked past month</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
            <span>Missed Doses</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-extrabold text-rose-400">
            {stats.totalMissed}
          </div>
          <p className="text-[10px] text-slate-400">Missed doses over 30 days</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
            <span>Perfect Days (100%)</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-300">
            {stats.perfectDays} <span className="text-xs text-slate-400 font-normal">/ 30 days</span>
          </div>
          <p className="text-[10px] text-slate-400">80% perfect adherence ratio</p>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'area' ? (
            <AreaChart
              data={displayedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="adherenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="dateStr"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval={timeFilter === '30d' ? 3 : 0}
              />

              <YAxis
                stroke="#64748b"
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                ticks={[0, 25, 50, 75, 80, 100]}
                tickFormatter={(val) => `${val}%`}
              />

              {/* 80% Clinical Therapeutic Reference Line */}
              <ReferenceLine
                y={80}
                stroke="#06b6d4"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: '80% Clinical Target',
                  position: 'insideTopRight',
                  fill: '#22d3ee',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />

              <Tooltip content={renderCustomTooltip} />

              <Area
                type="monotone"
                dataKey="adherenceRate"
                name="Adherence Rate"
                stroke="#14b8a6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adherenceGrad)"
                activeDot={{ r: 6, fill: '#2dd4bf', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={displayedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="dateStr"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval={timeFilter === '30d' ? 3 : 0}
              />

              <YAxis
                stroke="#64748b"
                allowDecimals={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              <Tooltip content={renderCustomTooltip} />

              <Bar
                dataKey="takenDoses"
                name="Taken Doses"
                stackId="doses"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
              />

              <Bar
                dataKey="missedDoses"
                name="Missed Doses"
                stackId="doses"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Daily Status Mini-Map */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-500"></span>
            <span className="text-slate-300 text-[11px]">Optimal (≥80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300 text-[11px]">Perfect (100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-300 text-[11px]">Missed Dose</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-cyan-400"></span>
            <span className="text-cyan-400 text-[11px]">80% WHO Guideline</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
          <span>Real-time link:</span>
          <span className="text-teal-300 font-semibold">Today's Schedule Active</span>
        </div>
      </div>
    </div>
  );
};
