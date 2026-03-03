'use client';
import { useState, useEffect } from 'react';
import { Workout } from '@/types/habits';

interface PerformanceChartProps {
  workouts: Workout[];
}

type ViewMode = 'pace' | 'distance' | 'overall';

export default function PerformanceChart({ workouts }: PerformanceChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('pace');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [isAnimate, setIsAnimate] = useState(false);

  useEffect(() => {
    setIsAnimate(false);
    const timer = setTimeout(() => setIsAnimate(true), 50);
    return () => clearTimeout(timer);
  }, [viewMode]);

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
  const paddingX = 70;
  const paddingY = 40;

  const maxPace = Math.ceil(Math.max(...chartData.map(d => d.pace)) + 0.5);
  const minPace = Math.floor(Math.min(...chartData.map(d => d.pace)) - 0.5);
  const maxDist = Math.ceil(Math.max(...chartData.map(d => d.distance)) + 1);
  const minDist = Math.floor(Math.min(...chartData.map(d => d.distance)) - 1);

  const getX = (index: number) => (index / (chartData.length - 1)) * (width - paddingX * 2) + paddingX;
  const getY = (val: number, min: number, max: number) => height - paddingY - ((val - min) / (max - min)) * (height - paddingY * 2);

  const pacePoints = chartData.map((d, i) => `${getX(i)},${getY(d.pace, minPace, maxPace)}`).join(' ');
  const distPoints = chartData.map((d, i) => `${getX(i)},${getY(d.distance, minDist, maxDist)}`).join(' ');

  return (
    <div className="bg-surface rounded-[32px] border border-dark-border shadow-2xl overflow-hidden p-8 mb-8 relative">
      
      {/* View Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative">
          <h2 className="text-2xl font-black text-foreground tracking-tight italic uppercase text-accent-purple">
            Performance Analysis
          </h2>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Neural metrics visualization</p>
        </div>

        <nav className="flex bg-background p-1 rounded-2xl border border-dark-border">
          {(['pace', 'distance', 'overall'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                viewMode === mode ? 'bg-active text-white shadow-lg' : 'text-muted hover:text-foreground'
              }`}
            >
              {mode}
            </button>
          ))}
        </nav>
      </div>

      <div className="relative w-full">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
            
            <linearGradient id="paceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c586c0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c586c0" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#569cd6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#569cd6" stopOpacity="0" />
            </linearGradient>

            <style>{`
              @keyframes radar {
                0% { transform: translateX(${paddingX}px); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateX(${width - paddingX}px); opacity: 0; }
              }
              .radar-line {
                animation: radar 4s linear infinite;
              }
              .draw-line {
                stroke-dasharray: 2000;
                stroke-dashoffset: ${isAnimate ? '0' : '2000'};
                transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
              }
            `}</style>
          </defs>

          {/* Radar Scan Line */}
          <line 
            x1="0" y1={paddingY} x2="0" y2={height - paddingY} 
            stroke={viewMode === 'distance' ? "rgba(86, 156, 214, 0.3)" : "rgba(197, 134, 192, 0.3)"} 
            strokeWidth="2" 
            className="radar-line" filter="url(#glow)"
          />

          {/* LEFT Y-AXIS (Max, Mid, Min) */}
          <g>
            {[
              viewMode === 'distance' ? maxDist : maxPace,
              viewMode === 'distance' ? (minDist + maxDist) / 2 : (minPace + maxPace) / 2,
              viewMode === 'distance' ? minDist : minPace
            ].map((val, i) => {
              const labelColor = viewMode === 'distance' ? '#569cd6' : '#c586c0';
              const yPos = getY(
                val, 
                viewMode === 'distance' ? minDist : minPace, 
                viewMode === 'distance' ? maxDist : maxPace
              );
              
              return (
                <text
                  key={`left-y-${i}`}
                  x={paddingX - 15}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] font-black"
                  style={{ fill: labelColor }}
                >
                  {viewMode === 'distance' ? `${val.toFixed(1)}km` : val.toFixed(1)}
                </text>
              );
            })}
          </g>

          {/* RIGHT Y-AXIS (Overall mode only) */}
          {viewMode === 'overall' && (
            <g>
              {[maxDist, (minDist + maxDist) / 2, minDist].map((val, i) => (
                <text
                  key={`right-y-${i}`}
                  x={width - paddingX + 15}
                  y={getY(val, minDist, maxDist) + 4}
                  textAnchor="start"
                  className="fill-accent-blue text-[10px] font-black"
                >
                  {val.toFixed(1)}km
                </text>
              ))}
            </g>
          )}

          {/* PACE PLOT */}
          {(viewMode === 'pace' || viewMode === 'overall') && (
            <g opacity={isAnimate ? 1 : 0} className="transition-opacity duration-1000">
              <polyline points={`${getX(0)},${height-paddingY} ${pacePoints} ${getX(chartData.length-1)},${height-paddingY}`} fill="url(#paceGrad)" />
              <polyline fill="none" stroke="#c586c0" strokeWidth="3" points={pacePoints} filter="url(#glow)" className="draw-line" />
            </g>
          )}

          {/* DISTANCE PLOT */}
          {(viewMode === 'distance' || viewMode === 'overall') && (
            <g opacity={isAnimate ? 1 : 0} className="transition-opacity duration-1000">
              <polyline points={`${getX(0)},${height-paddingY} ${distPoints} ${getX(chartData.length-1)},${height-paddingY}`} fill="url(#distGrad)" />
              <polyline fill="none" stroke="#569cd6" strokeWidth="3" points={distPoints} filter="url(#glow)" className="draw-line" />
            </g>
          )}

          {/* NODES */}
          {chartData.map((d, i) => {
             const paceY = getY(d.pace, minPace, maxPace);
             const distY = getY(d.distance, minDist, maxDist);

             return (
              <g key={i}>
                {/* PACE POINT */}
                {(viewMode === 'pace' || viewMode === 'overall') && (
                  <circle cx={getX(i)} cy={paceY} r="4" fill="#c586c0" filter="url(#glow)" />
                )}
                {/* DISTANCE POINT */}
                {(viewMode === 'distance' || viewMode === 'overall') && (
                  <circle cx={getX(i)} cy={distY} r="4" fill="#569cd6" filter="url(#glow)" />
                )}

                {hoveredPoint?.data === d && (
                  <line x1={getX(i)} y1={paddingY} x2={getX(i)} y2={height-paddingY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,2" />
                )}

                <rect 
                  x={getX(i) - 20} y={0} width="40" height={height} 
                  fill="transparent" className="cursor-crosshair"
                  onMouseEnter={() => setHoveredPoint({ x: getX(i), paceY, distY, data: d })}
                />
              </g>
             );
          })}
        </svg>

        {/* TOOLTIP */}
        {hoveredPoint && (
          <div 
            className="absolute z-50 pointer-events-none animate-in fade-in zoom-in duration-200"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `20%`,
              transform: 'translateX(-50%)' 
            }}
          >
            <div className="bg-[#1e1e1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl border-l-4 border-l-accent-purple min-w-[160px]">
               <div className="text-[10px] font-black text-muted uppercase tracking-widest mb-3 border-b border-white/5 pb-1 flex justify-between">
                <span>{hoveredPoint.data.date}</span>
                <span className="text-accent-purple animate-pulse">LIVE_SYNC</span>
               </div>
               <div className="space-y-3">
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] text-muted uppercase font-bold">Velocity</span>
                    <span className="text-base font-black text-accent-purple italic">{hoveredPoint.data.paceStr}<span className="text-[10px] ml-1">/km</span></span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] text-muted uppercase font-bold">Range</span>
                    <span className="text-base font-black text-accent-blue italic">{hoveredPoint.data.distance}<span className="text-[10px] ml-1">km</span></span>
                 </div>
               </div>
               <div className="mt-3 pt-2 border-t border-white/5">
                  <p className="text-[8px] text-muted uppercase font-bold text-center">Neural Sync Established</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}