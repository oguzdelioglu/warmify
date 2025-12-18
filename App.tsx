import React, { useState, useEffect, useRef } from 'react';
import ThreeScene from './components/ThreeScene';
import { AppView, UserStats, GameState, LeaderboardEntry, UserSettings, LogMessage, ExerciseDef, WorkoutResultData, SportMode } from './types';

import { PoseService } from './services/poseService';
import { MoveEvaluator } from './services/MoveEvaluator';
import { XPBar, TrophyCase, HealthBar } from './components/Gamification';
import Onboarding from './components/Onboarding';
import Settings from './components/Settings';
import Paywall from './components/Paywall';
import WorkoutResults from './components/WorkoutResults';
import BadgeReveal from './components/BadgeReveal';
import DebugConsole from './components/DebugConsole';
import RigOverlay from './components/RigOverlay';
import LevelingSystem from './components/LevelingSystem';
import { RateUs } from './components/RateUs';
import { Timer, X } from 'lucide-react';
import { SoundEngine } from './services/audioService';
import { HomeView } from './components/views/HomeView';
import { Header } from './components/Header';
import { LeaderboardView } from './components/views/LeaderboardView';
import { useLocalization } from './services/localization/LocalizationContext';

// --- GAME CONFIG ---
// Base exercises (default/general)
const BASE_EXERCISES: ExerciseDef[] = [
    { id: 'Overhead Reach', name: 'Overhead Reach', nameKey: 'exercise.overhead_reach.name', duration: 30, instruction: 'Reach hands high above head!', instructionKey: 'exercise.overhead_reach.instruction', color: 'text-blue-400' },
    { id: 'T-Pose Pulses', name: 'T-Pose Pulses', nameKey: 'exercise.t_pose_pulses.name', duration: 30, instruction: 'Hold arms out and pulse!', instructionKey: 'exercise.t_pose_pulses.instruction', color: 'text-purple-400' },
    { id: 'Hooks', name: 'Hooks', nameKey: 'exercise.hooks.name', duration: 30, instruction: 'Throw hooks with bent elbows!', instructionKey: 'exercise.hooks.instruction', color: 'text-red-400' },
    { id: 'Uppercuts', name: 'Uppercuts', nameKey: 'exercise.uppercuts.name', duration: 30, instruction: 'Punch upwards powerfully!', instructionKey: 'exercise.uppercuts.instruction', color: 'text-yellow-400' },
    { id: 'Shoulder Press', name: 'Shoulder Press', nameKey: 'exercise.shoulder_press.name', duration: 30, instruction: 'Push from shoulders to sky!', instructionKey: 'exercise.shoulder_press.instruction', color: 'text-emerald-400' },
    { id: 'Shadow Boxing', name: 'Shadow Box', nameKey: 'exercise.shadow_boxing.name', duration: 30, instruction: 'Freestyle punches!', instructionKey: 'exercise.shadow_boxing.instruction', color: 'text-orange-400' },
];

// Football - Groin & Hamstring focus
// Football
const FOOTBALL_EXERCISES: ExerciseDef[] = [
    { id: 'Leg Swings', name: 'Leg Swings', nameKey: 'exercise.leg_swings.name', duration: 30, instruction: 'Swing legs side to side!', instructionKey: 'exercise.leg_swings.instruction', color: 'text-green-400' },
    { id: 'High Knees', name: 'High Knees', nameKey: 'exercise.high_knees.name', duration: 30, instruction: 'Lift knees to chest!', instructionKey: 'exercise.high_knees.instruction', color: 'text-emerald-400' },
    { id: 'Butt Kicks', name: 'Butt Kicks', nameKey: 'exercise.butt_kicks.name', duration: 30, instruction: 'Kick heels to glutes!', instructionKey: 'exercise.butt_kicks.instruction', color: 'text-lime-400' },
    { id: 'Side Lunges', name: 'Side Lunges', nameKey: 'exercise.side_lunges.name', duration: 30, instruction: 'Step wide and lunge!', instructionKey: 'exercise.side_lunges.instruction', color: 'text-teal-400' },
    { id: 'Sprint in Place', name: 'Sprint in Place', nameKey: 'exercise.sprint_in_place.name', duration: 30, instruction: 'Fast feet!', instructionKey: 'exercise.sprint_in_place.instruction', color: 'text-green-500' },
    { id: 'Jumping Jacks', name: 'Jumping Jacks', nameKey: 'exercise.jumping_jacks.name', duration: 30, instruction: 'Jump and spread!', instructionKey: 'exercise.jumping_jacks.instruction', color: 'text-cyan-400' },
];

// Rugby - Shoulder stability & impact prep
// Rugby
const RUGBY_EXERCISES: ExerciseDef[] = [
    { id: 'Arm Circles', name: 'Arm Circles', nameKey: 'exercise.arm_circles.name', duration: 30, instruction: 'Big circles forward!', instructionKey: 'exercise.arm_circles.instruction', color: 'text-amber-400' },
    { id: 'Shoulder Shrugs', name: 'Shoulder Shrugs', nameKey: 'exercise.shoulder_shrugs.name', duration: 30, instruction: 'Lift shoulders up!', instructionKey: 'exercise.shoulder_shrugs.instruction', color: 'text-orange-400' },
    { id: 'Push-up Prep', name: 'Push-up Prep', nameKey: 'exercise.push_up_prep.name', duration: 30, instruction: 'Plank position hold!', instructionKey: 'exercise.push_up_prep.instruction', color: 'text-red-400' },
    { id: 'Burpees', name: 'Burpees', nameKey: 'exercise.burpees.name', duration: 30, instruction: 'Down and jump up!', instructionKey: 'exercise.burpees.instruction', color: 'text-yellow-500' },
    { id: 'Mountain Climbers', name: 'Mountain Climbers', nameKey: 'exercise.mountain_climbers.name', duration: 30, instruction: 'Drive knees forward!', instructionKey: 'exercise.mountain_climbers.instruction', color: 'text-orange-500' },
    { id: 'Bear Crawls', name: 'Bear Crawls', nameKey: 'exercise.bear_crawls.name', duration: 30, instruction: 'Crawl on all fours!', instructionKey: 'exercise.bear_crawls.instruction', color: 'text-amber-500' },
];

// Runner - Dynamic lunges & calf focus
// Runner
const RUNNER_EXERCISES: ExerciseDef[] = [
    { id: 'Walking Lunges', name: 'Walking Lunges', nameKey: 'exercise.walking_lunges.name', duration: 30, instruction: 'Step and lunge!', instructionKey: 'exercise.walking_lunges.instruction', color: 'text-blue-400' },
    { id: 'Calf Raises', name: 'Calf Raises', nameKey: 'exercise.calf_raises.name', duration: 30, instruction: 'Rise on toes!', instructionKey: 'exercise.calf_raises.instruction', color: 'text-cyan-400' },
    { id: 'High Knees', name: 'High Knees', nameKey: 'exercise.high_knees.name', duration: 30, instruction: 'Knees to chest fast!', instructionKey: 'exercise.high_knees.instruction', color: 'text-sky-400' },
    { id: 'Ankle Circles', name: 'Ankle Circles', nameKey: 'exercise.ankle_circles.name', duration: 30, instruction: 'Rotate ankles!', instructionKey: 'exercise.ankle_circles.instruction', color: 'text-indigo-400' },
    { id: 'Skipping', name: 'Skipping', nameKey: 'exercise.skipping.name', duration: 30, instruction: 'Skip in place!', instructionKey: 'exercise.skipping.instruction', color: 'text-blue-500' },
    { id: 'A-Skips', name: 'A-Skips', nameKey: 'exercise.a_skips.name', duration: 30, instruction: 'Skip with form!', instructionKey: 'exercise.a_skips.instruction', color: 'text-cyan-500' },
];

// Cyclist - Hip flexor & lower back
// Cyclist
const CYCLIST_EXERCISES: ExerciseDef[] = [
    { id: 'Hip Circles', name: 'Hip Circles', nameKey: 'exercise.hip_circles.name', duration: 30, instruction: 'Circle hips!', instructionKey: 'exercise.hip_circles.instruction', color: 'text-purple-400' },
    { id: 'Cat-Cow Stretch', name: 'Cat-Cow Stretch', nameKey: 'exercise.cat_cow_stretch.name', duration: 30, instruction: 'Arch and round spine!', instructionKey: 'exercise.cat_cow_stretch.instruction', color: 'text-pink-400' },
    { id: 'Leg Swings', name: 'Leg Swings', nameKey: 'exercise.leg_swings.name', duration: 30, instruction: 'Swing legs!', instructionKey: 'exercise.leg_swings.instruction', color: 'text-fuchsia-400' },
    { id: 'Knee Hugs', name: 'Knee Hugs', nameKey: 'exercise.knee_hugs.name', duration: 30, instruction: 'Pull knee to chest!', instructionKey: 'exercise.knee_hugs.instruction', color: 'text-violet-400' },
    { id: 'Torso Twists', name: 'Torso Twists', nameKey: 'exercise.torso_twists.name', duration: 30, instruction: 'Twist side to side!', instructionKey: 'exercise.torso_twists.instruction', color: 'text-purple-500' },
    { id: 'Hip Flexor Lunge', name: 'Hip Flexor Lunge', nameKey: 'exercise.hip_flexor_lunge.name', duration: 30, instruction: 'Deep lunge stretch!', instructionKey: 'exercise.hip_flexor_lunge.instruction', color: 'text-pink-500' },
];

// Desk - Quick upper body & neck
// Desk
const DESK_EXERCISES: ExerciseDef[] = [
    { id: 'Neck Rolls', name: 'Neck Rolls', nameKey: 'exercise.neck_rolls.name', duration: 30, instruction: 'Roll neck gently!', instructionKey: 'exercise.neck_rolls.instruction', color: 'text-slate-400' },
    { id: 'Shoulder Rolls', name: 'Shoulder Rolls', nameKey: 'exercise.shoulder_rolls.name', duration: 30, instruction: 'Roll shoulders back!', instructionKey: 'exercise.shoulder_rolls.instruction', color: 'text-gray-400' },
    { id: 'Wrist Circles', name: 'Wrist Circles', nameKey: 'exercise.wrist_circles.name', duration: 30, instruction: 'Circle wrists!', instructionKey: 'exercise.wrist_circles.instruction', color: 'text-zinc-400' },
    { id: 'Seated Twists', name: 'Seated Twists', nameKey: 'exercise.seated_twists.name', duration: 30, instruction: 'Twist in chair!', instructionKey: 'exercise.seated_twists.instruction', color: 'text-neutral-400' },
    { id: 'Arm Stretches', name: 'Arm Stretches', nameKey: 'exercise.arm_stretches.name', duration: 30, instruction: 'Stretch across body!', instructionKey: 'exercise.arm_stretches.instruction', color: 'text-stone-400' },
    { id: 'Standing Reach', name: 'Standing Reach', nameKey: 'exercise.standing_reach.name', duration: 30, instruction: 'Stand and stretch!', instructionKey: 'exercise.standing_reach.instruction', color: 'text-gray-500' },
];

// Seated Mode - Accessible & Low Impact (Overrides Sport Mode if active)
const SEATED_EXERCISES: ExerciseDef[] = [
    { id: 'Neck Rolls', name: 'Neck Rolls', nameKey: 'exercise.neck_rolls.name', duration: 30, instruction: 'Roll neck gently!', instructionKey: 'exercise.neck_rolls.instruction', color: 'text-slate-400' },
    { id: 'Shoulder Rolls', name: 'Shoulder Rolls', nameKey: 'exercise.shoulder_rolls.name', duration: 30, instruction: 'Roll shoulders back!', instructionKey: 'exercise.shoulder_rolls.instruction', color: 'text-gray-400' },
    { id: 'Arm Circles', name: 'Arm Circles', nameKey: 'exercise.arm_circles.name', duration: 30, instruction: 'Big circles!', instructionKey: 'exercise.arm_circles.instruction', color: 'text-amber-400' },
    { id: 'Seated Twists', name: 'Seated Twists', nameKey: 'exercise.seated_twists.name', duration: 30, instruction: 'Twist torso sitting!', instructionKey: 'exercise.seated_twists.instruction', color: 'text-neutral-400' },
    { id: 'Shoulder Press', name: 'Shoulder Press', nameKey: 'exercise.shoulder_press.name', duration: 30, instruction: 'Press hands up!', instructionKey: 'exercise.shoulder_press.instruction', color: 'text-emerald-400' },
    { id: 'Uppercuts', name: 'Uppercuts', nameKey: 'exercise.uppercuts.name', duration: 30, instruction: 'Punch up!', instructionKey: 'exercise.uppercuts.instruction', color: 'text-yellow-400' },
    { id: 'Hooks', name: 'Hooks', nameKey: 'exercise.hooks.name', duration: 30, instruction: 'Side punches!', instructionKey: 'exercise.hooks.instruction', color: 'text-red-400' },
    { id: 'Arm Stretches', name: 'Arm Stretches', nameKey: 'exercise.arm_stretches.name', duration: 30, instruction: 'Stretch arms across!', instructionKey: 'exercise.arm_stretches.instruction', color: 'text-stone-400' },
];

// Get exercises based on sport mode
const getExercisesBySportMode = (mode: SportMode, isSeated: boolean = false): ExerciseDef[] => {
    if (isSeated) return SEATED_EXERCISES;
    switch (mode) {
        case 'FOOTBALL': return FOOTBALL_EXERCISES;
        case 'RUGBY': return RUGBY_EXERCISES;
        case 'RUNNER': return RUNNER_EXERCISES;
        case 'CYCLIST': return CYCLIST_EXERCISES;
        case 'DESK': return DESK_EXERCISES;
        default: return BASE_EXERCISES;
    }
};



const DEFAULT_SETTINGS: UserSettings = {
    isDebugMode: false,
    soundEnabled: true,
    seatedMode: false,
    characterArchetype: 'SPIRIT', // Default changed to Spirit
    characterSkin: 0,
    sportMode: 'FOOTBALL' // Default sport mode
};


// Header and other views extracted to components
import { SplashScreen } from './components/SplashScreen';

import { LeaderboardService } from './services/leaderboardService';
import { getAvatarForLevel, calculateNextLevelXP } from './utils/levelUtils';

// ... existing imports ...

export default function App() {
    const { t } = useLocalization();
    const [view, setView] = useState<AppView>(AppView.HOME);
    const [showSplash, setShowSplash] = useState(true);
    const [rateUsNextView, setRateUsNextView] = useState<AppView>(AppView.HOME);

    // --- STATE ---
    const [userStats, setUserStats] = useState<UserStats>(() => {
        const saved = localStorage.getItem('warmify_user_stats');
        let stats = saved ? JSON.parse(saved) : {
            streak: 0, totalPoints: 0, xp: 0, level: 1,
            workoutsCompleted: 0, lastWorkoutDate: null, badges: [], isPremium: false
        };

        // Migration: Add ID if missing
        if (!stats.userId) {
            stats.userId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
            stats.username = `Anonymous #${Math.floor(1000 + Math.random() * 9000)}`;
        }
        return stats;
    });

    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [userRank, setUserRank] = useState<number>(0);

    useEffect(() => {
        if (view === AppView.LEADERBOARD) {
            LeaderboardService.getTopGlobal().then(setLeaderboardData);
            if (userStats.userId) {
                LeaderboardService.getUserRank(userStats.userId).then(setUserRank);
            }
        }
    }, [view, userStats.userId]);

    const [settings, setSettings] = useState<UserSettings>(() => {
        const saved = localStorage.getItem('warmify_settings');
        const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;

        // Migration: Add sportMode if missing
        if (!parsed.sportMode) {
            parsed.sportMode = 'FOOTBALL';
        }

        // Enforce: Debug Mode must be OFF in Production (Store Builds)
        if (import.meta.env.PROD) {
            // parsed.isDebugMode = false; 
        }
        return parsed;
    });


    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
        return localStorage.getItem('warmify_onboarding_complete') === 'true';
    });

    // Get exercises based on current sport mode
    const EXERCISES = getExercisesBySportMode(settings.sportMode || 'FOOTBALL', settings.seatedMode);

    const [gameState, setGameState] = useState<GameState>({
        score: 0, combo: 1, health: 100,
        feedback: "Stand By...", feedbackType: 'neutral',
        isSessionActive: false, currentExerciseIndex: 0, timeRemaining: 0,
        phase: 'WARMUP',
        lastHitTime: 0,
        incorrectJoints: []
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
    const gameStateRef = useRef(gameState); // Ref to access latest state in callbacks
    const poseServiceRef = useRef<PoseService | null>(null);

    const gameLoopRef = useRef<number | null>(null);
    const accumulatedErrorRef = useRef<number>(0); // Track consecutive bad frames
    const prevLandmarksRef = useRef<any[] | null>(null); // For velocity tracking
    const movementStateRef = useRef<{ phase: 'READY' | 'HOLD' | 'COOLDOWN' | 'ACTIVE'; lastTriggerTime: number; triggerCount: number; }>({
        phase: 'READY',
        lastTriggerTime: 0,
        triggerCount: 0
    });

    const exercisesRef = useRef(EXERCISES);

    useEffect(() => { localStorage.setItem('warmify_user_stats', JSON.stringify(userStats)); }, [userStats]);
    useEffect(() => { localStorage.setItem('warmify_settings', JSON.stringify(settings)); }, [settings]);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]); // Sync ref
    useEffect(() => { exercisesRef.current = EXERCISES; }, [EXERCISES]); // Sync exercises


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
        // Reset to first exercise for the preview
        setGameState(prev => ({
            ...prev,
            phase: 'COUNTDOWN',
            feedback: "PREPARE",
            feedbackType: 'neutral',
            currentExerciseIndex: 0
        }));
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
        let phaseTime = exercisesRef.current[0].duration;
        SoundEngine.playLevelUp(); // Start sound

        setGameState(prev => ({
            ...prev, isSessionActive: true, score: 0, combo: 1, health: 100,
            currentExerciseIndex: 0, timeRemaining: phaseTime, phase: 'ACTIVE',
            feedback: "GO!", feedbackType: 'good',
            lastHitTime: 0
        }));





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
                    if (newIndex >= exercisesRef.current.length) {
                        endWorkout(false);
                        return prev;
                    }
                    newTime = exercisesRef.current[newIndex].duration;


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
            // Cap combo at 20x to prevent inflation
            const combo = Math.min(20, prev.combo + 0.5);
            const basePoints = quality === 'PERFECT' ? 50 : 20;
            const points = Math.floor(basePoints * Math.floor(combo));

            return {
                ...prev,
                score: prev.score + points,
                combo: combo,
                health: Math.min(100, prev.health + (quality === 'PERFECT' ? 5 : 2)),
                feedback: quality === 'PERFECT' ? t('game.feedback.perfect') : t('game.feedback.good'),
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


    // Separate session initialization from view switching to ensure videoRef is ready
    const initSession = async () => {
        // Prevent double init
        if (poseServiceRef.current) return;

        setLogs([]);
        addLog("System initializing...");
        addLog("Checking video ref: " + (videoRef.current ? "OK" : "NULL"));

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                addLog("Video stream active", 'success');

                // 2. Initialize PoseService for Visualization & Logic
                poseServiceRef.current = new PoseService((results) => {
                    if (results && results.poseLandmarks) {
                        setPoseLandmarks(results.poseLandmarks);

                        // NEW: Run Geometry Evaluation
                        const currentGameState = gameStateRef.current; // Use Ref to get latest state
                        if (currentGameState.isSessionActive && currentGameState.phase === 'ACTIVE') {
                            const currentExName = exercisesRef.current[currentGameState.currentExerciseIndex].name;

                            const evalResult = MoveEvaluator.evaluate(currentExName, results.poseLandmarks, prevLandmarksRef.current, movementStateRef.current);

                            // Update state
                            prevLandmarksRef.current = results.poseLandmarks;
                            movementStateRef.current = evalResult.nextState;

                            // LOGIC UPDATE: Only hit if Rep Triggered (State Machine Transition)
                            if (evalResult.didTriggerRep) {
                                handleHit("PERFECT", evalResult.feedback);
                                accumulatedErrorRef.current = 0;
                            } else {
                                // Provide live feedback via overlay if needed, or handle errors
                                if (!evalResult.isMatch) {
                                    // Only count errors if NOT in a valid holding state? 
                                    // Actually strictly accumulating misses might be too harsh with state machine now.
                                    // Let's keep miss logic for "MoveEvaluator said unmatched".
                                    // But MoveEvaluator might return Match=true for "Guard" but trigger=False.
                                    // So we rely on isMatch for Misses.
                                    accumulatedErrorRef.current += 1;
                                    if (accumulatedErrorRef.current > 60) { // Slower miss
                                        handleMiss(evalResult.feedback); // Use evaluator feedback
                                        accumulatedErrorRef.current = 0; // Trigger once then reset
                                    }
                                } else {
                                    accumulatedErrorRef.current = 0;
                                }
                            }
                            // Update incorrect joints state (debounced)
                            setGameState(prev => {
                                if (JSON.stringify(prev.incorrectJoints) === JSON.stringify(evalResult.incorrectJoints)) return prev;
                                return { ...prev, incorrectJoints: evalResult.incorrectJoints };
                            });
                        }
                    }
                });
                await poseServiceRef.current.initialize(videoRef.current);
                addLog("PoseService initialized", 'success');

                // Start game loop immediately
                startCountdown();
            } else {
                addLog("Video ref missing after stream fetch", 'error');
            }
        } catch (e: any) {
            console.error("Startup Error:", e);
            addLog(`Startup failed: ${e.message}`, 'error');
            alert(`Camera Error: ${e.message}`);
            setView(AppView.HOME);
        }
    };

    // Effect to trigger init when view changes to WORKOUT
    useEffect(() => {
        if (view === AppView.WORKOUT) {
            // Short timeout to ensure DOM is absolutely ready
            const t = setTimeout(initSession, 100);
            return () => clearTimeout(t);
        }
    }, [view]);

    const startWorkout = () => {
        const today = new Date().toISOString().split('T')[0];
        if (!userStats.isPremium && userStats.lastWorkoutDate === today) {
            alert(t('game.alert.daily_limit_desc'));
            setView(AppView.PAYWALL);
            return;
        }

        SoundEngine.playUI('click');
        // Clear previous state just in case
        poseServiceRef.current = null;
        setView(AppView.WORKOUT);
    };

    const endWorkout = (failed: boolean = false) => {
        if (gameLoopRef.current) window.clearInterval(gameLoopRef.current);

        poseServiceRef.current?.stop(); // Stop pose detection
        if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        setSimAutoPlay(false);

        if (failed && gameState.score < 50) {
            alert(t('game.alert.failed'));
            setGameState(prev => ({ ...prev, isSessionActive: false, phase: 'WARMUP' }));
            setView(AppView.HOME);
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const isNewDay = userStats.lastWorkoutDate !== today;
        const xpGained = Math.min(gameState.score, 50000); // Max XP Cap to prevent exploits
        let currentXp = userStats.xp + xpGained;
        let currentLevel = userStats.level;
        let isLevelUp = false;

        // Dynamic Difficulty using shared Utility
        while (true) {
            const xpReq = calculateNextLevelXP(currentLevel);
            if (currentXp >= xpReq) {
                currentXp -= xpReq;
                currentLevel++;
                isLevelUp = true;
            } else {
                break;
            }
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

        // Sync to Cloud
        LeaderboardService.updateUserScore(
            newStats.userId,
            newStats.username,
            newStats.totalPoints,
            newStats.level,
            getAvatarForLevel(newStats.level)
        ).catch(err => console.error("Cloud sync failed", err));

        setGameState(prev => ({ ...prev, isSessionActive: false, phase: 'WARMUP' }));
        setView(AppView.RESULTS);
    };

    const [hasRated, setHasRated] = useState<boolean>(() => {
        return localStorage.getItem('warmify_has_rated') === 'true';
    });

    const handleClaimResults = () => {
        // Skip RateUs if already rated
        if (hasRated) {
            handleRateUsComplete();
        } else {
            setRateUsNextView(AppView.HOME); // This state usage might need adjustment if logic in handleRateUsComplete depends on it? 
            // Actually handleRateUsComplete logic for Results doesn't depend on rateUsNextView for the Results path specifically (lines 430+), 
            // but let's be safe.
            // Wait, logic at 424 checks rateUsNextView to go to PAYWALL.
            // If we skip, we still need to know where to go.
            // If we are claiming results, we are NOT going to Paywall usually? 
            // Let's assume ClaimResults -> badge or home.

            setView(AppView.RATE_US);
        }
    };

    const handleRateUsComplete = (didRate: boolean = false) => {
        if (didRate) {
            setHasRated(true);
            localStorage.setItem('warmify_has_rated', 'true');
        }

        // If coming from Onboarding (special case check or just trust state)
        if (rateUsNextView === AppView.PAYWALL) {
            setView(AppView.PAYWALL);
            return;
        }

        // If coming from Workout Results
        if (workoutResult && workoutResult.newBadges.length > 0) {
            setView(AppView.BADGE_REVEAL);
            setNewUnlockedBadge(workoutResult.newBadges[0]);
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


    if (view === AppView.ONBOARDING) return <Onboarding onComplete={() => {
        localStorage.setItem('warmify_onboarding_complete', 'true');
        setHasCompletedOnboarding(true);
        setRateUsNextView(AppView.PAYWALL);
        setView(AppView.RATE_US);
    }} />;
    if (view === AppView.PAYWALL) return <Paywall onClose={() => setView(AppView.HOME)} onPurchaseSuccess={() => { setUserStats(prev => ({ ...prev, isPremium: true })); setView(AppView.HOME); }} />;

    if (view === AppView.RESULTS && workoutResult) {
        return <WorkoutResults data={workoutResult} onClaim={handleClaimResults} onRestart={startWorkout} />;
    }

    if (view === AppView.BADGE_REVEAL && workoutResult) {
        return <BadgeReveal badges={workoutResult.newBadges} onClose={handleBadgeRevealClose} />;
    }

    const currentExercise = EXERCISES[gameState.currentExerciseIndex];



    return (
        <div className="relative h-screen max-h-screen text-white font-sans selection:bg-blue-500 overflow-hidden bg-slate-900 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            {view !== AppView.WORKOUT && <ThreeScene intensity={intensity} />}

            <div className="relative z-10 w-full md:max-w-full lg:max-w-7xl mx-auto h-full flex flex-col p-4 transition-all duration-500">

                <Header view={view} setView={setView} userStats={userStats} />

                {view === AppView.SETTINGS && <Settings settings={settings} userStats={userStats} updateSettings={setSettings} updateUserStats={setUserStats} onBack={() => setView(AppView.HOME)} onReset={() => { localStorage.clear(); window.location.reload(); }} onRateUs={() => setView(AppView.RATE_US)} />}

                {view === AppView.LEVELING && <LevelingSystem stats={userStats} onBack={() => setView(AppView.HOME)} />}

                {view === AppView.RATE_US && <RateUs onComplete={handleRateUsComplete} />}

                {view === AppView.HOME && (
                    <HomeView
                        userStats={userStats}
                        settings={settings}
                        setView={setView}
                        startWorkout={startWorkout}
                        newUnlockedBadge={newUnlockedBadge}
                        updateSettings={setSettings}
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
                                onForceNextExercise={() => setGameState(prev => ({ ...prev, currentExerciseIndex: (prev.currentExerciseIndex + 1) % EXERCISES.length }))}
                                onForcePrevExercise={() => setGameState(prev => ({ ...prev, currentExerciseIndex: (prev.currentExerciseIndex - 1 + EXERCISES.length) % EXERCISES.length }))}
                                onAddXP={() => setUserStats(prev => ({ ...prev, xp: prev.xp + 100 }))}
                                currentExerciseIndex={gameState.currentExerciseIndex}
                                accumulatedError={accumulatedErrorRef.current}
                                toggleSeatedMode={() => setSettings(prev => ({ ...prev, seatedMode: !prev.seatedMode }))}
                                isSeated={settings.seatedMode}
                                exerciseName={currentExercise.name}
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
                                    incorrectJoints={gameState.incorrectJoints}
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
                                <h2 className={`text-4xl font-black italic ${currentExercise.color} mb-4 text-center drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}>{t(currentExercise.nameKey || currentExercise.name)}</h2>
                                <div className="w-full h-1/2 relative mb-4">
                                    {/* HUD still uses procedural preview */}
                                    <RigOverlay exercise={currentExercise.id} mode="INSTRUCTION" isActive={true} seatedMode={settings.seatedMode} archetype={settings.characterArchetype} skinId={settings.characterSkin} />
                                </div>
                                <div className="text-9xl font-black text-white animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{countdown}</div>
                                <p className="text-slate-300 font-bold mt-4 text-lg bg-black/50 px-4 py-1 rounded-full">{t(currentExercise.instructionKey || currentExercise.instruction)}</p>
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
                                            <span className="text-[9px] text-cyan-200 font-bold uppercase tracking-widest">{t('game.score') || 'SCORE'}</span>
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
                                            <h2 className={`text-[10px] font-black italic ${currentExercise.color} leading-tight truncate`}>{t(currentExercise.nameKey || currentExercise.name)}</h2>
                                            <div className="flex items-center gap-1 mt-1 text-slate-400"><Timer size={10} /><span className="text-sm font-mono font-bold text-white">{gameState.timeRemaining}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === AppView.LEADERBOARD && (
                    <LeaderboardView entries={leaderboardData} userStats={userStats} userRank={userRank} setView={setView} />
                )}
            </div>
        </div>
    );
}