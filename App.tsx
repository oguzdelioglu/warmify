import React, { useState, useEffect, useRef } from 'react';
import ThreeScene from './components/ThreeScene';
import { AppView, UserStats, GameState, LeaderboardEntry, UserSettings, LogMessage, ExerciseDef, WorkoutResultData } from './types';
import { GeminiWorkoutCoach } from './services/geminiLive';
import { PoseService } from './services/poseService'; // New Service
import { XPBar, TrophyCase, HealthBar } from './components/Gamification';
import Onboarding from './components/Onboarding';
import Settings from './components/Settings';
import Paywall from './components/Paywall';
import WorkoutResults from './components/WorkoutResults';
import BadgeReveal from './components/BadgeReveal';
import DebugConsole from './components/DebugConsole';
import RigOverlay from './components/RigOverlay';
import LevelingSystem from './components/LevelingSystem';
import { Timer, X } from 'lucide-react';
import { SoundEngine } from './services/audioService';
import { HomeView } from './components/views/HomeView';
import { Header } from './components/Header';
import { LeaderboardView } from './components/views/LeaderboardView';

// --- GAME CONFIG ---
const EXERCISES: ExerciseDef[] = [
    { id: 'Jumping Jacks', name: 'Jumping Jacks', duration: 30, instruction: 'Jump wide, clap hands!', color: 'text-blue-400' },
    { id: 'High Knees', name: 'High Knees', duration: 25, instruction: 'Knees to chest, fast!', color: 'text-yellow-400' },
    { id: 'Squats', name: 'Power Squats', duration: 30, instruction: 'Keep back straight, go low!', color: 'text-emerald-400' },
    { id: 'Shadow Boxing', name: 'Shadow Box', duration: 20, instruction: 'Punch the air, keep moving!', color: 'text-red-400' },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { id: '1', name: 'FitMaster99', points: 15400, level: 12, avatar: '🦁' },
    { id: '2', name: 'YogaQueen', points: 12350, level: 10, avatar: '🧘‍♀️' },
    { id: '3', name: 'RunnerBoy', points: 9800, level: 8, avatar: '🏃' },
    { id: '4', name: 'You', points: 0, level: 1, avatar: '🦸' },
];

const DEFAULT_SETTINGS: UserSettings = {
    isDebugMode: false,
    soundEnabled: true,
    seatedMode: false,
    characterArchetype: 'SPIRIT', // Default changed to Spirit
    characterSkin: 0
};

// Header and other views extracted to components
import { SplashScreen } from './components/SplashScreen';

export default function App() {
    const [view, setView] = useState<AppView>(AppView.HOME);
    const [showSplash, setShowSplash] = useState(true);




    // --- STATE ---
    const [userStats, setUserStats] = useState<UserStats>(() => {
        const saved = localStorage.getItem('warmify_user_stats');
        return saved ? JSON.parse(saved) : {
            streak: 0, totalPoints: 0, xp: 0, level: 1,
            workoutsCompleted: 0, lastWorkoutDate: null, badges: [], isPremium: false
        };
    });

    const [settings, setSettings] = useState<UserSettings>(() => {
        const saved = localStorage.getItem('warmify_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
        return localStorage.getItem('warmify_onboarding_complete') === 'true';
    });

    const [gameState, setGameState] = useState<GameState>({
        score: 0, combo: 1, health: 100,
        feedback: "Stand By...", feedbackType: 'neutral',
        isSessionActive: false, currentExerciseIndex: 0, timeRemaining: 0,
        phase: 'WARMUP',
        lastHitTime: 0
    });

    const [workoutResult, setWorkoutResult] = useState<WorkoutResultData | null>(null);
    const [newUnlockedBadge, setNewUnlockedBadge] = useState<string | null>(null);

    const [intensity, setIntensity] = useState(0);
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [countdown, setCountdown] = useState(3);
    const [simAutoPlay, setSimAutoPlay] = useState(false);

    // Real-time Pose Data
    const [poseLandmarks, setPoseLandmarks] = useState<any>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const coachRef = useRef<GeminiWorkoutCoach | null>(null);
    const poseServiceRef = useRef<PoseService | null>(null);
    const gameLoopRef = useRef<number | null>(null);

    useEffect(() => { localStorage.setItem('warmify_user_stats', JSON.stringify(userStats)); }, [userStats]);
    useEffect(() => { localStorage.setItem('warmify_settings', JSON.stringify(settings)); }, [settings]);

    useEffect(() => {
        if (!hasCompletedOnboarding) {
            setView(AppView.ONBOARDING);
        }
        // Initialize sound mute state
        SoundEngine.setMuted(!settings.soundEnabled);
    }, [hasCompletedOnboarding, settings.soundEnabled]);

    const addLog = (message: string, type: 'info' | 'error' | 'success' = 'info') => {
        if (!settings.isDebugMode) return;
        setLogs(prev => [...prev.slice(-49), {
            id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), message, type
        }]);
    };

    const startCountdown = () => {
        setGameState(prev => ({ ...prev, phase: 'COUNTDOWN', feedback: "PREPARE", feedbackType: 'neutral' }));
        setCountdown(3);

        let count = 3;
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                setCountdown(count);
                SoundEngine.playUI('click');
            } else {
                clearInterval(interval);
                startGameLoop();
            }
        }, 1000);
    };

    const startGameLoop = () => {
        let exerciseIdx = 0;
        let phaseTime = EXERCISES[0].duration;
        SoundEngine.playLevelUp(); // Start sound

        setGameState(prev => ({
            ...prev, isSessionActive: true, score: 0, combo: 1, health: 100,
            currentExerciseIndex: 0, timeRemaining: phaseTime, phase: 'ACTIVE',
            feedback: "GO!", feedbackType: 'good',
            lastHitTime: 0
        }));

        coachRef.current?.setExercise(EXERCISES[0].name);

        gameLoopRef.current = window.setInterval(() => {
            setGameState(prev => {
                if (!prev.isSessionActive || prev.phase !== 'ACTIVE') return prev;

                const newHealth = Math.max(0, prev.health - 0.15);
                if (newHealth <= 0) {
                    endWorkout(true);
                    return prev;
                }

                let newTime = prev.timeRemaining - 1;
                let newIndex = prev.currentExerciseIndex;

                if (newTime <= 0) {
                    newIndex++;
                    if (newIndex >= EXERCISES.length) {
                        endWorkout(false);
                        return prev;
                    }
                    newTime = EXERCISES[newIndex].duration;
                    coachRef.current?.setExercise(EXERCISES[newIndex].name);
                    SoundEngine.playLevelUp(); // Phase change sound
                    return {
                        ...prev,
                        health: Math.min(100, newHealth + 20),
                        currentExerciseIndex: newIndex,
                        timeRemaining: newTime,
                        feedback: "NEXT ROUND!",
                        feedbackType: 'neutral'
                    };
                }

                return { ...prev, health: newHealth, timeRemaining: newTime };
            });
        }, 1000);
    };

    const handleHit = (quality: string, feedback: string) => {
        SoundEngine.playHit(quality as 'PERFECT' | 'GOOD');
        setGameState(prev => {
            if (prev.phase !== 'ACTIVE') return prev;
            const combo = Math.min(8, prev.combo + 0.5);
            const basePoints = quality === 'PERFECT' ? 50 : 20;
            const points = Math.floor(basePoints * Math.floor(combo));

            return {
                ...prev,
                score: prev.score + points,
                combo: combo,
                health: Math.min(100, prev.health + (quality === 'PERFECT' ? 5 : 2)),
                feedback: `${quality}!`,
                feedbackType: 'good',
                lastHitTime: Date.now()
            };
        });
        setIntensity(1.0);
        setTimeout(() => setIntensity(0.2), 200);
        // Reset feedback visual after short delay
        setTimeout(() => {
            setGameState(prev => ({ ...prev, feedbackType: 'neutral' }));
        }, 600);
    };

    const handleMiss = (issue: string) => {
        SoundEngine.playMiss();
        setGameState(prev => {
            if (prev.phase !== 'ACTIVE') return prev;
            return {
                ...prev,
                combo: 1,
                health: Math.max(0, prev.health - 5),
                feedback: issue,
                feedbackType: 'bad'
            };
        });
        setIntensity(0);
        // Reset feedback visual after short delay
        setTimeout(() => {
            setGameState(prev => ({ ...prev, feedbackType: 'neutral' }));
        }, 800);
    };

    useEffect(() => {
        let interval: number;
        if (simAutoPlay && gameState.isSessionActive) {
            interval = window.setInterval(() => {
                if (Math.random() > 0.1) handleHit("PERFECT", "Simulated Hit!");
                else handleMiss("Simulated Miss");
            }, 1200);
        }
        return () => clearInterval(interval);
    }, [simAutoPlay, gameState.isSessionActive]);


    const startWorkout = async () => {
        SoundEngine.playUI('click');
        setView(AppView.WORKOUT);
        setLogs([]);
        addLog("System initializing...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                addLog("Video stream active", 'success');

                // 1. Initialize Gemini for Logic
                coachRef.current = new GeminiWorkoutCoach(videoRef.current, {
                    onHit: handleHit,
                    onMiss: handleMiss,
                    onStatusChange: (status) => setGameState(p => ({ ...p, feedback: status, feedbackType: 'neutral' })),
                    onAudioData: (data) => {
                        const avg = data.reduce((a, b) => a + b, 0) / data.length;
                        setIntensity(Math.min(avg / 100, 1));
                    },
                    onLog: addLog
                });

                // 2. Initialize PoseService for Visualization
                poseServiceRef.current = new PoseService((results) => {
                    if (results && results.poseLandmarks) {
                        setPoseLandmarks(results.poseLandmarks);
                    }
                });
                await poseServiceRef.current.initialize(videoRef.current);

                await coachRef.current.startSession();
                startCountdown();
            }
        } catch (e: any) {
            console.error("Startup Error:", e);
            if (settings.isDebugMode) {
                addLog(`Startup failed: ${e.message || e}`, 'error');
                startCountdown();
            } else {
                alert(`Camera/System Error: ${e.message || "Unknown error"}. Check permissions.`);
                setView(AppView.HOME);
            }
        }
    };

    const endWorkout = (failed: boolean = false) => {
        if (gameLoopRef.current) window.clearInterval(gameLoopRef.current);
        coachRef.current?.stop();
        poseServiceRef.current?.stop(); // Stop pose detection
        if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        setSimAutoPlay(false);

        if (failed && gameState.score < 50) {
            alert("Workout Failed! Run out of health.");
            setGameState(prev => ({ ...prev, isSessionActive: false, phase: 'WARMUP' }));
            setView(AppView.HOME);
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const isNewDay = userStats.lastWorkoutDate !== today;
        const xpGained = gameState.score;
        let currentXp = userStats.xp + xpGained;
        let currentLevel = userStats.level;
        let isLevelUp = false;

        while (currentXp >= currentLevel * 1000) {
            currentXp -= currentLevel * 1000;
            currentLevel++;
            isLevelUp = true;
        }

        const newBadges: string[] = [];
        if (userStats.workoutsCompleted + 1 >= 1 && !userStats.badges.includes('first_step')) newBadges.push('first_step');
        if (gameState.score >= 1000 && !userStats.badges.includes('champion')) newBadges.push('champion');

        // Update Result State
        setWorkoutResult({
            score: gameState.score,
            xpGained,
            newBadges,
            isNewStreak: isNewDay,
            isLevelUp,
            prevLevel: userStats.level,
            newLevel: currentLevel
        });

        // Update User Stats in background
        const newStats: UserStats = {
            ...userStats,
            totalPoints: userStats.totalPoints + gameState.score,
            xp: currentXp,
            level: currentLevel,
            workoutsCompleted: userStats.workoutsCompleted + 1,
            streak: isNewDay ? userStats.streak + 1 : userStats.streak,
            lastWorkoutDate: today,
            badges: [...userStats.badges, ...newBadges]
        };
        setUserStats(newStats);

        setGameState(prev => ({ ...prev, isSessionActive: false, phase: 'WARMUP' }));
        setView(AppView.RESULTS);
    };

    const handleClaimResults = () => {
        if (workoutResult && workoutResult.newBadges.length > 0) {
            setView(AppView.BADGE_REVEAL);
            setNewUnlockedBadge(workoutResult.newBadges[0]); // Show the first one on Home
        } else {
            setView(AppView.HOME);
            setNewUnlockedBadge(null);
        }
    };

    const handleBadgeRevealClose = () => {
        setView(AppView.HOME);
        // Keep newUnlockedBadge set so it shows fire on Home
        setTimeout(() => setNewUnlockedBadge(null), 8000); // Clear fire after 8s
    };

    // --- RENDER ---
    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />;
    }


    if (view === AppView.ONBOARDING) return <Onboarding onComplete={() => { localStorage.setItem('warmify_onboarding_complete', 'true'); setHasCompletedOnboarding(true); setView(AppView.PAYWALL); }} />;
    if (view === AppView.PAYWALL) return <Paywall onClose={() => setView(AppView.HOME)} onPurchaseSuccess={() => { setUserStats(prev => ({ ...prev, isPremium: true })); setView(AppView.HOME); }} />;

    if (view === AppView.RESULTS && workoutResult) {
        return <WorkoutResults data={workoutResult} onClaim={handleClaimResults} onRestart={startWorkout} />;
    }

    if (view === AppView.BADGE_REVEAL && workoutResult) {
        return <BadgeReveal badges={workoutResult.newBadges} onClose={handleBadgeRevealClose} />;
    }

    const currentExercise = EXERCISES[gameState.currentExerciseIndex];

    // ... (imports will be updated via multi-replace if possible or I'll do it here)
    // I will reuse the existing imports and logic, just replacing the return statement roughly.
    // Wait, replace_file_content is for contiguous blocks.
    // App.tsx is large.
    // I can replace the imports first.
    // Then Replace the JSX return. 

    // Actually I will use multi_replace to do both at once if possible, or sequential replaces.
    // Let's do imports first.
    // Then the Render.

    // BUT wait, I need to remove the components that were moved out (Internal components like WarmifyLogo in App.tsx).
    // WarmifyLogo is defined in App.tsx lines 42-49. I should remove it.

    // Let's use `view_file` again on App.tsx to make sure I have the latest lines numbers since I last viewed it (step 5).
    // Nothing changed in App.tsx yet.

    return (
        <div className="relative h-screen max-h-screen text-white font-sans selection:bg-blue-500 overflow-hidden bg-slate-900 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <ThreeScene intensity={intensity} />

            <div className="relative z-10 w-full max-w-md mx-auto h-full flex flex-col p-4 transition-all duration-500">

                <Header view={view} setView={setView} userStats={userStats} />

                {view === AppView.SETTINGS && <Settings settings={settings} updateSettings={setSettings} onBack={() => setView(AppView.HOME)} onReset={() => { localStorage.clear(); window.location.reload(); }} />}

                {view === AppView.LEVELING && <LevelingSystem stats={userStats} onBack={() => setView(AppView.HOME)} />}

                {view === AppView.HOME && (
                    <HomeView
                        userStats={userStats}
                        settings={settings}
                        setView={setView}
                        startWorkout={startWorkout}
                        newUnlockedBadge={newUnlockedBadge}
                    />
                )}

                {view === AppView.WORKOUT && (
                    <div className="flex-1 flex flex-col relative h-full overflow-hidden rounded-3xl border-4 border-slate-800 shadow-2xl bg-black">
                        {settings.isDebugMode && (
                            <DebugConsole
                                logs={logs}
                                onHitTest={() => handleHit("PERFECT", "DEBUG HIT")}
                                onMissTest={() => handleMiss("DEBUG MISS")}
                                onToggleAutoSim={() => setSimAutoPlay(!simAutoPlay)}
                                isAutoSim={simAutoPlay}
                            />
                        )}
                        <div className="absolute inset-0 z-0">
                            <video ref={videoRef} playsInline muted className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${gameState.phase === 'COUNTDOWN' ? 'opacity-30 blur-sm' : 'opacity-80'}`} />
                            {gameState.phase === 'ACTIVE' && (
                                <RigOverlay
                                    exercise={currentExercise.id}
                                    mode="TRACKER"
                                    isActive={gameState.isSessionActive}
                                    videoRef={videoRef}
                                    seatedMode={settings.seatedMode}
                                    archetype={settings.characterArchetype}
                                    skinId={settings.characterSkin}
                                    feedbackType={gameState.feedbackType}
                                    poseLandmarks={poseLandmarks} // Pass real data
                                />
                            )}
                        </div>

                        {gameState.phase === 'ACTIVE' && Math.floor(gameState.combo) > 1 && (
                            <div key={gameState.lastHitTime} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-combo-pop">
                                <div className={`text-8xl font-black italic drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] ${Math.floor(gameState.combo) >= 4 ? 'text-red-500' : Math.floor(gameState.combo) >= 2 ? 'text-yellow-400' : 'text-blue-400'}`} style={{ WebkitTextStroke: '2px black' }}>
                                    {Math.floor(gameState.combo)}x
                                </div>
                            </div>
                        )}

                        {gameState.phase === 'COUNTDOWN' && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
                                <h2 className={`text-4xl font-black italic ${currentExercise.color} mb-4 text-center drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}>{currentExercise.name}</h2>
                                <div className="w-full h-1/2 relative mb-4">
                                    {/* HUD still uses procedural preview */}
                                    <RigOverlay exercise={currentExercise.id} mode="INSTRUCTION" isActive={true} seatedMode={settings.seatedMode} archetype={settings.characterArchetype} skinId={settings.characterSkin} />
                                </div>
                                <div className="text-9xl font-black text-white animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{countdown}</div>
                                <p className="text-slate-300 font-bold mt-4 text-lg bg-black/50 px-4 py-1 rounded-full">{currentExercise.instruction}</p>
                            </div>
                        )}

                        {gameState.phase === 'ACTIVE' && (
                            <div className="relative z-20 flex flex-col justify-between h-full p-4 pointer-events-none">
                                <div className="flex justify-between items-start w-full">
                                    <button onClick={() => endWorkout(false)} className="pointer-events-auto bg-red-500/20 hover:bg-red-500/40 text-red-200 w-10 h-10 flex items-center justify-center rounded-full border border-red-500/50 transition-colors backdrop-blur-sm">
                                        <X size={20} />
                                    </button>
                                    <div className="flex flex-col gap-1 items-center w-1/3"><HealthBar health={gameState.health} /></div>
                                    <div className="flex flex-col items-end">
                                        <div className="bg-slate-900/80 backdrop-blur border-l-4 border-cyan-400 px-3 py-1 rounded-r-none rounded-l-xl shadow-lg flex flex-col items-end">
                                            <span className="text-[9px] text-cyan-200 font-bold uppercase tracking-widest">Score</span>
                                            <span className="text-2xl font-mono font-bold text-white leading-none">{gameState.score}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none">
                                    <div className={`transition-all duration-200 ${gameState.feedbackType === 'good' ? 'scale-110 text-green-400' : gameState.feedbackType === 'bad' ? 'shake text-red-500' : 'text-white'}`}>
                                        <span className="text-2xl font-black drop-shadow-lg stroke-black" style={{ WebkitTextStroke: '1px black' }}>{gameState.feedback}</span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-start w-full">
                                    <div className="w-32 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-600 overflow-hidden shadow-2xl origin-bottom-left animate-[slideUp_0.5s_ease-out]">
                                        <div className="h-24 relative bg-slate-800/50">
                                            <RigOverlay exercise={currentExercise.id} mode="INSTRUCTION" isActive={gameState.isSessionActive} seatedMode={settings.seatedMode} archetype={settings.characterArchetype} skinId={settings.characterSkin} />
                                        </div>
                                        <div className="p-2 border-t border-slate-700 bg-black/20">
                                            <h2 className={`text-[10px] font-black italic ${currentExercise.color} leading-tight truncate`}>{currentExercise.name}</h2>
                                            <div className="flex items-center gap-1 mt-1 text-slate-400"><Timer size={10} /><span className="text-sm font-mono font-bold text-white">{gameState.timeRemaining}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === AppView.LEADERBOARD && (
                    <LeaderboardView entries={MOCK_LEADERBOARD} userStats={userStats} setView={setView} />
                )}
            </div>
        </div>
    );
}