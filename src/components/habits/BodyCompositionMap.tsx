'use client';

import { BodyStats } from '@/types/habits';

interface Props {
  stats: BodyStats;
}

export default function BodyCompositionMap({ stats }: Props) {
  const getPerc = (val: number) => ((val / stats.weight_kg) * 100).toFixed(1);

  return (
    <div className="bg-surface rounded-[32px] border border-dark-border p-8 relative overflow-hidden shadow-2xl">
      <div className="flex justify-between items-start border-b border-dark-border pb-6 mb-8">
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tight uppercase italic">Composition Analysis</h3>
          <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em]">Neural Bio-Metric Report</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Classification</p>
          <p className="text-xl font-black text-accent-orange italic uppercase tracking-tighter">{stats.body_type}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] border-l-2 border-accent-orange pl-3">Weight Components</h4>
          <ReportBar label="Skeletal Muscle" value={stats.muscle_mass_kg} unit="kg" target={40} color="bg-accent-green" />
          <ReportBar label="Total Body Water" value={stats.body_water_kg} unit="kg" target={55} color="bg-accent-blue" />
          <ReportBar label="Bone Mineral" value={stats.bone_mineral_kg} unit="kg" target={4} color="bg-accent-yellow" />
          <ReportBar label="Protein Mass" value={stats.protein_mass_kg} unit="kg" target={15} color="bg-accent-purple" />
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-muted uppercase tracking-[0.3em] border-l-2 border-accent-red pl-3">Metabolism</h4>
          <ReportBar label="Body Fat Mass" value={stats.fat_mass_kg} unit="kg" target={20} color="bg-accent-red" />
          
          <div className="bg-background/40 border border-dark-border rounded-2xl p-4 flex justify-between items-center mt-4">
            <div>
              <p className="text-[8px] font-black text-muted uppercase mb-1">Basal Metabolic Rate</p>
              <p className="text-xl font-bold text-accent-orange italic">{stats.bmr_kcal} <span className="text-[10px]">kcal</span></p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-muted uppercase mb-1">Fat Ratio</p>
              <p className="text-xl font-bold text-accent-red italic">{getPerc(stats.fat_mass_kg)}%</p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Total Weight</p>
            <p className="text-3xl font-black text-foreground italic">{stats.weight_kg}<span className="text-xs ml-1">kg</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportBar({ label, value, unit, target, color }: any) {
  const percentage = Math.min((value / (target * 1.5)) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-[9px] font-black text-muted uppercase tracking-tight">{label}</span>
        <span className="text-xs font-black text-foreground">{value}{unit}</span>
      </div>
      <div className="h-2 w-full bg-background rounded-full overflow-hidden border border-dark-border relative">
        <div className="absolute left-[33%] top-0 bottom-0 w-[1px] bg-dark-border z-10" />
        <div className="absolute left-[66%] top-0 bottom-0 w-[1px] bg-dark-border z-10" />
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}