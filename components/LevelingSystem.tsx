import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Lock, Unlock, Star, Shield, Zap, Crown, Gift, ChevronUp, ChevronsUp, Award } from 'lucide-react';
import { UserStats } from '../types';
import { SoundEngine } from '../services/audioService';
import { LEVEL_MAP } from '../utils/levelUtils';
import { useLocalization } from '../services/localization/LocalizationContext';

interface LevelingSystemProps {
    stats: UserStats;
    onBack: () => void;
}

const LevelingSystem: React.FC<LevelingSystemProps> = ({ stats, onBack }) => {
    const { t } = useLocalization();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current level
    useEffect(() => {
        if (scrollRef.current) {
            const activeNode = document.getElementById(`lvl-node-${stats.level}`);
            if (activeNode) {
                setTimeout(() => {
                    activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }, [stats.level]);

    const handleBack = () => {
        SoundEngine.playUI('back');
        onBack();
    };

    const currentLevelData = LEVEL_MAP.find(l => l.lvl === stats.level) || LEVEL_MAP[0];
    const nextLevelData = LEVEL_MAP.find(l => l.lvl === stats.level + 1);

    const xpForNextLevel = stats.level * 1000;
    const progress = Math.min(100, (stats.xp / xpForNextLevel) * 100);

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[150%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.03]"></div>
            </div>

            {/* HEADER - Fixed at top with safe area handling */}
            <div className="relative z-10 shrink-0 bg-slate-950/80 backdrop-blur-md border-b border-white/5 pt-[calc(env(safe-area-inset-top)+12px)] pb-4 px-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-slate-700 active:scale-95 transition-all shadow-lg border border-slate-700"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-right">
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">{t('leveling.subtitle')}</div>
                        <h2 className="text-xl font-black text-white italic tracking-wide uppercase leading-none">{t('leveling.title')}</h2>
                    </div>
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-[calc(env(safe-area-inset-bottom)+100px)]">

                {/* CURRENT LEVEL HERO CARD */}
                <div className="px-6 py-8">
                    <div className="relative bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] overflow-hidden border border-indigo-400/30">
                        {/* Decorative Circles */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-black/20 to-transparent"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-indigo-400 flex items-center justify-center mb-4 shadow-xl relative group">
                                <span className="text-4xl font-black text-white">{stats.level}</span>
                                <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-[spin_10s_linear_infinite] border-t-white/80"></div>
                                <div className="absolute -bottom-2 bg-indigo-500 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm border border-white/20">LVL</div>
                            </div>

                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tight mb-1 drop-shadow-md">
                                {t(currentLevelData.titleKey)}
                            </h3>
                            <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-6">
                                {t('leveling.current')}
                            </div>

                            {/* XP Progress */}
                            <div className="w-full bg-black/30 h-4 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 relative cursor-help group-hover:scale-[1.02] transition-transform">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_15px_rgba(52,211,153,0.5)] relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md">
                                    {stats.xp} / {xpForNextLevel} XP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TIMELINE */}
                <div className="px-6 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[43px] top-0 bottom-0 w-[3px] bg-slate-800 rounded-full"></div>
                    <div
                        className="absolute left-[43px] top-0 w-[3px] bg-indigo-500/50 rounded-full transition-all duration-1000"
                        style={{ height: `${Math.min(100, (stats.level / LEVEL_MAP.length) * 100)}%` }}
                    ></div>

                    <div className="space-y-8 relative">
                        {LEVEL_MAP.map((item) => {
                            const isUnlocked = stats.level >= item.lvl;
                            const isCurrent = stats.level === item.lvl;
                            const isFuture = stats.level < item.lvl;

                            return (
                                <div
                                    key={item.lvl}
                                    id={`lvl-node-${item.lvl}`}
                                    className={`relative flex gap-5 group ${isFuture ? 'opacity-50 grayscale-[0.8]' : 'opacity-100'} transition-all duration-500`}
                                >
                                    {/* NODE ICON */}
                                    <div className={`
                                        w-9 h-9 shrink-0 rounded-full z-10 flex items-center justify-center border-[3px] shadow-lg transition-transform duration-300
                                        ${isCurrent
                                            ? 'bg-indigo-500 border-white scale-125 shadow-indigo-500/50'
                                            : isUnlocked
                                                ? 'bg-slate-800 border-indigo-500'
                                                : 'bg-slate-900 border-slate-700'
                                        }
                                    `}>
                                        {isUnlocked
                                            ? <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                            : <Lock size={12} className="text-slate-500" />
                                        }
                                    </div>

                                    {/* CONTENT CARD */}
                                    <div className={`
                                        flex-1 p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden
                                        ${isCurrent
                                            ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-900/20 translate-x-2'
                                            : 'bg-slate-900/60 border-slate-800'
                                        }
                                    `}>
                                        {/* Current Indicator Tag */}
                                        {isCurrent && (
                                            <div className="absolute top-0 right-0 bg-indigo-500 text-[8px] font-black text-white px-2 py-1 rounded-bl-xl">
                                                ACTIVE
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-indigo-500/10' : 'bg-slate-800'}`}>
                                                {item.type === 'skin' ? <Gift size={16} className={isUnlocked ? 'text-pink-400' : 'text-slate-500'} /> :
                                                    item.type === 'feature' ? <Zap size={16} className={isUnlocked ? 'text-yellow-400' : 'text-slate-500'} /> :
                                                        <Award size={16} className={isUnlocked ? 'text-cyan-400' : 'text-slate-500'} />}
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('home.level')} {item.lvl}</div>
                                                <div className={`font-bold text-base leading-tight ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>{t(item.titleKey)}</div>
                                            </div>
                                        </div>

                                        <div className="text-xs font-medium text-slate-400 bg-black/20 p-2 rounded-lg flex items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-600">{t('leveling.next_reward')}:</span>
                                            <span className={isUnlocked ? 'text-indigo-300' : 'text-slate-500'}>{t(item.rewardKey)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="text-center py-12">
                    <div className="inline-block p-4 rounded-full bg-slate-900 border border-slate-800">
                        <ChevronsUp className="text-slate-700 animate-bounce" size={24} />
                    </div>
                    <p className="mt-4 text-xs font-mono text-slate-600 uppercase tracking-[0.2em]">{t('leveling.more_soon')}</p>
                </div>
            </div>
        </div>
    );
};

export default LevelingSystem;
