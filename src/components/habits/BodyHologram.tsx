'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BodyStats } from '@/types/habits';

interface Props {
  stats: BodyStats | null;
}

export default function BodyHologram({ stats }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative w-full h-full min-h-[650px] flex items-center justify-center bg-white/[0.01] rounded-[40px] border border-white/5" />
    );
  }

  // 1. Calculate the sum for normalization
  const trackedTotal = stats 
    ? (stats.protein_mass_kg + stats.fat_mass_kg + stats.body_water_kg + stats.bone_mineral_kg) 
    : 1;

  // 2. Proportional ratios scaled to 0.70 to center the mass
  const scale = 0.7; 
  const proteinPerc = stats ? (stats.protein_mass_kg / trackedTotal) * 100 * scale : 0;
  const fatPerc = stats ? (stats.fat_mass_kg / trackedTotal) * 100 * scale : 0;
  const waterPerc = stats ? (stats.body_water_kg / trackedTotal) * 100 * scale : 0;
  const bonePerc = stats ? (stats.bone_mineral_kg / trackedTotal) * 100 * scale : 0;

  // 3. Normalized Gradient Stops with 15% Top Padding
  const startOffset = 15; 
  const stop1 = startOffset + proteinPerc; // End of Protein
  const stop2 = stop1 + fatPerc;           // End of Fat
  const stop3 = stop2 + waterPerc;         // End of Water
  const stop4 = stop3 + bonePerc;          // End of Bone

  return (
    <div className="relative w-full h-full min-h-[650px] flex items-center justify-center bg-white/[0.01] rounded-[40px] border border-white/5 overflow-hidden group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(86,156,214,0.12)_0%,transparent_70%)] opacity-50" />

      <div className="relative z-10 w-full max-w-[550px] h-[650px] flex items-center justify-center px-4">
        
        {/* TOTAL WEIGHT HEADER */}
        {stats && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-center z-30">
            <p className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]">
              {stats.weight_kg}<span className="text-xl ml-1 not-italic opacity-50">kg</span>
            </p>
          </div>
        )}

        {/* RE-ORDERED LABELS */}
        {stats && (
          <>
            <div className="absolute top-[140px] left-0 px-6 z-30">
              <Callout label="PROTEIN" value={`${stats.protein_mass_kg}kg`} color="text-accent-purple" align="left" />
            </div>
            <div className="absolute top-[140px] right-0 px-6 z-30">
              <Callout label="FAT MASS" value={`${stats.fat_mass_kg}kg`} color="text-accent-red" align="right" />
            </div>
            <div className="absolute bottom-[110px] left-0 px-6 z-30">
              <Callout label="WATER" value={`${stats.body_water_kg}kg`} color="text-accent-blue" align="left" />
            </div>
            <div className="absolute bottom-[110px] right-0 px-6 z-30">
              <Callout label="BONE" value={`${stats.bone_mineral_kg}kg`} color="text-accent-yellow" align="right" />
            </div>
          </>
        )}

        <div className="relative w-[320px] h-[580px] mt-16">
          <div className="absolute inset-0 z-0 opacity-10 brightness-150 grayscale">
            <Image src="/human-body.svg" alt="" fill priority className="object-contain" />
          </div>

          {/* COLOR FILL: PROTEIN > FAT > WATER > BONE */}
          {stats && (
            <div 
              className="absolute inset-0 z-10" 
              style={{ 
                maskImage: 'url(/human-body.svg)', 
                maskSize: 'contain', 
                maskPosition: 'center',
                maskRepeat: 'no-repeat', 
                WebkitMaskImage: 'url(/human-body.svg)', 
                WebkitMaskSize: 'contain', 
                WebkitMaskPosition: 'center',
                WebkitMaskRepeat: 'no-repeat',
                background: `linear-gradient(to bottom, 
                  transparent 0%, 
                  transparent ${startOffset}%, 
                  #c586c0 ${startOffset}%, #c586c0 ${stop1}%, 
                  #f44747 ${stop1}%, #f44747 ${stop2}%, 
                  #569cd6 ${stop2}%, #569cd6 ${stop3}%, 
                  #dcdcaa ${stop3}%, #dcdcaa ${stop4}%,
                  transparent ${stop4}%,
                  transparent 100%)`
              }}
            />
          )}

          {/* Neural Scan Line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-20">
            <div className="w-full h-full animate-[scanline_10s_linear_infinite]" 
                 style={{ backgroundImage: 'linear-gradient(0deg, transparent 25%, rgba(86,156,214,0.4) 50%, transparent 75%)', backgroundSize: '100% 8px' }} />
          </div>
        </div>
      </div>

      <div className="absolute bottom-12">
        <p className="text-[13px] font-black text-accent-blue uppercase tracking-[0.7em] drop-shadow-[0_0_12px_rgba(86,156,214,0.6)]">BIOMETRIC.LINK</p>
      </div>
    </div>
  );
}

function Callout({ label, value, color, align }: { label: string, value: string, color: string, align: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start text-left'} min-w-[120px]`}>
      <p className="text-[10px] font-black text-muted tracking-widest leading-none mb-1.5 uppercase">{label}</p>
      <p className={`text-4xl font-black italic tracking-tighter ${color} leading-none`}>{value}</p>
      <div className="h-[1px] w-12 bg-white/20 mt-3" />
    </div>
  );
}