
export interface LevelDefinition {
    lvl: number;
    titleKey: string;
    rewardKey: string;
    type: 'badge' | 'skin' | 'feature' | 'none';
    avatar: string;
}

export const LEVEL_MAP: LevelDefinition[] = [
    { lvl: 1, titleKey: 'level.1.title', rewardKey: 'level.1.reward', type: 'feature', avatar: '🌱' },
    { lvl: 2, titleKey: 'level.2.title', rewardKey: 'level.2.reward', type: 'badge', avatar: '🥚' },
    { lvl: 3, titleKey: 'level.3.title', rewardKey: 'level.3.reward', type: 'skin', avatar: '🐣' },
    { lvl: 4, titleKey: 'level.4.title', rewardKey: 'level.4.reward', type: 'badge', avatar: '🐥' },
    { lvl: 5, titleKey: 'level.5.title', rewardKey: 'level.5.reward', type: 'feature', avatar: '🛡️' },
    { lvl: 6, titleKey: 'level.6.title', rewardKey: 'level.6.reward', type: 'skin', avatar: '🔥' },
    { lvl: 7, titleKey: 'level.7.title', rewardKey: 'level.7.reward', type: 'feature', avatar: '⚔️' },
    { lvl: 8, titleKey: 'level.8.title', rewardKey: 'level.8.reward', type: 'badge', avatar: '🎖️' },
    { lvl: 9, titleKey: 'level.9.title', rewardKey: 'level.9.reward', type: 'feature', avatar: '👹' },
    { lvl: 10, titleKey: 'level.10.title', rewardKey: 'level.10.reward', type: 'skin', avatar: '🦁' },
    { lvl: 15, titleKey: 'level.15.title', rewardKey: 'level.15.reward', type: 'feature', avatar: '🤖' },
];

export const getLevelDefinition = (level: number): LevelDefinition => {
    // Find the highest configured level less than or equal to current level
    // Or just find exact match? The map has gaps (10->15).
    // Let's assume gaps imply the previous tier or specific mapping.
    // For now, let's reverse sort and find the first one <= level.

    // Actually, simple approach:
    const exact = LEVEL_MAP.find(l => l.lvl === level);
    if (exact) return exact;

    // Fallback logic
    if (level >= 15) return LEVEL_MAP[LEVEL_MAP.length - 1]; // Max
    if (level >= 10) return LEVEL_MAP.find(l => l.lvl === 10)!;

    // If between intervals, return previous
    const sorted = [...LEVEL_MAP].sort((a, b) => b.lvl - a.lvl);
    return sorted.find(l => l.lvl <= level) || LEVEL_MAP[0];
};

export const getAvatarForLevel = (level: number): string => {
    return getLevelDefinition(level).avatar;
};

export const calculateNextLevelXP = (currLevel: number): number => {
    return 5000 + (currLevel * 5000);
};
