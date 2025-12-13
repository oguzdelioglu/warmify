
-- MOCK DATA FOR LEADERBOARD
-- Run this in your Supabase SQL Editor to populate the top 10 positions.

INSERT INTO leaderboard (id, username, points, level, avatar) VALUES
('mock_1', 'CyberNinja', 125000, 42, '🥷'),
('mock_2', 'FitGulu', 98000, 35, '🧘‍♂️'),
('mock_3', 'IronTitan', 87500, 31, '🦾'),
('mock_4', 'SpeedDemon', 76000, 28, '⚡'),
('mock_5', 'ZenMaster', 65400, 25, '🎋'),
('mock_6', 'GymRat99', 54300, 22, '🐭'),
('mock_7', 'CardioKing', 43200, 19, '🏃'),
('mock_8', 'PixelWarrior', 32100, 16, '👾'),
('mock_9', 'HealthyLife', 21000, 12, '🥗'),
('mock_10', 'RookieCrusher', 15000, 10, '🔨')
ON CONFLICT (id) DO UPDATE 
SET points = EXCLUDED.points, level = EXCLUDED.level, avatar = EXCLUDED.avatar;
