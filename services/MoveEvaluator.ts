// import { PoseLandmark } from '@mediapipe/pose';

// --------------------------------------------------------------------------
// 1. TYPES & STATE DEFINITIONS
// --------------------------------------------------------------------------

// MediaPipe Body 33 Keypoints Reference:
// 0=Nose, 11=L_Shoulder, 12=R_Shoulder, 13=L_Elbow, 14=R_Elbow, 15=L_Wrist, 16=R_Wrist
// 23=L_Hip, 24=R_Hip, 25=L_Knee, 26=R_Knee, 27=L_Ankle, 28=R_Ankle

export interface MovementState {
    phase: 'READY' | 'HOLD' | 'COOLDOWN' | 'ACTIVE';
    lastTriggerTime: number;
    triggerCount: number;
}

export interface EvaluationResult {
    score: number; // 0-100
    feedback: string;
    incorrectJoints: string[]; // List of joint names to color RED
    isMatch: boolean;
    didTriggerRep: boolean; // TRUE only when a full rep completes
    nextState: MovementState;
}

type EvaluatorFunction = (lm: any[], prevLm: any[] | null, state: MovementState) => EvaluationResult;

// --------------------------------------------------------------------------
// 2. CORE UTILITIES (Math & Physics)
// --------------------------------------------------------------------------

const Utils = {
    // Calculate 2D angle between three points (A, B, C)
    calculateAngle: (a: any, b: any, c: any): number => {
        if (!a || !b || !c) return 0;
        const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
        let angle = Math.abs((radians * 180.0) / Math.PI);
        if (angle > 180.0) angle = 360 - angle;
        return angle;
    },

    // Check visibility of specific landmarks
    checkVisibility: (landmarks: any[], indices: number[], threshold: number = 0.60): boolean => {
        return indices.every(idx => landmarks[idx] && landmarks[idx].visibility > threshold);
    },

    // Calculate average velocity of specific joints
    getVelocity: (cur: any[], prev: any[] | null | undefined, indices: number[]): number => {
        if (!prev) return 0;
        let totalVel = 0;
        indices.forEach(idx => {
            totalVel += Math.abs(cur[idx].x - prev[idx].x) + Math.abs(cur[idx].y - prev[idx].y);
        });
        return (totalVel / indices.length) * 100; // Scaled for easier thresholding
    },

    // Check if hands are above head
    areHandsAboveHead: (lm: any[]): boolean => {
        return lm[15].y < lm[0].y && lm[16].y < lm[0].y;
    }
};

// --------------------------------------------------------------------------
// 3. LOGIC FACTORIES (The "Brain" 🧠)
// --------------------------------------------------------------------------

const LogicBuilders = {
    /**
     * Creates an evaluator for high-intensity, velocity-based movements (e.g., High Knees, Punching).
     */
    velocityRep: (config: {
        joints: number[];
        threshold: number;
        prompts: { active: string; idle: string };
        cooldownMs?: number;
    }): EvaluatorFunction => {
        return (lm, prevLm, state) => {
            const now = Date.now();
            const velocity = Utils.getVelocity(lm, prevLm, config.joints);
            const isMoving = velocity > config.threshold;

            let nextState = { ...state };
            let didTriggerRep = false;
            let feedback = config.prompts.idle;

            // Trigger Cooldown logic
            if (now - state.lastTriggerTime > (config.cooldownMs || 500)) {
                if (isMoving) {
                    didTriggerRep = true;
                    nextState.lastTriggerTime = now;
                    feedback = config.prompts.active;
                }
            } else {
                // During cooldown, show active feedback if still moving
                if (isMoving) feedback = config.prompts.active;
            }

            return {
                score: isMoving ? 100 : 40,
                isMatch: isMoving,
                feedback,
                incorrectJoints: [], // Could add joint tracking here
                didTriggerRep,
                nextState
            };
        };
    },

    /**
     * Creates an evaluator for pose-based repetitions (e.g., Squats, Overhead Reach).
     * Uses a simple state machine: READY -> HOLD/ACTIVE -> COOLDOWN
     */
    poseRep: (config: {
        checkStartCondition: (lm: any[]) => boolean; // Is user in "Ready" pos?
        checkActiveCondition: (lm: any[]) => boolean; // Is user in "Rep" pos?
        prompts: { ready: string; active: string; hold?: string };
        holdTimeMs?: number;
    }): EvaluatorFunction => {
        return (lm, _, state) => {
            const now = Date.now();
            const inActivePos = config.checkActiveCondition(lm);
            const inReadyPos = config.checkStartCondition(lm);

            let nextState = { ...state };
            let didTriggerRep = false;
            let feedback = config.prompts.ready;
            let score = 50;

            if (state.phase === 'READY') {
                if (inActivePos) {
                    nextState.phase = 'ACTIVE';
                    nextState.lastTriggerTime = now;
                    didTriggerRep = true;
                    feedback = config.prompts.active;
                    score = 100;
                }
            } else if (state.phase === 'ACTIVE') {
                feedback = config.prompts.active;
                score = 100;
                if (now - state.lastTriggerTime > 400 && !inActivePos) {
                    nextState.phase = 'COOLDOWN';
                }
            } else if (state.phase === 'COOLDOWN') {
                score = 80;
                if (inReadyPos || (now - state.lastTriggerTime > 800)) {
                    nextState.phase = 'READY';
                    feedback = config.prompts.ready;
                }
            }

            return {
                score,
                isMatch: inActivePos,
                feedback,
                incorrectJoints: [],
                didTriggerRep,
                nextState
            };
        };
    },

    /**
     * Creates an evaluator purely based on geometric angle checks (e.g. Elbow flexion).
     */
    angleCheck: (config: {
        points: [number, number, number]; // [A, B, C] for angle B
        minAngle?: number;
        maxAngle?: number;
        prompts: { success: string; fail: string };
    }): EvaluatorFunction => {
        return (lm, _, state) => {
            const angle = Utils.calculateAngle(lm[config.points[0]], lm[config.points[1]], lm[config.points[2]]);
            const isValid = (!config.minAngle || angle >= config.minAngle) && (!config.maxAngle || angle <= config.maxAngle);

            return {
                score: isValid ? 100 : 30,
                isMatch: isValid,
                feedback: isValid ? config.prompts.success : config.prompts.fail,
                incorrectJoints: isValid ? [] : ['joint'],
                didTriggerRep: false, // Angles usually don't trigger reps on their own, usually part of velocity
                nextState: state
            };
        };
    }
};

// --------------------------------------------------------------------------
// 4. EXERCISE LIBRARY (The "Database" 📂)
// --------------------------------------------------------------------------

const ExerciseLibrary: Record<string, EvaluatorFunction> = {
    // --- GENERAL ---
    'Freestyle': (lm, prevLm, state) => ({ score: 100, isMatch: true, feedback: "Keep Moving!", incorrectJoints: [], didTriggerRep: false, nextState: state }),

    // --- UPPER BODY ---
    'Overhead Reach': LogicBuilders.poseRep({
        checkStartCondition: (lm) => lm[15].y > lm[11].y, // Hands below shoulders
        checkActiveCondition: (lm) => Utils.areHandsAboveHead(lm) && Utils.calculateAngle(lm[11], 13, 15) > 150, // Hands up + straight arms
        prompts: { ready: "Lower Arms", active: "PERFECT REACH!" }
    }),

    'T-Pose Pulses': LogicBuilders.velocityRep({
        joints: [11, 12, 13, 14], threshold: 1.0,
        prompts: { idle: "Arms Out!", active: "PULSE!" }
    }),

    'Hooks': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 2.0,
        prompts: { idle: "Guard Up", active: "HOOK!" }
    }),

    'Uppercuts': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 2.0,
        prompts: { idle: "Hands Low", active: "POWER!" }
    }),

    'Shoulder Press': LogicBuilders.poseRep({
        checkStartCondition: (lm) => lm[15].y > lm[0].y, // Hands below nose
        checkActiveCondition: (lm) => Utils.areHandsAboveHead(lm),
        prompts: { ready: "Push Up", active: "PRESSED!" }
    }),

    'Shadow Box': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 4.5,
        prompts: { idle: "Punch!", active: "NICE COMBO!" }
    }),

    // --- FOOTBALL (Soccer) ⚽ ---
    'Leg Swings': LogicBuilders.velocityRep({
        joints: [25, 26, 27, 28], threshold: 3.0,
        prompts: { idle: "Swing Leg", active: "Good Swing!" }
    }),
    'High Knees': LogicBuilders.velocityRep({
        joints: [25, 26], threshold: 4.0,
        prompts: { idle: "Knees Up!", active: "Keep it up!" }
    }),
    'Butt Kicks': LogicBuilders.velocityRep({
        joints: [27, 28], threshold: 4.0,
        prompts: { idle: "Heels to Glutes", active: "Kick!" }
    }),
    'Side Lunges': LogicBuilders.velocityRep({
        joints: [23, 24, 25, 26], threshold: 2.5,
        prompts: { idle: "Step Side", active: "Lunge!" }
    }),
    'Sprint in Place': LogicBuilders.velocityRep({
        joints: [25, 26], threshold: 5.0,
        prompts: { idle: "Run!", active: "FASTER!" }
    }),
    'Jumping Jacks': LogicBuilders.poseRep({
        checkStartCondition: (lm) => !Utils.areHandsAboveHead(lm),
        checkActiveCondition: (lm) => Utils.areHandsAboveHead(lm) && Math.abs(lm[27].x - lm[28].x) > 0.4,
        prompts: { ready: "Hands Down", active: "JUMP!" }
    }),

    // --- RUGBY 🏆 ---
    'Arm Circles': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 3.0,
        prompts: { idle: "Circle Arms", active: "Rotate!" }
    }),
    'Shoulder Shrugs': LogicBuilders.velocityRep({
        joints: [11, 12], threshold: 1.5,
        prompts: { idle: "Shrug", active: "Squeeze!" }
    }),
    'Push-up Prep': LogicBuilders.poseRep({ // Plank hold logic
        checkStartCondition: (lm) => false, // Always active if in pos
        checkActiveCondition: (lm) => lm[11].y < lm[25].y, // Shoulders above hips/knees roughly
        prompts: { ready: "Get in Plank", active: "HOLD STRONG!" }
    }),
    'Burpees': LogicBuilders.velocityRep({
        joints: [0, 11, 23], threshold: 6.0,
        prompts: { idle: "Down & Up", active: "EXPLODE!" }
    }),
    'Mountain Climbers': LogicBuilders.velocityRep({
        joints: [25, 26], threshold: 4.5,
        prompts: { idle: "Drive Knees", active: "CLIMB!" }
    }),
    'Bear Crawls': LogicBuilders.velocityRep({
        joints: [15, 16, 27, 28], threshold: 3.0,
        prompts: { idle: "Crawl", active: "Move!" }
    }),

    // --- RUNNER 🏃 ---
    'Walking Lunges': LogicBuilders.velocityRep({
        joints: [25, 26, 23, 24], threshold: 2.5,
        prompts: { idle: "Step Forward", active: "Deep Lunge!" }
    }),
    'Calf Raises': LogicBuilders.velocityRep({
        joints: [27, 28], threshold: 1.0,
        prompts: { idle: "Up on Toes", active: "Squeeze!" }
    }),
    'Ankle Circles': LogicBuilders.velocityRep({
        joints: [27, 28], threshold: 1.5,
        prompts: { idle: "Rotate Ankle", active: "Good Rotation" }
    }),
    'Skipping': LogicBuilders.velocityRep({
        joints: [27, 28], threshold: 3.0,
        prompts: { idle: "Skip!", active: "Hop!" }
    }),
    'A-Skips': LogicBuilders.velocityRep({
        joints: [25, 26], threshold: 3.5,
        prompts: { idle: "Knee Drive", active: "Skip!" }
    }),

    // --- CYCLIST 🚴 ---
    'Hip Circles': LogicBuilders.velocityRep({
        joints: [23, 24], threshold: 2.0,
        prompts: { idle: "Circle Hips", active: "Loosen Up" }
    }),
    'Cat-Cow Stretch': LogicBuilders.velocityRep({
        joints: [11, 12, 23, 24], threshold: 1.5,
        prompts: { idle: "Arch & Round", active: "Stretch!" }
    }),
    'Knee Hugs': LogicBuilders.poseRep({
        checkStartCondition: (lm) => lm[25].y > lm[23].y,
        checkActiveCondition: (lm) => lm[25].y < lm[23].y || lm[26].y < lm[24].y, // Knee above hip
        prompts: { ready: "Stand Tall", active: "HUG KNEE!" }
    }),
    'Torso Twists': LogicBuilders.velocityRep({
        joints: [11, 12], threshold: 2.5,
        prompts: { idle: "Twist", active: "Look Back!" }
    }),
    'Hip Flexor Lunge': LogicBuilders.poseRep({
        checkStartCondition: (lm) => Math.abs(lm[27].x - lm[28].x) < 0.2,
        checkActiveCondition: (lm) => Math.abs(lm[27].x - lm[28].x) > 0.4,
        prompts: { ready: "Step Back", active: "Feel Stretch" }
    }),

    // --- DESK 💼 ---
    'Neck Rolls': LogicBuilders.velocityRep({
        joints: [0], threshold: 1.0,
        prompts: { idle: "Roll Neck", active: "Gently..." }
    }),
    'Shoulder Rolls': LogicBuilders.velocityRep({
        joints: [11, 12], threshold: 1.5,
        prompts: { idle: "Roll Shoulders", active: "Relax..." }
    }),
    'Wrist Circles': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 1.5,
        prompts: { idle: "Circle Wrists", active: "Loosen..." }
    }),
    'Seated Twists': LogicBuilders.velocityRep({
        joints: [11, 12], threshold: 2.0,
        prompts: { idle: "Twist in Chair", active: "Turn!" }
    }),
    'Arm Stretches': LogicBuilders.poseRep({
        checkStartCondition: (lm) => true,
        checkActiveCondition: (lm) => Math.abs(lm[15].x - lm[12].x) < 0.1 || Math.abs(lm[16].x - lm[11].x) < 0.1, // Hand crossing body
        prompts: { ready: "Reach Across", active: "Stretch!" }
    }),
    'Standing Reach': LogicBuilders.poseRep({ // Alias for Overhead
        checkStartCondition: (lm) => lm[15].y > lm[11].y,
        checkActiveCondition: (lm) => Utils.areHandsAboveHead(lm),
        prompts: { ready: "Reach Up", active: "STRETCH!" }
    }),
};

// --------------------------------------------------------------------------
// 5. MAIN EVALUATOR CLASS
// --------------------------------------------------------------------------

export class MoveEvaluator {
    static evaluate(exerciseName: string, landmarks: any[], prevLandmarks: any[] | null, currentState: MovementState): EvaluationResult {
        // 1. Basic Validation
        if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "No Pose Detected", incorrectJoints: [], isMatch: false, didTriggerRep: false, nextState: currentState };
        }

        // 2. Visibility Check (Upper Body is mandatory)
        if (!Utils.checkVisibility(landmarks, [11, 12, 13, 14], 0.5)) {
            return {
                score: 0,
                feedback: "Make sure your upper body is visible!",
                incorrectJoints: [],
                isMatch: false,
                didTriggerRep: false,
                nextState: currentState
            };
        }

        // 3. Evaluate Logic
        // Fallback to velocity rep if specific logic not found, or Freestyle
        const evaluator = ExerciseLibrary[exerciseName] || ExerciseLibrary['Freestyle'];
        return evaluator(landmarks, prevLandmarks, currentState);
    }
}
