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

    // Check if hands are above head (Y increases downwards)
    areHandsAboveHead: (lm: any[]): boolean => {
        return lm[15].y < lm[0].y && lm[16].y < lm[0].y;
    },

    // Check if hands are above shoulders
    areHandsAboveShoulders: (lm: any[]): boolean => {
        return lm[15].y < lm[11].y && lm[16].y < lm[12].y;
    }
};

// --------------------------------------------------------------------------
// 3. LOGIC FACTORIES (The "Brain" 🧠)
// --------------------------------------------------------------------------

const LogicBuilders = {
    /**
     * Creates an evaluator for high-intensity, velocity-based movements (e.g., High Knees, Punching).
     * NOW WITH FORM VALIDATION!
     */
    velocityRep: (config: {
        joints: number[];
        threshold: number;
        prompts: { active: string; idle: string; wrongForm?: string };
        cooldownMs?: number;
        validatePose?: (lm: any[]) => boolean; // New mandatory check
    }): EvaluatorFunction => {
        return (lm, prevLm, state) => {
            const now = Date.now();
            const velocity = Utils.getVelocity(lm, prevLm, config.joints);
            const isMoving = velocity > config.threshold;

            // Validate Form
            let isValidForm = true;
            if (config.validatePose) {
                isValidForm = config.validatePose(lm);
            }

            let nextState = { ...state };
            let didTriggerRep = false;
            let feedback = config.prompts.idle;
            let score = 0;
            let incorrectJoints: string[] = [];

            if (isMoving) {
                if (isValidForm) {
                    score = 100;
                    feedback = config.prompts.active;

                    if (now - state.lastTriggerTime > (config.cooldownMs || 500)) {
                        didTriggerRep = true;
                        nextState.lastTriggerTime = now;
                    }
                } else {
                    score = 40; // Penalty for bad form
                    feedback = config.prompts.wrongForm || "Check Your Form!";
                    incorrectJoints = ['body']; // Generic highlight
                }
            } else {
                // Not moving enough
                score = 0;
                feedback = config.prompts.idle;
            }

            return {
                score,
                isMatch: isMoving && isValidForm,
                feedback,
                incorrectJoints,
                didTriggerRep,
                nextState
            };
        };
    },

    /**
     * Creates an evaluator for pose-based repetitions (e.g., Squats, Overhead Reach).
     */
    poseRep: (config: {
        checkStartCondition: (lm: any[]) => boolean;
        checkActiveCondition: (lm: any[]) => boolean;
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
            let score = 30; // Base score for just being there

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
                score = 70;
                if (inReadyPos || (now - state.lastTriggerTime > 800)) {
                    nextState.phase = 'READY';
                    feedback = config.prompts.ready;
                }
            }

            // Always show active feedback if in active pos, regardless of phase
            if (inActivePos) feedback = config.prompts.active;

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

    // Generic Freestyle for unmapped exercises
    freestyle: (): EvaluatorFunction => (lm, prev, state) => {
        const vel = Utils.getVelocity(lm, prev, [15, 16, 27, 28]);
        return {
            score: vel > 2 ? 100 : 50,
            isMatch: true,
            feedback: vel > 2 ? "Great Energy!" : "Keep Moving!",
            incorrectJoints: [],
            didTriggerRep: false,
            nextState: state
        };
    }
};

// --------------------------------------------------------------------------
// 4. EXERCISE LIBRARY (The "Database" 📂)
// --------------------------------------------------------------------------

// Helper to get knee/hip Y difference
const getHipKneeDiff = (lm: any[]) => {
    // Avg Hip Y - Avg Knee Y. (Y increases down).
    // If Knee is higher (smaller Y) than hip, result is positive.
    const hipY = (lm[23].y + lm[24].y) / 2;
    const kneeY = (lm[25].y + lm[26].y) / 2;
    return hipY - kneeY;
};

const ExerciseLibrary: Record<string, EvaluatorFunction> = {
    // --- GENERAL ---
    'Freestyle': LogicBuilders.freestyle(),

    // --- UPPER BODY ---
    'Overhead Reach': LogicBuilders.poseRep({
        checkStartCondition: (lm) => !Utils.areHandsAboveShoulders(lm),
        checkActiveCondition: (lm) => Utils.areHandsAboveHead(lm) && Utils.calculateAngle(lm[11], lm[13], lm[15]) > 140,
        prompts: { ready: "Lower Arms", active: "REACH HIGH!" }
    }),

    'T-Pose Pulses': LogicBuilders.velocityRep({
        joints: [11, 12, 13, 14], threshold: 1.0,
        prompts: { idle: "Arms Out!", active: "PULSE!" },
        validatePose: (lm) => Math.abs(lm[13].y - lm[11].y) < 0.2 // Elbows near shoulder height
    }),

    'Hooks': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 2.5,
        prompts: { idle: "Guard Up", active: "HOOK!" },
        validatePose: (lm) => Utils.areHandsAboveShoulders(lm) // Hands must be up
    }),

    'Uppercuts': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 2.5,
        prompts: { idle: "Hands Low", active: "POWER!" },
        // Uppercut needs elbow bend < 90?
        validatePose: (lm) => Utils.calculateAngle(lm[11], lm[13], lm[15]) < 120
    }),

    'Shoulder Press': LogicBuilders.poseRep({
        checkStartCondition: (lm) => lm[15].y > lm[0].y,
        checkActiveCondition: (lm) => Utils.areHandsAboveHead(lm),
        prompts: { ready: "Push Up", active: "PRESSED!" }
    }),

    'Shadow Boxing': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 3.5,
        prompts: { idle: "Punch!", active: "NICE COMBO!" },
        validatePose: (lm) => lm[15].y < lm[11].y + 0.2 // Hands generally up
    }),

    // --- FOOTBALL (Soccer) ⚽ ---
    'Leg Swings': LogicBuilders.velocityRep({
        joints: [25, 26, 27, 28], threshold: 2.0,
        prompts: { idle: "Swing Leg", active: "Good Swing!", wrongForm: "Swing Wider!" },
        validatePose: (lm) => Math.abs(lm[27].x - lm[28].x) > 0.3 // Feet must separate horizontally
    }),
    'High Knees': LogicBuilders.velocityRep({
        joints: [25, 26], threshold: 3.0,
        prompts: { idle: "Knees Up!", active: "Keep it up!", wrongForm: "Lift Knees Higher!" },
        validatePose: (lm) => {
            // Check if at least one knee is significantly higher than usual (closer to hip)
            // Or simple check: Knee Y < Hip Y + 0.3 (Threshold)
            return (lm[25].y < lm[23].y + 0.35) || (lm[26].y < lm[24].y + 0.35);
        }
    }),
    'Butt Kicks': LogicBuilders.velocityRep({
        joints: [27, 28], threshold: 3.0,
        prompts: { idle: "Heels to Glutes", active: "Kick!", wrongForm: "Kick Backwards!" },
        validatePose: (lm) => {
            // Check knee flexion angle. Should be small (< 90)
            const lAngle = Utils.calculateAngle(lm[23], lm[25], lm[27]);
            const rAngle = Utils.calculateAngle(lm[24], lm[26], lm[28]);
            return lAngle < 100 || rAngle < 100;
        }
    }),
    'Side Lunges': LogicBuilders.velocityRep({
        joints: [23, 24, 25, 26], threshold: 2.0,
        prompts: { idle: "Step Side", active: "Lunge!", wrongForm: "Step Wider!" },
        validatePose: (lm) => Math.abs(lm[27].x - lm[28].x) > 0.5 // Wide stance
    }),
    'Sprint in Place': LogicBuilders.velocityRep({
        joints: [25, 26], threshold: 4.5,
        prompts: { idle: "Run!", active: "FASTER!", wrongForm: "Move Legs!" },
        validatePose: (lm) => true // Velocity is main factor here
    }),
    'Jumping Jacks': LogicBuilders.poseRep({
        checkStartCondition: (lm) => !Utils.areHandsAboveHead(lm),
        checkActiveCondition: (lm) => Utils.areHandsAboveHead(lm) && Math.abs(lm[27].x - lm[28].x) > 0.4,
        prompts: { ready: "Hands Down", active: "JUMP!" }
    }),

    // --- RUGBY 🏆 ---
    'Arm Circles': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 2.0,
        prompts: { idle: "Circle Arms", active: "Rotate!" },
        validatePose: (lm) => Utils.areHandsAboveShoulders(lm) // Don't circle low
    }),
    'Shoulder Shrugs': LogicBuilders.velocityRep({
        joints: [11, 12], threshold: 0.5, // Subtle movement
        prompts: { idle: "Shrug", active: "Squeeze!" },
        validatePose: (lm) => true // Hard to validate shrug strictly
    }),
    'Push-up Prep': LogicBuilders.poseRep({
        checkStartCondition: (lm) => false,
        checkActiveCondition: (lm) => Math.abs(lm[11].y - lm[23].y) < 0.2, // Torso horizontal (Shoulder Y ~ Hip Y) -- assuming camera side/top? 
        // Actually for front cam, Plank looks like Push up.
        // Let's assume user is facing cam: Shoulders shouldn't be too high? 
        // Fallback: Just give points for holding still?
        prompts: { ready: "Get in Plank", active: "HOLD STRONG!" }
    }),
    'Burpees': LogicBuilders.velocityRep({
        joints: [0, 11, 23], threshold: 5.0,
        prompts: { idle: "Down & Up", active: "EXPLODE!" },
        validatePose: (lm) => true // Complex movement, rely on velocity of whole body
    }),
    'Mountain Climbers': LogicBuilders.velocityRep({
        joints: [25, 26], threshold: 4.0,
        prompts: { idle: "Drive Knees", active: "CLIMB!" },
        validatePose: (lm) => Math.abs(lm[11].y - lm[23].y) < 0.3 // Leaning forward/horizontal
    }),
    'Bear Crawls': LogicBuilders.velocityRep({
        joints: [15, 16, 27, 28], threshold: 2.5,
        prompts: { idle: "Crawl", active: "Move!" }
    }),

    // --- RUNNER 🏃 ---
    'Walking Lunges': LogicBuilders.velocityRep({
        joints: [25, 26, 23, 24], threshold: 2.0,
        prompts: { idle: "Step Forward", active: "Deep Lunge!", wrongForm: "Bend Knees!" },
        validatePose: (lm) => {
            // One knee should be bent approx 90
            const lAngle = Utils.calculateAngle(lm[23], lm[25], lm[27]);
            const rAngle = Utils.calculateAngle(lm[24], lm[26], lm[28]);
            return lAngle < 110 || rAngle < 110;
        }
    }),
    'Calf Raises': LogicBuilders.velocityRep({
        joints: [27, 28, 0], threshold: 0.8, // Vertical motion
        prompts: { idle: "Up on Toes", active: "Squeeze!" },
        validatePose: (lm) => true
    }),
    'Ankle Circles': LogicBuilders.velocityRep({
        joints: [27, 28], threshold: 1.0,
        prompts: { idle: "Rotate Ankle", active: "Good Rotation" }
    }),
    'Skipping': LogicBuilders.velocityRep({
        joints: [27, 28], threshold: 2.5,
        prompts: { idle: "Skip!", active: "Hop!" },
        validatePose: (lm) => lm[27].y < 0.9 && lm[28].y < 0.9 // Feet not on bottom edge?
    }),
    'A-Skips': LogicBuilders.velocityRep({
        joints: [25, 26], threshold: 3.0,
        prompts: { idle: "Knee Drive", active: "Skip!" },
        validatePose: (lm) => true
    }),

    // --- CYCLIST 🚴 ---
    'Hip Circles': LogicBuilders.velocityRep({
        joints: [23, 24], threshold: 1.5,
        prompts: { idle: "Circle Hips", active: "Loosen Up" }
    }),
    'Cat-Cow Stretch': LogicBuilders.velocityRep({
        joints: [11, 12, 23, 24], threshold: 1.0,
        prompts: { idle: "Arch & Round", active: "Stretch!" }
    }),
    'Knee Hugs': LogicBuilders.poseRep({
        checkStartCondition: (lm) => lm[25].y > lm[23].y,
        checkActiveCondition: (lm) => (lm[25].y < lm[23].y + 0.1) || (lm[26].y < lm[24].y + 0.1), // Knee near hip level
        prompts: { ready: "Stand Tall", active: "HUG KNEE!" }
    }),
    'Torso Twists': LogicBuilders.velocityRep({
        joints: [11, 12], threshold: 2.0,
        prompts: { idle: "Twist", active: "Look Back!" },
        // Compare shoulder X relative to Hip X (should change)
        validatePose: (lm) => Math.abs(lm[11].x - lm[23].x) > 0.1
    }),
    'Hip Flexor Lunge': LogicBuilders.poseRep({
        checkStartCondition: (lm) => Math.abs(lm[27].x - lm[28].x) < 0.2,
        checkActiveCondition: (lm) => Math.abs(lm[27].x - lm[28].x) > 0.5,
        prompts: { ready: "Step Back", active: "Feel Stretch" }
    }),

    // --- DESK 💼 ---
    'Neck Rolls': LogicBuilders.velocityRep({
        joints: [0], threshold: 0.5,
        prompts: { idle: "Roll Neck", active: "Gently..." }
    }),
    'Shoulder Rolls': LogicBuilders.velocityRep({
        joints: [11, 12], threshold: 1.0,
        prompts: { idle: "Roll Shoulders", active: "Relax..." }
    }),
    'Wrist Circles': LogicBuilders.velocityRep({
        joints: [15, 16], threshold: 1.0,
        prompts: { idle: "Circle Wrists", active: "Loosen..." }
    }),
    'Seated Twists': LogicBuilders.velocityRep({
        joints: [11, 12], threshold: 1.5,
        prompts: { idle: "Twist in Chair", active: "Turn!" }
    }),
    'Arm Stretches': LogicBuilders.poseRep({
        checkStartCondition: (lm) => true,
        checkActiveCondition: (lm) => Math.abs(lm[15].x - lm[12].x) < 0.15 || Math.abs(lm[16].x - lm[11].x) < 0.15, // Crossover
        prompts: { ready: "Reach Across", active: "Stretch!" }
    }),
    'Standing Reach': LogicBuilders.poseRep({
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
