
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
        const payload = {
            id: userId,
            username: username,
            points: Math.floor(points), // Safe Int
            level: Math.floor(level),   // Safe Int
            avatar: avatar,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('leaderboard')
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.error('CRITICAL: Error updating score:', error);
            console.error('Payload was:', payload);
        } else {
            console.log("Score synced to cloud:", points);
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
