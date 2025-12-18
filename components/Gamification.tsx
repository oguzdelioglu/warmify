import React from 'react';
import { LeaderboardEntry } from '../types';
import { Shield, CheckCircle2, Crown, Medal } from 'lucide-react';
import { useLocalization } from '../services/localization/LocalizationContext';
import { TranslationKeys } from '../services/localization/types';
import { calculateNextLevelXP } from '../utils/levelUtils';

// --- BARS ---
export const XPBar: React.FC<{ xp: number; level: number }> = ({ xp, level }) => {
    const xpForNextLevel = calculateNextLevelXP(level);
    const progress = (xp / xpForNextLevel) * 100;

    return (
        <div className="relative pt-1 w-full">
            <div className="flex mb-1 items-center justify-between">
                <div>
                    <span className="text-[10px] font-black tracking-widest inline-block py-0.5 px-2 uppercase rounded-md text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        Lvl {level}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-emerald-200/80 font-mono">
                        {xp} <span className="text-emerald-500">/</span> {xpForNextLevel}
                    </span>
                </div>
            </div>
            <div className="overflow-hidden h-1.5 mb-2 text-xs flex rounded-full bg-slate-900 border border-slate-800 relative group">
                <div className="absolute inset-0 bg-slate-800/50 w-full h-full animate-pulse"></div>
                <div
                    style={{ width: `${progress}%` }}
                    className="shadow-[0_0_15px_rgba(52,211,153,0.6)] flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-300 transition-all duration-1000 ease-out relative"
                >
                    <div className="absolute top-0 right-0 w-[2px] h-full bg-white/80 blur-[1px]"></div>
                </div>
            </div>
        </div>
    );
};

export const HealthBar: React.FC<{ health: number }> = ({ health }) => {
    let color = "from-green-500 to-emerald-400";
    let shadow = "shadow-[0_0_10px_rgba(16,185,129,0.4)]";
    if (health < 50) { color = "from-yellow-500 to-orange-400"; shadow = "shadow-[0_0_10px_rgba(245,158,11,0.4)]"; }
    if (health < 20) { color = "from-red-600 to-rose-500"; shadow = "shadow-[0_0_15px_rgba(225,29,72,0.6)]"; }

    return (
        <div className="flex items-center gap-2 w-full max-w-[200px]">
            <HeartIcon pulse={health < 30} />
            <div className="flex-1 h-2.5 bg-slate-900/90 rounded-sm border border-slate-700/50 overflow-hidden relative skew-x-[-10deg]">
                <div
                    className={`h-full bg-gradient-to-r ${color} transition-all duration-300 ease-linear ${shadow}`}
                    style={{ width: `${health}%` }}
                />
            </div>
        </div>
    );
};

const HeartIcon = ({ pulse }: { pulse: boolean }) => (
    <div className={`relative ${pulse ? 'animate-[ping_1s_ease-in-out_infinite]' : ''}`}>
        <Shield size={18} className="text-slate-200 relative z-10" fill={pulse ? "#ef4444" : "currentColor"} />
    </div>
);

// --- TROPHY CASE ---
// --- TROPHY CASE ---
export const TrophyCase: React.FC<{ badges: string[], newBadgeId?: string }> = ({ badges, newBadgeId }) => {
    const { t } = useLocalization();
    const allBadges: { id: string; icon: string; nameKey: keyof TranslationKeys; descKey: keyof TranslationKeys }[] = [
        { id: 'first_step', icon: '👟', nameKey: 'badge.first_step.name', descKey: 'badge.first_step.desc' },
        { id: 'on_fire', icon: '🔥', nameKey: 'badge.on_fire.name', descKey: 'badge.on_fire.desc' },
        { id: 'champion', icon: '🏆', nameKey: 'badge.champion.name', descKey: 'badge.champion.desc' },
        { id: 'combo_king', icon: '⚡', nameKey: 'badge.combo_king.name', descKey: 'badge.combo_king.desc' },
        { id: 'survivor', icon: '🛡️', nameKey: 'badge.survivor.name', descKey: 'badge.survivor.desc' },
        { id: 'ninja', icon: '🥷', nameKey: 'badge.ninja.name', descKey: 'badge.ninja.desc' },
        // Expanded Set (20 Total)
        { id: 'early_bird', icon: '🌅', nameKey: 'badge.early_bird.name', descKey: 'badge.early_bird.desc' },
        { id: 'night_owl', icon: '🦉', nameKey: 'badge.night_owl.name', descKey: 'badge.night_owl.desc' },
        { id: 'marathoner', icon: '🏃', nameKey: 'badge.marathoner.name', descKey: 'badge.marathoner.desc' },
        { id: 'speedster', icon: '⚡', nameKey: 'badge.speedster.name', descKey: 'badge.speedster.desc' },
        { id: 'sharpshooter', icon: '🎯', nameKey: 'badge.sharpshooter.name', descKey: 'badge.sharpshooter.desc' },
        { id: 'social_butterfly', icon: '🦋', nameKey: 'badge.social_butterfly.name', descKey: 'badge.social_butterfly.desc' },
        { id: 'consistent', icon: '📅', nameKey: 'badge.consistent.name', descKey: 'badge.consistent.desc' },
        { id: 'unstoppable', icon: '🚀', nameKey: 'badge.unstoppable.name', descKey: 'badge.unstoppable.desc' },
        { id: 'weekend_warrior', icon: '⚔️', nameKey: 'badge.weekend_warrior.name', descKey: 'badge.weekend_warrior.desc' },
        { id: 'yogi', icon: '🧘', nameKey: 'badge.yogi.name', descKey: 'badge.yogi.desc' },
        { id: 'globetrotter', icon: '🌍', nameKey: 'badge.globetrotter.name', descKey: 'badge.globetrotter.desc' },
        { id: 'clean_sheet', icon: '🧼', nameKey: 'badge.clean_sheet.name', descKey: 'badge.clean_sheet.desc' },
        { id: 'comeback_kid', icon: '🦅', nameKey: 'badge.comeback_kid.name', descKey: 'badge.comeback_kid.desc' },
        { id: 'centurion', icon: '💯', nameKey: 'badge.centurion.name', descKey: 'badge.centurion.desc' },
    ];

    const unlockedCount = badges.filter(id => allBadges.some(b => b.id === id)).length;
    const totalCount = allBadges.length;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-end mb-2 px-1">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield size={12} className="text-amber-500" /> {t('home.accolades')}
                </h3>
                <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700">
                    {unlockedCount}/{totalCount}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar masked-overflow">
                <div className="flex lg:grid lg:grid-cols-3 gap-2 pb-2 snap-x lg:snap-none w-full">
                    {allBadges.map((badge) => {
                        const isUnlocked = badges.includes(badge.id);
                        const isNew = newBadgeId === badge.id;

                        return (
                            <div
                                key={badge.id}
                                className={`
                                relative flex-shrink-0 w-20 lg:w-full h-24 lg:min-h-[100px] snap-center rounded-xl border
                                flex flex-col items-center justify-center gap-1 p-1
                                transition-all duration-300 group
                                ${isNew ? 'border-yellow-400 bg-yellow-500/10 scale-105 shadow-[0_0_20px_rgba(250,204,21,0.5)] z-10' : ''}
                                ${!isNew && isUnlocked
                                        ? 'bg-gradient-to-br from-slate-800/90 to-indigo-900/40 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)] hover:scale-[1.03] hover:border-indigo-400/50'
                                        : ''
                                    }
                                ${!isUnlocked && !isNew ? 'bg-slate-900/40 border-slate-800/60 grayscale opacity-30 hover:opacity-50 transition-opacity' : ''}
                            `}
                            >
                                {isNew && (
                                    <div className="absolute -inset-3 rounded-xl bg-orange-500/20 blur-md animate-pulse -z-10"></div>
                                )}
                                {isUnlocked && <div className="absolute inset-0 bg-indigo-500/10 rounded-xl blur-xl -z-10"></div>}

                                <div className={`text-2xl lg:text-3xl filter ${isUnlocked ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:scale-110 transition-transform' : ''}`}>
                                    {badge.icon}
                                </div>

                                <div className="text-center w-full px-1">
                                    <div className={`text-[8px] lg:text-[7px] font-black uppercase tracking-wider truncate w-full ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{t(badge.nameKey)}</div>
                                </div>

                                {isUnlocked && (
                                    <div className="absolute top-1 right-1">
                                        <CheckCircle2 size={10} className="text-emerald-400 drop-shadow-md" />
                                    </div>
                                )}
                                {isNew && (
                                    <div className="absolute -top-1 -right-2 bg-red-600 border border-red-400 text-[6px] text-white px-1.5 py-0.5 rounded-full font-bold animate-bounce shadow-lg">NEW</div>
                                )}
                            </div>
                        );
                    })}
                    {/* Spacer for scroll mode */}
                    <div className="w-1 flex-shrink-0 lg:hidden"></div>
                </div>
            </div>
        </div>
    );
};


// --- LEADERBOARD (REDESIGNED) ---
export const LeaderboardList: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => {
    const sorted = [...entries].sort((a, b) => b.points - a.points);

    return (
        <div className="w-full space-y-3 pb-8">
            {sorted.map((entry, index) => {
                const rank = index + 1;
                const isYou = entry.name === 'You';

                let rankStyle = "bg-slate-800 border-slate-700/50 text-slate-300";
                let glow = "";
                let icon = null;

                if (rank === 1) {
                    rankStyle = "bg-gradient-to-r from-yellow-600/30 to-amber-900/30 border-yellow-500/60 text-yellow-300";
                    glow = "shadow-[0_0_15px_rgba(234,179,8,0.2)]";
                    icon = <Crown size={20} fill="currentColor" />;
                } else if (rank === 2) {
                    rankStyle = "bg-gradient-to-r from-slate-500/30 to-slate-800/30 border-slate-400/60 text-slate-200";
                    icon = <Medal size={20} className="text-slate-300" />;
                } else if (rank === 3) {
                    rankStyle = "bg-gradient-to-r from-orange-800/30 to-orange-950/30 border-orange-600/60 text-orange-300";
                    icon = <Medal size={20} className="text-orange-400" />;
                }

                if (isYou) {
                    rankStyle += " ring-2 ring-indigo-500 bg-indigo-900/40";
                }

                return (
                    <div
                        key={entry.id}
                        className={`
                    relative flex items-center p-3 rounded-xl border backdrop-blur-md transition-all
                    ${rankStyle} ${glow}
                    animate-[slideUp_0.4s_ease-out_forwards]
                `}
                        style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }} // Initially hidden for animation
                    >
                        {/* RANK */}
                        <div className="flex-shrink-0 w-10 flex items-center justify-center font-black text-lg italic">
                            {icon ? icon : `#${rank}`}
                        </div>

                        {/* AVATAR */}
                        <div className="relative mx-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-white/20 flex items-center justify-center text-xl shadow-lg relative z-10">
                                {entry.avatar}
                            </div>
                            {rank === 1 && <div className="absolute -inset-1 bg-yellow-500/40 rounded-full blur-md animate-pulse"></div>}
                        </div>

                        {/* INFO */}
                        <div className="flex-grow flex flex-col justify-center overflow-hidden">
                            <div className="flex items-center gap-2">
                                <h3 className={`text-sm font-bold truncate ${isYou ? 'text-indigo-300' : 'text-white'}`}>
                                    {entry.name}
                                </h3>
                                {isYou && <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold tracking-wider">YOU</span>}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[9px] bg-slate-900/50 px-1.5 py-0.5 rounded text-slate-400 font-mono">Lvl {entry.level}</span>
                            </div>
                        </div>

                        {/* POINTS */}
                        <div className="flex-shrink-0 text-right pl-2">
                            <div className="text-base font-black font-mono tracking-tight text-white leading-none">
                                {entry.points.toLocaleString()}
                            </div>
                            <div className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">PTS</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};