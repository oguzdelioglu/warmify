import React from 'react';
import { UserStats, UserSettings, AppView } from '../../types';
import { XPBar, TrophyCase } from '../Gamification';
import { Play, Trophy, Settings as SettingsIcon, Zap, Target, Activity as ActivityIcon } from 'lucide-react';
import { SoundEngine } from '../../services/audioService';

interface HomeViewProps {
    userStats: UserStats;
    settings: UserSettings;
    setView: (view: AppView) => void;
    startWorkout: () => void;
    newUnlockedBadge: string | null;
}

// SVG Logo Component
export const WarmifyLogo = () => (
    <img src="/logo.png" alt="Warmify" className="w-10 h-10 inline-block mr-2 rounded-xl shadow-lg" />
);

export const HomeView: React.FC<HomeViewProps> = ({ userStats, settings, setView, startWorkout, newUnlockedBadge }) => {
    return (
        <div className="flex-1 flex flex-col justify-evenly gap-4 animate-[fadeIn_0.5s_ease-out] overflow-y-auto no-scrollbar pb-8 relative">

            {/* Background Ambient Blobs */}
            <div className="absolute top-10 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-10 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none"></div>

            {/* Hero Card */}
            <div className="bg-gradient-to-br from-indigo-900/90 to-slate-900/90 backdrop-blur-md border border-indigo-500/30 p-5 rounded-3xl shadow-2xl relative overflow-hidden group flex-shrink-0 z-10">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
                <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black italic text-white leading-none tracking-tight">DAILY OP</h2>
                                <p className="text-indigo-200 text-xs font-medium mt-1">
                                    {settings.seatedMode ? "Upper body sequence (Seated)." : "Full body sequence."}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-orange-400 font-bold text-sm bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                                    <Zap size={14} fill="currentColor" /> {userStats.streak}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Make XP Bar clickable too */}
                        <div onClick={() => setView(AppView.LEVELING)} className="cursor-pointer">
                            <XPBar xp={userStats.xp} level={userStats.level} />
                        </div>
                        <button onClick={startWorkout} className="w-full py-4 bg-white text-indigo-950 rounded-2xl font-black text-lg shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-50 hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite] opacity-50"></div>
                            <Play fill="currentColor" size={20} /> INITIATE MISSION
                        </button>
                    </div>
                </div>
            </div>

            {/* Trophy Row */}
            <div className="flex-shrink-0 z-10">
                <TrophyCase badges={userStats.badges} newBadgeId={newUnlockedBadge || undefined} />
            </div>

            {/* Chic Stats */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0 z-10">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
                    <div className="p-2 bg-cyan-500/10 rounded-full mb-2">
                        <Target size={16} className="text-cyan-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total Score</div>
                    <div className="text-2xl font-black text-white font-mono tracking-tighter group-hover:scale-105 transition-transform">{userStats.totalPoints.toLocaleString()}</div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="p-2 bg-emerald-500/10 rounded-full mb-2">
                        <ActivityIcon size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Workouts</div>
                    <div className="text-2xl font-black text-white font-mono tracking-tighter group-hover:scale-105 transition-transform">{userStats.workoutsCompleted}</div>
                </div>
            </div>

            {/* Global Leaderboard Button */}
            <button onClick={() => { SoundEngine.playUI('click'); setView(AppView.LEADERBOARD); }} className="flex-shrink-0 w-full py-3 bg-slate-800/40 border border-slate-700/50 rounded-xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-colors tracking-wide text-xs flex items-center justify-center gap-2 z-10">
                <Trophy size={14} /> GLOBAL RANKINGS
            </button>
        </div>
    );
}
