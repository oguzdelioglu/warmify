
// Removed unused import

interface Point {
    x: number;
    y: number;
    visibility: number;
}

interface AnimationParams {
    width: number;
    height: number;
    time: number; // in seconds or ticks
    exercise: string;
    isSeated: boolean;
}

// Helper to project polar coordinates to cartesian (normalized 0-1)
// 0 degrees is DOWN, PI is UP, PI/2 is RIGHT (relative to origin)
const polar = (ox: number, oy: number, angleRad: number, length: number, aspectRatio: number): Point => {
    // Correcting for screen coords where Y increases downwards
    // x = ox + sin(angle) * length * aspectCorrection
    // y = oy + cos(angle) * length
    // Angle 0: sin(0)=0, cos(0)=1 => (ox, oy+len) -> DOWN. Correct.
    // Angle PI: sin(PI)=0, cos(PI)=-1 => (ox, oy-len) -> UP. Correct.
    // Angle PI/2: sin=1, cos=0 => (ox+len, oy) -> RIGHT. Correct.
    // Angle -PI/2: sin=-1 => (ox-len, oy) -> LEFT. Correct.

    return {
        x: ox + Math.sin(angleRad) * length * aspectRatio,
        y: oy + Math.cos(angleRad) * length,
        visibility: 1
    };
};

export class AnimationService {

    static getProceduralPose(params: AnimationParams): any {
        const { width, height, time, exercise, isSeated } = params;
        const aspect = height / width;
        const speed = 0.15; // Base speed multiplier for ticks
        const t = time * speed;

        // Base Puppet Config
        const cx = 0.5;
        const cy = isSeated ? 0.65 : 0.55; // Center Y of hips
        const scale = isSeated ? 0.20 : 0.35;

        const shoulderWidth = scale * 0.35 * aspect;
        const armLen = scale * 0.45;
        const legLen = scale * 0.5;

        let bodyY = cy;
        let hipY = cy;
        let neckY = cy - scale * 0.8;
        let shoulderY = neckY + scale * 0.1;

        // Default Neutral Pose (Standing A-Pose)
        // Arms slightly out (approx 20 degrees from body)
        let lArmA = -0.3; // Left arm points Left-Down (-0.3 rad)
        let rArmA = 0.3;  // Right arm points Right-Down (+0.3 rad)
        let lForearmA = lArmA;
        let rForearmA = rArmA;

        let legAngle = 0; // Spread angle
        let liftLeftKnee = 0; // Vertical lift offset
        let liftRightKnee = 0;
        let liftLeftAnkle = 0; // Butt kick offset
        let liftRightAnkle = 0;

        let torsoTwist = 0; // Rotation of shoulders relative to hips

        // --- EXERCISE LOGIC MAPPERS ---

        // 1. DYNAMIC CARDIO (Jacks, Skips, Hops)
        if (exercise === 'Jumping Jacks' || exercise === 'Star Jumps') {
            const p = Math.sin(t);
            const val = p > 0 ? p : 0;
            lArmA = -0.3 - (Math.PI * 0.7 * val); // Go up to -2.5 rad
            rArmA = 0.3 + (Math.PI * 0.7 * val);
            if (!isSeated) legAngle = 0.5 * val;
        }
        else if (exercise === 'Skipping' || exercise === 'Sprint in Place' || exercise === 'High Knees') {
            const runSpeed = 2.0;
            const p = Math.sin(t * runSpeed);
            // Arms pumping
            lArmA = -0.5 + p * 0.8;
            lForearmA = -1.5 + p * 0.8; // Bent elbows
            rArmA = 0.5 - p * 0.8;
            rForearmA = 1.5 - p * 0.8;

            if (!isSeated) {
                // Knees lifting
                if (p > 0) liftLeftKnee = 0.3;
                else liftRightKnee = 0.3;

                // Bobbing
                bodyY += Math.abs(Math.sin(t * runSpeed * 2)) * 0.02;
            }
        }
        else if (exercise === 'Butt Kicks') {
            const p = Math.sin(t * 1.5);
            // Arms swinging naturally
            lArmA = -0.3 + Math.sin(t) * 0.2;
            rArmA = 0.3 - Math.sin(t) * 0.2;

            if (!isSeated) {
                if (p > 0) liftLeftAnkle = 0.35;
                else liftRightAnkle = 0.35;
            }
        }

        // 2. LUNGES & SQUATS
        else if (exercise === 'Squats' || exercise === 'Chair Pose') {
            const p = (Math.sin(t * 0.5) + 1) / 2; // 0 to 1
            bodyY += p * 0.15; // Go down
            if (!isSeated) legAngle = p * 0.8; // Knees spread out visually

            // Arms forward for balance
            lArmA = -1.3; // Forward/Down
            rArmA = 1.3;
        }
        else if (exercise === 'Side Lunges' || exercise === 'Walking Lunges') {
            const p = Math.sin(t * 0.8);
            if (!isSeated) {
                legAngle = 0.3 + Math.abs(p) * 0.4;
                bodyY += Math.abs(p) * 0.05;
                // Shift body X slightly
                // hips.x += p * 0.1 * aspect; (Needs complex recalc, skip for now)
            }
        }
        else if (exercise === 'Hip Flexor Lunge') {
            // Static hold simulation
            if (!isSeated) {
                legAngle = 0.8; // Wide stance
                bodyY += 0.1;
                // Arms up
                lArmA = Math.PI;
                rArmA = -Math.PI;
            }
        }

        // 3. UPPER BODY & ARMS
        else if (exercise === 'Arm Circles') {
            const angle = t * 2; // Continuous rotation
            lArmA = angle;
            rArmA = -angle; // Mirror or same direction? Usually forward together.
            rArmA = angle;
            // Fix visual glitch if angle wraps.
        }
        else if (exercise === 'Shoulder Press' || exercise === 'Overhead Reach') {
            const p = (Math.sin(t) + 1) / 2;
            // Arms go from shoulder level (horizontal) to Up
            lArmA = -Math.PI / 2 - (p * Math.PI / 2);
            rArmA = Math.PI / 2 + (p * Math.PI / 2);
            lForearmA = Math.PI; // Vertical hands
            rForearmA = Math.PI; // Vertical hands (Simulated)
            // Actually polar logic: Angle 0 is Down. PI is Up.
            // Start: Horizontal (-PI/2). End: Up (-PI). 
            lArmA = -Math.PI / 2 + (-Math.PI / 2 * p); // -1.57 to -3.14
            rArmA = Math.PI / 2 + (Math.PI / 2 * p);   // 1.57 to 3.14

            // Forearms: strictly UP (PI or -PI)
            lForearmA = Math.PI;
            rForearmA = Math.PI;
        }
        else if (exercise === 'T-Pose Pulses' || exercise === 'Arm Stretches') {
            const p = Math.sin(t * 3);
            lArmA = -Math.PI / 2 + p * 0.1;
            rArmA = Math.PI / 2 - p * 0.1;
        }
        else if (exercise === 'Shoulder Shrugs' || exercise === 'Shoulder Rolls') {
            const p = Math.sin(t * 2);
            shoulderY -= p * 0.02; // Shoulders go up/down
            neckY -= p * 0.01;
        }
        else if (exercise === 'Neck Rolls') {
            // Visualize by moving nose circular
            // Handled in point construction
        }

        // 4. COMBAT & BOXING
        else if (exercise === 'Shadow Boxing' || exercise === 'Hooks' || exercise === 'Uppercuts') {
            const p = Math.sin(t * 3);
            const isPunch = Math.abs(p) > 0.5;

            // Base Guard
            let baseL = -2.5; // Hands up near face
            let baseR = 2.5;

            if (p > 0) { // Left Punch
                lArmA = exercise === 'Uppercuts' ? -2.0 : -Math.PI / 2; // Hook/Jab
                lForearmA = exercise === 'Uppercuts' ? -Math.PI : -Math.PI / 2;
                rArmA = baseR; rForearmA = baseR + 0.5; // Guard
            } else { // Right Punch
                rArmA = exercise === 'Uppercuts' ? 2.0 : Math.PI / 2;
                rForearmA = exercise === 'Uppercuts' ? Math.PI : Math.PI / 2;
                lArmA = baseL; lForearmA = baseL - 0.5; // Guard
            }
        }

        // 5. FLOOR & MAT (Simulated upright or special)
        else if (exercise === 'Push-up Prep' || exercise === 'Burpees' || exercise === 'Mountain Climbers' || exercise === 'Bear Crawls' || exercise === 'Cat-Cow Stretch') {
            // These are horizontal moves. In 2D standing rig, we simulate them by:
            // - Leaning torso forward (how?) -> Hard in 2D bone view without foreshortening.
            // - Best compromise: Show the "Top" view or "Side" view logic?
            // - Or simply generic "Plank" visualization:
            // Body horizontal?

            // Let's rotate the whole body 90 degrees visually?
            // Torso is 11-12 to 23-24.
            // If we set shoulders X/Y and Hips X/Y manually, we can rotate.

            const isBurpee = exercise === 'Burpees';
            // Burpee: Jump (Standing) -> Plank (Horizontal)
            if (isBurpee) {
                const phase = Math.sin(t) > 0; // Up or Down
                if (phase) {
                    // Jump Phase (Like Jacks)
                    lArmA = -Math.PI; rArmA = Math.PI; // Arms Up
                } else {
                    // Plank Phase
                    // Rotate body
                    // This requires complex matrix or manual point override.
                    // Fallback: Just Squat deep for now.
                    bodyY += 0.2;
                    lArmA = -1.2; rArmA = 1.2; // Hands on floor
                }
            } else {
                // Static Plank / Climbers
                // Simulate by putting hands down and feet back (perspective hard)
                // Trick: Arms forward (down), Legs "up" (behind)?
                // Let's just do Mountain Climber upright animation (High knees + Arms pushing)
                lArmA = -1.5; rArmA = 1.5; // Arms forward holding ground
                const climbP = Math.sin(t * 3);
                if (climbP > 0) liftLeftKnee = 0.3; else liftRightKnee = 0.3;
            }
        }

        // 6. NUANCE & SPECIFIC
        else if (exercise === 'Torso Twists' || exercise === 'Seated Twists') {
            torsoTwist = Math.sin(t) * 0.4;
            // Arms swing with twist
            lArmA = -0.5 + torsoTwist;
            rArmA = 0.5 + torsoTwist;
        }
        else if (exercise === 'Hip Circles') {
            // Hips orbit center
            const orbit = 0.05;
            hipY += Math.cos(t) * orbit;
            // Hip X needs orbit too
        }
        else if (exercise === 'Leg Swings') {
            const p = Math.sin(t);
            // Swing Right leg
            if (!isSeated) {
                // Manually override Right Leg Angle only?
                // Our system assumes symmetric legAngle.
                // We'll hack rKnee position calculation below if needed.
                // For now use generic spread which looks like jumping jacks legs.
                legAngle = Math.abs(p) * 0.8;
            }
        }

        // --- CALCULATION ---

        const lForearmAngleFinal = lForearmA !== undefined ? lForearmA : lArmA;
        const rForearmAngleFinal = rForearmA !== undefined ? rForearmA : rArmA;

        // Apply Torso Twist to Shoulders (Shift X)
        const lShoulderXRaw = cx - shoulderWidth + (torsoTwist * 0.1);
        const rShoulderXRaw = cx + shoulderWidth + (torsoTwist * 0.1);

        const lShoulder = { x: lShoulderXRaw, y: shoulderY };
        const rShoulder = { x: rShoulderXRaw, y: shoulderY };

        // Arms
        const lElbow = polar(lShoulder.x, lShoulder.y, lArmA, armLen, aspect);
        // Correct wrist relative to elbow
        const lWrist = polar(lElbow.x, lElbow.y, lForearmAngleFinal, armLen, aspect);

        const rElbow = polar(rShoulder.x, rShoulder.y, rArmA, armLen, aspect);
        const rWrist = polar(rElbow.x, rElbow.y, rForearmAngleFinal, armLen, aspect);

        // Hips
        const lHip = { x: cx - shoulderWidth * 0.5, y: hipY };
        const rHip = { x: cx + shoulderWidth * 0.5, y: hipY };

        // Legs
        const lKneeY = hipY + legLen - liftLeftKnee;
        const rKneeY = hipY + legLen - liftRightKnee;

        // Leg Swings Override (Asymmetric)
        let lLegA = legAngle;
        let rLegA = -legAngle;
        if (exercise === 'Leg Swings') {
            lLegA = 0; // Stand still
            rLegA = Math.sin(t) * 1.0; // Swing wide
        } else {
            // Standard symmetric spread
            lLegA = -legAngle; // Out left
            rLegA = legAngle;  // Out right
        }

        const lKnee = polar(lHip.x, lHip.y, Math.PI + lLegA, legLen, aspect);
        // PI is UP. Wait.
        // We want Down + deviation. 0 is Down.
        // So Left Leg goes -Angle (Left). Right Leg goes +Angle.
        // Let's reuse polar properly.

        // Re-calc Knees with polar
        const lKneeP = polar(lHip.x, lHip.y, lLegA, legLen, aspect);
        const rKneeP = polar(rHip.x, rHip.y, rLegA, legLen, aspect);

        // Apply Lifts to Y
        lKneeP.y -= liftLeftKnee;
        rKneeP.y -= liftRightKnee;

        // Ankles
        const lAnkle = { x: lKneeP.x, y: lKneeP.y + legLen - liftLeftAnkle };
        const rAnkle = { x: rKneeP.x, y: rKneeP.y + legLen - liftRightAnkle };

        // --- CONSTRUCT LANDMARKS ---
        const lm: any = [];
        lm[0] = { x: cx + (exercise === 'Neck Rolls' ? Math.sin(t) * 0.05 : 0), y: neckY - 0.05, visibility: 1 }; // Nose
        lm[11] = { ...lShoulder, visibility: 1 };
        lm[12] = { ...rShoulder, visibility: 1 };
        lm[13] = { ...lElbow, visibility: 1 };
        lm[14] = { ...rElbow, visibility: 1 };
        lm[15] = { ...lWrist, visibility: 1 };
        lm[16] = { ...rWrist, visibility: 1 };
        lm[23] = { ...lHip, visibility: 1 };
        lm[24] = { ...rHip, visibility: 1 };
        lm[25] = { ...lKneeP, visibility: 1 };
        lm[26] = { ...rKneeP, visibility: 1 };
        lm[27] = { ...lAnkle, visibility: 1 };
        lm[28] = { ...rAnkle, visibility: 1 };

        // Fill gaps
        for (let i = 0; i < 33; i++) { if (!lm[i]) lm[i] = { x: 0.5, y: 0.5, visibility: 0 }; }

        return lm;
    }
}
