// import { PoseLandmark } from '@mediapipe/pose';

// Type definitions for landmarks (simplified for Readability)
// MediaPipe Body 33 Keypoints
// 11=L_Shoulder, 12=R_Shoulder, 13=L_Elbow, 14=R_Elbow, 15=L_Wrist, 16=R_Wrist

// State Definition
export interface MovementState {
    phase: 'READY' | 'HOLD' | 'COOLDOWN';
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

// Helper to calculate angle between three points (A, B, C)
function calculateAngle(a: any, b: any, c: any): number {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

// Evaluators for specific moves
const Evaluators: Record<string, (lm: any[], prevLm: any[] | null, state: MovementState) => EvaluationResult> = {

    'Overhead Reach': (lm, prevLm, state) => {
        // State Machine:
        // READY: Hands below shoulders.
        // TRIGGER: Hands above head AND arms straight.
        // Action: Must go READY -> TRIGGER to count.

        const now = Date.now();
        const handsAboveHead = lm[15].y < lm[0].y && lm[16].y < lm[0].y;
        const handsBelowShoulders = lm[15].y > lm[11].y && lm[16].y > lm[12].y;

        let nextState = { ...state };
        let isMatch = false;
        let didTriggerRep = false;
        let feedback = "Get Ready: Lower Arms";
        let incorrect: string[] = [];

        // Check geometry for scoring regardless of state (for coloring)
        const leftArmAngle = calculateAngle(lm[11], lm[13], lm[15]);
        const rightArmAngle = calculateAngle(lm[12], lm[14], lm[16]);
        const armsStraight = leftArmAngle > 140 && rightArmAngle > 140;

        if (handsAboveHead && armsStraight) isMatch = true;
        if (!processArmsCheck(leftArmAngle, 140)) incorrect.push('left_elbow');
        if (!processArmsCheck(rightArmAngle, 140)) incorrect.push('right_elbow');

        if (state.phase === 'READY') {
            if (handsAboveHead && armsStraight) {
                // Triggered!
                nextState.phase = 'HOLD';
                nextState.lastTriggerTime = now;
                didTriggerRep = true;
                feedback = "PERFECT REACH!";
            } else {
                feedback = "Reach Up!";
            }
        } else if (state.phase === 'HOLD') {
            // User is holding the pose.
            feedback = "Good Hold! Return Down.";
            if (handsBelowShoulders) {
                nextState.phase = 'READY'; // Reset
                feedback = "Ready for next rep";
            }
        } else if (state.phase === 'COOLDOWN') {
            // Not used yet for this move, but standardizing
            nextState.phase = 'READY';
        }

        return { score: isMatch ? 100 : 0, feedback, incorrectJoints: incorrect, isMatch, didTriggerRep, nextState };
    },

    'T-Pose Pulses': (lm, prevLm, state) => {
        const now = Date.now();
        const isTPose = Math.abs(lm[11].y - lm[13].y) < 0.2 && Math.abs(lm[12].y - lm[14].y) < 0.2;
        let nextState = { ...state };
        let didTriggerRep = false;

        // Velocity trigger
        if (now - state.lastTriggerTime > 600) {
            if (isTPose && checkVelocity(lm, prevLm, [11, 12, 13, 14], 0.8)) {
                didTriggerRep = true;
                nextState.lastTriggerTime = now;
            }
        }

        return {
            score: isTPose ? 100 : 30,
            isMatch: isTPose,
            didTriggerRep,
            feedback: isTPose ? "PULSE!" : "Arms Out!",
            incorrectJoints: isTPose ? [] : ['shoulders'],
            nextState
        };
    },

    'Hooks': (lm, prevLm, state) => {
        const now = Date.now();
        const handsNearFace = Math.abs(lm[15].x - lm[0].x) < 0.2 || Math.abs(lm[16].x - lm[0].x) < 0.2;

        const leftArmAng = calculateAngle(lm[11], lm[13], lm[15]);
        const rightArmAng = calculateAngle(lm[12], lm[14], lm[16]);
        const isHook = (leftArmAng > 70 && leftArmAng < 120) || (rightArmAng > 70 && rightArmAng < 120);
        const fast = checkVelocity(lm, prevLm, [15, 16], 2.0);

        let nextState = { ...state };
        let didTriggerRep = false;

        if (state.phase === 'READY') {
            if (isHook && fast) {
                nextState.phase = 'COOLDOWN';
                nextState.lastTriggerTime = now;
                didTriggerRep = true;
            }
        } else {
            if (now - state.lastTriggerTime > 400 && handsNearFace) {
                nextState.phase = 'READY';
            }
        }

        return { score: 100, isMatch: isHook, feedback: didTriggerRep ? "NICE HOOK!" : "Guard Up & Hook!", incorrectJoints: [], didTriggerRep, nextState };
    },

    'Uppercuts': (lm, prevLm, state) => {
        const now = Date.now();
        const isCut = (lm[15].y < lm[11].y) || (lm[16].y < lm[12].y);
        const fast = checkVelocity(lm, prevLm, [15, 16], 2.0);
        const handsLow = lm[15].y > lm[11].y && lm[16].y > lm[12].y; // Reset position

        let nextState = { ...state };
        let didTriggerRep = false;

        if (state.phase === 'READY') {
            if (isCut && fast) {
                nextState.phase = 'COOLDOWN';
                nextState.lastTriggerTime = now;
                didTriggerRep = true;
            }
        } else {
            if (now - state.lastTriggerTime > 400 && handsLow) {
                nextState.phase = 'READY';
            }
        }
        return { score: 100, isMatch: isCut, feedback: didTriggerRep ? "POWER!" : "Hands Low & Punch Up!", incorrectJoints: [], didTriggerRep, nextState };
    },

    'Shoulder Press': (lm, prevLm, state) => {
        const handsUp = lm[15].y < lm[0].y && lm[16].y < lm[0].y;
        const handsDown = lm[15].y > lm[0].y && lm[16].y > lm[0].y;

        let nextState = { ...state };
        let didTriggerRep = false;

        if (state.phase === 'READY') {
            if (handsUp) {
                nextState.phase = 'HOLD';
                didTriggerRep = true;
            }
        } else if (state.phase === 'HOLD') {
            if (handsDown) {
                nextState.phase = 'READY';
            }
        }

        return { score: handsUp ? 100 : 50, isMatch: handsUp, feedback: didTriggerRep ? "PRESSED!" : "Push Up... Then Down", incorrectJoints: [], didTriggerRep, nextState };
    },

    'Shadow Box': (lm, prevLm, state) => {
        const now = Date.now();

        // Stricter velocity check (was 2.5)
        const fast = checkVelocity(lm, prevLm, [15, 16], 6.0);

        // Ensure at least one arm is extending (not just wrist shaking)
        const leftArmAng = calculateAngle(lm[11], lm[13], lm[15]);
        const rightArmAng = calculateAngle(lm[12], lm[14], lm[16]);
        const isExtended = leftArmAng > 90 || rightArmAng > 90;

        let nextState = { ...state };
        let didTriggerRep = false;

        if (now - state.lastTriggerTime > 300 && fast && isExtended) {
            didTriggerRep = true;
            nextState.lastTriggerTime = now;
        }

        return { score: 100, isMatch: true, feedback: "Keep Moving!", incorrectJoints: [], didTriggerRep, nextState };
    },

    'Freestyle': (lm, prevLm, state) => ({ score: 100, isMatch: true, feedback: "Keep Moving!", incorrectJoints: [], didTriggerRep: false, nextState: state })
};

function processArmsCheck(angle: number, target: number): boolean {
    return angle > target;
}

// Check average movement of specified joints (velocity thresholding)
function checkVelocity(cur: any[], prev: any[] | null | undefined, indices: number[], threshold: number): boolean {
    if (!prev) return true; // optimistic start for first frame
    let totalVel = 0;
    indices.forEach(idx => {
        totalVel += Math.abs(cur[idx].x - prev[idx].x) + Math.abs(cur[idx].y - prev[idx].y);
    });
    const avgVel = (totalVel / indices.length) * 100; // scale
    return avgVel > threshold;
}

// Helper to check visibility of critical landmarks
function checkVisibility(landmarks: any[], indices: number[], threshold: number = 0.65): boolean {
    return indices.every(idx => landmarks[idx] && landmarks[idx].visibility > threshold);
}

export class MoveEvaluator {
    static evaluate(exerciseName: string, landmarks: any[], prevLandmarks: any[] | null, currentState: MovementState): EvaluationResult {
        if (!landmarks || landmarks.length < 33) {
            return { score: 0, feedback: "No Pose Detected", incorrectJoints: [], isMatch: false, didTriggerRep: false, nextState: currentState };
        }

        // VISIBILITY CHECK: Prevent scoring if arms/shoulders are not clearly visible
        // We check Shoulders (11,12) and Elbows (13,14) as a baseline for upper body exercises.
        const criticalJoints = [11, 12, 13, 14];
        if (!checkVisibility(landmarks, criticalJoints)) {
            // If we can't see the arms, we can't score.
            return {
                score: 0,
                feedback: "Make sure your upper body is visible!",
                incorrectJoints: [],
                isMatch: false,
                didTriggerRep: false,
                nextState: currentState
            };
        }

        const evaluator = Evaluators[exerciseName] || Evaluators['Freestyle'];
        return evaluator(landmarks, prevLandmarks, currentState);
    }
}
