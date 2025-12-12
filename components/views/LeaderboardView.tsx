import React from 'react';
import { LeaderboardList } from '../Gamification';
import { AppView, LeaderboardEntry, UserStats } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { SoundEngine } from '../../services/audioService';

interface LeaderboardViewProps {
    entries: LeaderboardEntry[];
    userStats: UserStats;
    setView: (view: AppView) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ entries, userStats, setView }) => {
    // Inject user stats into the mock data if needed, or pass pre-processed entries
    const displayEntries = entries.map(e => e.id === '4' ? { ...e, points: userStats.totalPoints, level: userStats.level } : e);

    return (
        <div className="flex-1 flex flex-col animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center mb-6">
                <button onClick={() => { SoundEngine.playUI('back'); setView(AppView.HOME); }} className="p-2 bg-slate-800 rounded-full mr-4 hover:bg-slate-700 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-bold">Elite Agents</h2>
            </div>
            <LeaderboardList entries={displayEntries} />
        </div>
    );
}
