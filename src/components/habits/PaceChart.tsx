'use client';
import { useState } from 'react';
import { Workout } from '@/types/habits';

interface PaceChartProps {
  workouts: Workout[];
}

export default function PaceChart({ workouts }: PaceChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    pace: string;
    date: string;
    distance: number;
  } | null>(null);

  const chartData = workouts
    .filter(w => w.activity_type === 'running' && w.distance_km && w.distance_km > 0)
    .sort((a, b) => new Date(a.logged_date).getTime() - new Date(b.logged_date).getTime())
    .map(w => {
      const paceDecimal = w.duration_minutes / (w.distance_km || 1);
      const paceMin = Math.floor(paceDecimal);
      const paceSec = Math.round((paceDecimal - paceMin) * 60);
      return {
        date: new Date(w.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: new Date(w.logged_date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }),
        pace: paceDecimal,
        paceStr: `${paceMin}:${paceSec.toString().padStart(2, '0')}`,
        distance: w.distance_km || 0
      };
    });

  if (chartData.length < 2) return null;

  const width = 800;
  const height = 300;
  const paddingX = 60;
  const paddingY = 40;

  const paces = chartData.map(d => d.pace);
  const maxPace = Math.ceil(Math.max(...paces) + 0.5);
  const minPace = Math.floor(Math.max(0, Math.min(...paces) - 0.5));

  const getX = (index: number) => (index / (chartData.length - 1)) * (width - paddingX * 2) + paddingX;
  const getY = (pace: number) => height - paddingY - ((pace - minPace) / (maxPace - minPace)) * (height - paddingY * 2);

  const points = chartData.map((d, i) => `${getX(i)},${getY(d.pace)}`).join(' ');
  const areaPoints = `${getX(0)},${height - paddingY} ${points} ${getX(chartData.length - 1)},${height - paddingY}`;

  return (
    <div className="bg-surface rounded-[32px] border border-dark-border shadow-xl overflow-hidden p-8 mb-8 relative">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight italic uppercase text-accent-purple">
            Pace Evolution
          </h2>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Neural performance tracking</p>
        </div>
        <div className="text-[10px] font-black text-accent-purple/50">DATA_LINK_ESTABLISHED</div>
      </div>

      <div className="relative w-full">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#81327a" stopOpacity="0.5" />
              <stop offset="95%" stopColor="#c586c0" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid */}
          {[minPace, (minPace + maxPace) / 2, maxPace].map((p, i) => (
            <g key={i}>
              <line x1={paddingX} y1={getY(p)} x2={width - paddingX} y2={getY(p)} stroke="#3c3c3c" strokeDasharray="5,5" />
              <text x={paddingX - 12} y={getY(p) + 4} textAnchor="end" className="fill-muted text-[10px] font-black">{p.toFixed(1)}</text>
            </g>
          ))}

          {/* Area & Line */}
          <polyline points={areaPoints} fill="url(#cyberGradient)" />
          <polyline fill="none" stroke="#c586c0" strokeWidth="3" points={points} filter="url(#glow)" />

          {/* Invisible hover triggers & Minimal points */}
          {chartData.map((d, i) => (
            <g key={i} onMouseEnter={() => setHoveredPoint({ x: getX(i), y: getY(d.pace), pace: d.paceStr, date: d.fullDate, distance: d.distance })}>
              {/* Minimal Dot */}
              <circle cx={getX(i)} cy={getY(d.pace)} r="3" className="fill-accent-purple shadow-lg" />
              
              {/* Large invisible hit area for easier hovering */}
              <rect 
                x={getX(i) - 20} y={0} width="40" height={height} 
                fill="transparent" className="cursor-crosshair" 
              />
              
              <text x={getX(i)} y={height - 10} textAnchor="middle" className="fill-muted text-[9px] font-black uppercase tracking-tighter">
                {d.date}
              </text>
            </g>
          ))}
        </svg>

        {/* Cyber Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-50 pointer-events-none transition-all duration-200 ease-out"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: 'translate(-50%, -120%)' 
            }}
          >
            <div className="bg-[#1e1e1e]/95 backdrop-blur-md border border-accent-purple/50 rounded-xl p-3 shadow-[0_0_20px_rgba(197,134,192,0.3)] min-w-[140px]">
              <div className="text-[9px] font-black text-accent-purple uppercase tracking-widest mb-1 border-b border-accent-purple/20 pb-1">
                {hoveredPoint.date}
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-[10px] font-bold text-muted uppercase">Pace</span>
                <span className="text-lg font-black text-foreground italic">{hoveredPoint.pace}<span className="text-[10px] ml-0.5">/km</span></span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-bold text-muted uppercase">Dist</span>
                <span className="text-sm font-black text-accent-green">{hoveredPoint.distance} km</span>
              </div>
              {/* Tooltip Tail */}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e1e1e] border-r border-b border-accent-purple/50 rotate-45" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}