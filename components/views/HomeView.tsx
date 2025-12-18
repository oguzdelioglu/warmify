import React, { useState } from 'react';
import { UserStats, UserSettings, AppView, SportMode } from '../../types';
import { XPBar, TrophyCase } from '../Gamification';
import { Play, Trophy, Zap, Target, Activity as ActivityIcon, CircleDot } from 'lucide-react';
import { SoundEngine } from '../../services/audioService';
import { SportModeSelector } from '../SportModeSelector';
import { FlexibilityTracker } from '../FlexibilityTracker';

interface HomeViewProps {
    userStats: UserStats;
    settings: UserSettings;
    setView: (view: AppView) => void;
    startWorkout: () => void;
    newUnlockedBadge: string | null;
    updateSettings: (settings: UserSettings) => void;
}



import { useLocalization } from '../../services/localization/LocalizationContext';

export const HomeView: React.FC<HomeViewProps> = ({ userStats, settings, setView, startWorkout, newUnlockedBadge, updateSettings }) => {
    const { t } = useLocalization();
    const [showModeSelector, setShowModeSelector] = useState(false);

    const handleModeChange = (mode: SportMode) => {
        updateSettings({ ...settings, sportMode: mode });
        SoundEngine.playUI('click');
        setShowModeSelector(false);
    };

    // Initialize flexibility data if not exists
    const flexibilityData = userStats.flexibilityData || {
        shoulderROM: 65,
        hipROM: 70,
        spineROM: 55,
        lastUpdated: new Date().toISOString(),
        history: []
    };

    return (
        <div className="flex-1 flex flex-col justify-evenly gap-4 animate-[fadeIn_0.5s_ease-out] overflow-y-auto no-scrollbar pb-8 relative w-full max-w-2xl mx-auto">

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
                                <h2 className="text-3xl font-black italic text-white leading-none tracking-tight">{t('home.daily_mission')}</h2>
                                <button
                                    onClick={() => setShowModeSelector(true)}
                                    className="text-indigo-300 text-xs font-medium mt-1 flex items-center gap-1 hover:text-indigo-200 transition-colors"
                                >
                                    <CircleDot size={12} />
                                    {t(`mode.${(settings.sportMode || 'FOOTBALL').toLowerCase()}.name`)}
                                </button>
                            </div>
                            <div className="flex flex-col items-end gap-2">
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
                            <Play fill="currentColor" size={20} /> {t('home.start')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Flexibility Tracker */}
            <div className="flex-shrink-0 z-10">
                <FlexibilityTracker data={flexibilityData} />
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
                <Trophy size={14} /> {t('leaderboard.title')}
            </button>

            {/* Sport Mode Selector Modal */}
            {showModeSelector && (
                <SportModeSelector
                    currentMode={settings.sportMode}
                    onSelectMode={handleModeChange}
                    onClose={() => setShowModeSelector(false)}
                />
            )}
        </div>
    );
};
