import React, { useState } from 'react';
import { UserStats, UserSettings, AppView, SportMode } from '../../types';
import { XPBar, TrophyCase } from '../Gamification';
import { Play, Trophy, Zap, Target, Activity as ActivityIcon, CircleDot, Bike, Armchair } from 'lucide-react';
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

// Sport mode icon and gradient helper
const getSportModeConfig = (mode: SportMode): { icon: React.ReactNode; gradient: string } => {
    const configs: Record<SportMode, { icon: React.ReactNode; gradient: string }> = {
        'FOOTBALL': { icon: <CircleDot size={16} />, gradient: 'from-green-600 to-emerald-700' },
        'RUGBY': { icon: <Trophy size={16} />, gradient: 'from-amber-600 to-orange-700' },
        'RUNNER': { icon: <ActivityIcon size={16} />, gradient: 'from-blue-600 to-cyan-700' },
        'CYCLIST': { icon: <Bike size={16} />, gradient: 'from-purple-600 to-pink-700' },
        'DESK': { icon: <Armchair size={16} />, gradient: 'from-slate-600 to-gray-700' },
    };
    return configs[mode] || configs['FOOTBALL'];
};



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
        <div className="flex-1 flex flex-col justify-start gap-6 animate-[fadeIn_0.5s_ease-out] overflow-y-auto no-scrollbar pb-4 relative w-full lg:max-w-5xl mx-auto">

            {/* Background Ambient Blobs */}
            <div className="absolute top-10 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-10 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none"></div>

            {/* Hero Card */}
            <div className="bg-gradient-to-br from-indigo-900/90 to-slate-900/90 backdrop-blur-md border border-indigo-500/30 p-4 rounded-3xl shadow-2xl relative overflow-hidden group flex-shrink-0 z-10">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
                <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black italic text-white leading-none tracking-tight">{t('home.daily_mission')}</h2>
                                {(() => {
                                    const modeConfig = getSportModeConfig(settings.sportMode || 'FOOTBALL');
                                    return (
                                        <button
                                            onClick={() => setShowModeSelector(true)}
                                            className="text-white text-sm font-bold mt-1.5 flex items-center gap-2 hover:scale-105 transition-all px-3 py-1.5 rounded-lg border-2 border-white/20 hover:border-white/40 active:scale-95 shadow-lg relative overflow-hidden group"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-r ${modeConfig.gradient} opacity-80 group-hover:opacity-100 animate-pulse`}></div>
                                            <div className="relative z-10">{modeConfig.icon}</div>
                                            <span className="relative z-10 drop-shadow-md">{t(`mode.${(settings.sportMode || 'FOOTBALL').toLowerCase()}.name`)}</span>
                                        </button>
                                    );
                                })()}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-1 text-orange-400 font-bold text-sm bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                                    <Zap size={14} fill="currentColor" /> {userStats.streak}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Make XP Bar clickable too */}
                        <div onClick={() => setView(AppView.LEVELING)} className="cursor-pointer">
                            <XPBar xp={userStats.xp} level={userStats.level} />
                        </div>
                        <button onClick={startWorkout} className="w-full py-3 bg-white text-indigo-950 rounded-2xl font-black text-base shadow-[0_0_25px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-50 hover:shadow-[0_0_35px_rgba(255,255,255,0.4)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-[shine_3s_infinite] opacity-50"></div>
                            <Play fill="currentColor" size={18} /> {t('home.start')}
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
            <div className="grid grid-cols-2 gap-2 flex-shrink-0 z-10">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
                    <div className="p-1.5 bg-cyan-500/10 rounded-full mb-1">
                        <Target size={14} className="text-cyan-400" />
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Total Score</div>
                    <div className="text-xl font-black text-white font-mono tracking-tighter group-hover:scale-105 transition-transform">{userStats.totalPoints.toLocaleString()}</div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="p-1.5 bg-emerald-500/10 rounded-full mb-1">
                        <ActivityIcon size={14} className="text-emerald-400" />
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Workouts</div>
                    <div className="text-xl font-black text-white font-mono tracking-tighter group-hover:scale-105 transition-transform">{userStats.workoutsCompleted}</div>
                </div>
            </div>

            {/* Global Leaderboard Button */}
            <button onClick={() => { SoundEngine.playUI('click'); setView(AppView.LEADERBOARD); }} className="flex-shrink-0 w-full py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-xl font-bold text-slate-400 hover:bg-slate-700 hover:text-white transition-colors tracking-wide text-xs flex items-center justify-center gap-2 z-10">
                <Trophy size={14} /> {t('leaderboard.title')}
            </button>

            {/* Sport Mode Selector Modal */}
            {showModeSelector && (
                <SportModeSelector
                    currentMode={settings.sportMode || 'FOOTBALL'}
                    onSelectMode={handleModeChange}
                    onClose={() => setShowModeSelector(false)}
                />
            )}
        </div>
    );
};
