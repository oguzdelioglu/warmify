
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
    },

    async getUserRank(userId: string): Promise<number> {
        // 1. Get User Points
        const { data: userEntry, error: userError } = await supabase
            .from('leaderboard')
            .select('points')
            .eq('id', userId)
            .single();

        if (userError || !userEntry) {
            return 0; // User not found on leaderboard
        }

        // 2. Count users with more points
        const { count, error: countError } = await supabase
            .from('leaderboard')
            .select('*', { count: 'exact', head: true })
            .gt('points', userEntry.points);

        if (countError) {
            console.error('Error fetching rank:', countError);
            return 0;
        }

        return (count || 0) + 1;
    }
};
