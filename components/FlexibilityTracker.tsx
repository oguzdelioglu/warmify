import React from 'react';
import { FlexibilityData } from '../types';
import { useLocalization } from '../services/localization/LocalizationContext';
import { TrendingUp, Rotate3D } from 'lucide-react';

interface FlexibilityTrackerProps {
    data: FlexibilityData;
}

export const FlexibilityTracker: React.FC<FlexibilityTrackerProps> = ({ data }) => {
    const { t } = useLocalization();

    const getProgressColor = (value: number) => {
        if (value >= 80) return 'text-green-400';
        if (value >= 60) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const getProgressBarColor = (value: number) => {
        if (value >= 80) return 'bg-green-500';
        if (value >= 60) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const renderROMBar = (label: string, value: number, maxValue: number = 100) => {
        const percentage = Math.min((value / maxValue) * 100, 100);
        return (
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-bold">{label}</span>
                    <span className={`text-sm font-black ${getProgressColor(percentage)}`}>
                        {value}°
                    </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getProgressBarColor(percentage)} transition-all duration-500 rounded-full`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    // Check if there's improvement from history
    const hasImprovement = data.history.length > 1 && (
        data.shoulderROM > data.history[data.history.length - 2].shoulderROM ||
        data.hipROM > data.history[data.history.length - 2].hipROM ||
        data.spineROM > data.history[data.history.length - 2].spineROM
    );

    return (
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Rotate3D size={18} className="text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-black text-white">{t('flexibility.title')}</h3>
                </div>
                {hasImprovement && (
                    <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                        <TrendingUp size={12} />
                        {t('flexibility.improved')}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {renderROMBar(t('flexibility.shoulder'), data.shoulderROM, 180)}
                {renderROMBar(t('flexibility.hip'), data.hipROM, 120)}
                {renderROMBar(t('flexibility.spine'), data.spineROM, 90)}
            </div>

            <p className="text-[10px] text-slate-500 mt-3 text-center">
                {t('flexibility.tracking_desc')}
            </p>
        </div>
    );
};
