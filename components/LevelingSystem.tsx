import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Lock, Unlock, Star, Shield, Zap, Crown, Gift, ChevronUp } from 'lucide-react';
import { UserStats } from '../types';
import { SoundEngine } from '../services/audioService';

interface LevelingSystemProps {
  stats: UserStats;
  onBack: () => void;
}

// Configuration for levels
const LEVEL_MAP: { lvl: number; title: string; reward: string; type: 'badge' | 'skin' | 'feature' | 'none' }[] = [
    { lvl: 1, title: 'Rookie Agent', reward: 'Basic Access', type: 'feature' },
    { lvl: 2, title: 'Cadet', reward: 'Badge: First Step', type: 'badge' },
    { lvl: 3, title: 'Scout', reward: 'New Skin: Neon Blue', type: 'skin' },
    { lvl: 4, title: 'Operative', reward: 'Badge: On Fire', type: 'badge' },
    { lvl: 5, title: 'Vanguard', reward: 'Archetype: MECH', type: 'feature' },
    { lvl: 6, title: 'Specialist', reward: 'New Skin: Magma', type: 'skin' },
    { lvl: 7, title: 'Elite', reward: 'Hardcore Mode', type: 'feature' },
    { lvl: 8, title: 'Commander', reward: 'Badge: Champion', type: 'badge' },
    { lvl: 9, title: 'Warlord', reward: 'Archetype: SPIRIT', type: 'feature' },
    { lvl: 10, title: 'Legend', reward: 'Golden Aura', type: 'skin' },
    { lvl: 15, title: 'Cyber God', reward: 'Dev Access', type: 'feature' },
];

const LevelingSystem: React.FC<LevelingSystemProps> = ({ stats, onBack }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current level
  useEffect(() => {
    if (scrollRef.current) {
        const activeNode = document.getElementById(`lvl-node-${stats.level}`);
        if (activeNode) {
            activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [stats.level]);

  const handleBack = () => {
      SoundEngine.playUI('back');
      onBack();
  };

  const currentLevelData = LEVEL_MAP.find(l => l.lvl === stats.level) || { title: 'Unknown', reward: '' };
  const nextLevelData = LEVEL_MAP.find(l => l.lvl === stats.level + 1);
  
  const xpForNextLevel = stats.level * 1000;
  const progress = (stats.xp / xpForNextLevel) * 100;

  return (
    <div className="flex-1 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-slate-900 h-full overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[80%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[20%] w-[60%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* HEADER */}
      <div className="flex items-center px-4 pt-4 shrink-0 z-10 relative">
        <button onClick={handleBack} className="p-2 bg-slate-800/80 backdrop-blur rounded-full mr-4 hover:bg-slate-700 transition-colors border border-white/10">
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-wider">Agent Career</h2>
            <div className="text-[10px] text-indigo-300 font-bold tracking-[0.2em] uppercase">Progression Path</div>
        </div>
      </div>

      {/* CURRENT STATUS CARD */}
      <div className="px-4 py-6 z-10 relative shrink-0">
         <div className="bg-gradient-to-br from-indigo-900/80 to-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.15)] relative overflow-hidden group">
            
            {/* Holographic Scan Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-400/50 blur-[2px] animate-[scan_3s_linear_infinite]"></div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="text-xs font-bold text-indigo-400 uppercase mb-1">Current Rank</div>
                    <div className="text-3xl font-black text-white tracking-tight">{currentLevelData.title}</div>
                </div>
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-indigo-400 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] z-10 relative">
                        {stats.level}
                    </div>
                    <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md animate-pulse"></div>
                </div>
            </div>

            {/* XP Bar */}
            <div className="mb-2 flex justify-between text-xs font-bold text-slate-300">
                <span>XP Progress</span>
                <span className="text-indigo-300">{stats.xp} / {xpForNextLevel}</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div 
                    className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.5)] transition-all duration-1000 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute top-0 right-0 w-[2px] h-full bg-white blur-[1px] animate-pulse"></div>
                </div>
            </div>
            {nextLevelData && (
                <div className="mt-3 text-[10px] text-center text-slate-400 font-medium bg-slate-800/50 py-1 rounded-lg border border-white/5">
                    Next Reward: <span className="text-emerald-400 font-bold">{nextLevelData.reward}</span>
                </div>
            )}
         </div>
      </div>

      {/* TIMELINE SCROLL */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-20 relative z-10 no-scrollbar space-y-4">
        <div className="absolute left-[27px] top-4 bottom-0 w-[2px] bg-slate-700/50 z-0"></div>

        {LEVEL_MAP.map((item, index) => {
            const isUnlocked = stats.level >= item.lvl;
            const isCurrent = stats.level === item.lvl;
            const isNext = stats.level + 1 === item.lvl;

            return (
                <div 
                    id={`lvl-node-${item.lvl}`}
                    key={item.lvl} 
                    className={`relative flex items-center gap-4 group ${isUnlocked ? 'opacity-100' : 'opacity-60'}`}
                >
                    {/* NODE */}
                    <div className={`
                        w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center z-10 border-2 transition-all duration-300
                        ${isCurrent 
                            ? 'bg-indigo-600 border-indigo-400 scale-110 shadow-[0_0_25px_rgba(99,102,241,0.6)]' 
                            : isUnlocked 
                                ? 'bg-slate-800 border-emerald-500/50 text-emerald-400'
                                : 'bg-slate-900 border-slate-700 text-slate-600'
                        }
                    `}>
                        {isUnlocked 
                            ? (item.type === 'skin' ? <Gift size={24} /> : item.type === 'feature' ? <Zap size={24} /> : <Shield size={24} />)
                            : <Lock size={20} />
                        }
                    </div>

                    {/* CARD */}
                    <div className={`
                        flex-1 p-4 rounded-xl border transition-all duration-300
                        ${isCurrent 
                            ? 'bg-slate-800/90 border-indigo-500/50 shadow-lg translate-x-2' 
                            : isUnlocked 
                                ? 'bg-slate-800/40 border-slate-700 grayscale-[0.5]' 
                                : 'bg-slate-900/40 border-slate-800'
                        }
                    `}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`}>
                                    Level {item.lvl}
                                </div>
                                <div className={`text-base font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                                    {item.title}
                                </div>
                            </div>
                            {isUnlocked && <CheckCircleIcon />}
                        </div>
                        
                        <div className={`mt-2 text-xs flex items-center gap-2 ${isUnlocked ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {item.type === 'skin' && <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>}
                            {item.reward}
                        </div>
                    </div>

                    {isNext && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                             <div className="bg-indigo-600 text-[9px] font-bold px-2 py-0.5 rounded text-white animate-pulse">
                                 NEXT
                             </div>
                        </div>
                    )}
                </div>
            );
        })}
        
        <div className="text-center py-8 text-slate-600 text-xs font-mono uppercase tracking-widest opacity-50">
            More Levels Coming Soon...
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
        <div className="w-2.5 h-1.5 border-b-2 border-l-2 border-emerald-400 -rotate-45 mb-0.5"></div>
    </div>
);

export default LevelingSystem;
