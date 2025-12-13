
import { supabase } from './supabaseClient';
import { LeaderboardEntry } from '../types';

export const LeaderboardService = {

    async getTopGlobal(limit: number = 50): Promise<LeaderboardEntry[]> {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('points', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }

        return data.map((row: any) => ({
            id: row.id,
            name: row.username,
            points: row.points,
            level: row.level,
            avatar: row.avatar || '👤'
        }));
    },

    async updateUserScore(userId: string, username: string, points: number, level: number, avatar: string) {
        // Upsert: Insert if new, update if exists (on conflict of 'id')
        const { error } = await supabase
            .from('leaderboard')
            .upsert({
                id: userId,
                username: username,
                points: points,
                level: level,
                avatar: avatar,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error updating score:', error);
        }
    }
};
