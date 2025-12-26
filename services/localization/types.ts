
export type Language = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'jp' | 'kr' | 'cn';

export type TranslationKeys = {
    // ONBOARDING
    "onboarding.welcome.title": string;
    "onboarding.welcome.desc": string;
    "onboarding.gamify.title": string;
    "onboarding.gamify.desc": string;
    "onboarding.next": string;
    "onboarding.permission.title": string;
    "onboarding.permission.desc": string;
    "onboarding.permission.grant": string;
    "onboarding.permission.granted": string;
    "onboarding.permission.denied": string;
    "onboarding.permission.required_title": string;
    "onboarding.permission.required_desc": string;
    "onboarding.permission.retry": string;
    "onboarding.permission.skip": string;
    "onboarding.q1.title": string;
    "onboarding.q2.title": string;
    "onboarding.q3.title": string;

    "onboarding.syncing": string;
    "onboarding.step_counter": string;
    "onboarding.goal.q": string;
    "onboarding.goal.opt1": string; "onboarding.goal.opt2": string; "onboarding.goal.opt3": string; "onboarding.goal.opt4": string;
    "onboarding.level.q": string;
    "onboarding.level.opt1": string; "onboarding.level.opt2": string; "onboarding.level.opt3": string;
    "onboarding.freq.q": string;
    "onboarding.freq.opt1": string; "onboarding.freq.opt2": string; "onboarding.freq.opt3": string;
    "onboarding.later": string;

    // HOME
    "home.daily_mission": string;
    "home.start": string;
    "home.streak": string;
    "home.level": string;
    "home.premium_banner": string;
    "home.accolades": string;

    // HEADER
    "header.points": string;
    "header.pro_badge": string;
    "header.level_prefix": string;

    // SETTINGS / MENU
    "settings.title": string;
    "settings.identity": string;
    "settings.avatar": string;
    "settings.archetype": string;
    "settings.colorway": string;
    "settings.preferences": string;
    "settings.sound": string;
    "settings.seated": string;
    "settings.seated.desc": string;
    "settings.developer": string;
    "settings.debug": string;
    "settings.reset": string;
    "settings.resetConfirm": string;
    "settings.language": string;
    "settings.support": string;
    "settings.rate_us": string;
    "settings.contact": string;

    // GAME
    "game.prepare": string;
    "game.go": string;
    "game.next_round": string;
    "game.workout_failed": string;
    "game.score": string;
    "game.feedback.perfect": string;
    "game.feedback.good": string;
    "game.feedback.miss": string;

    // RESULTS
    "results.title": string;
    "results.score": string;
    "results.new_badge": string;
    "results.streak_kept": string;
    "results.level_up": string;
    "results.claim": string;
    "results.complete_title": string;
    "results.complete_desc": string;
    "results.total_score": string;
    "results.xp_gained": string;
    "results.level_progress": string;
    "results.level_up_anim": string; // "LEVEL UP!"
    "results.retry": string;

    // LEADERBOARD
    "leaderboard.title": string;
    "leaderboard.subtitle": string;
    "leaderboard.empty": string;
    "leaderboard.you": string;

    // PAYWALL
    "paywall.title": string;
    "paywall.desc": string;
    "paywall.feature1": string;
    "paywall.feature2": string;
    "paywall.feature3": string;
    "paywall.subscribe": string;
    "paywall.restore": string;
    "paywall.terms": string;
    "paywall.privacy": string;
    "paywall.processing": string;
    "paywall.subtitle": string;
    "paywall.badge": string;
    "paywall.hero_start": string;
    "paywall.hero_end": string;
    "paywall.benefit1.title": string; "paywall.benefit1.sub": string;
    "paywall.benefit2.title": string; "paywall.benefit2.sub": string;
    "paywall.benefit3.title": string; "paywall.benefit3.sub": string;
    "paywall.benefit4.title": string; "paywall.benefit4.sub": string;
    "paywall.cta_loading": string;
    "paywall.cta_default": string;
    "paywall.save_percent": string;

    // RATE US
    "rate.title": string;
    "rate.desc": string;
    "rate.submit": string;
    "rate.later": string;
    "rate.thank_you_title": string;
    "rate.thank_you_desc": string;
    "rate.continue": string;
    "rate.question_title": string;
    "rate.question_desc": string;
    "rate.feedback_placeholder": string;
    "rate.send_feedback": string;
    "rate.no_thanks": string;

    // LEVELING
    "leveling.title": string;
    "leveling.subtitle": string;
    "leveling.current": string;
    "leveling.xp": string;
    "leveling.next_reward": string;
    "leveling.more_soon": string;

    // LEVEL TITLES & REWARDS
    "level.1.title": string; "level.1.reward": string;
    "level.2.title": string; "level.2.reward": string;
    "level.3.title": string; "level.3.reward": string;
    "level.4.title": string; "level.4.reward": string;
    "level.5.title": string; "level.5.reward": string;
    "level.6.title": string; "level.6.reward": string;
    "level.7.title": string; "level.7.reward": string;
    "level.8.title": string; "level.8.reward": string;
    "level.9.title": string; "level.9.reward": string;
    "level.10.title": string; "level.10.reward": string;
    "level.15.title": string; "level.15.reward": string;

    // GAME ALERTS & FEEDBACK
    "game.alert.daily_limit_title": string;
    "game.alert.daily_limit_desc": string;
    "game.alert.failed": string;


    // EXERCISES
    "exercise.overhead_reach.name": string;
    "exercise.overhead_reach.instruction": string;
    "exercise.t_pose_pulses.name": string;
    "exercise.t_pose_pulses.instruction": string;
    "exercise.hooks.name": string;
    "exercise.hooks.instruction": string;
    "exercise.uppercuts.name": string;
    "exercise.uppercuts.instruction": string;
    "exercise.shoulder_press.name": string;
    "exercise.shoulder_press.instruction": string;
    "exercise.shadow_boxing.name": string;
    "exercise.shadow_boxing.instruction": string;

    // Football
    "exercise.leg_swings.name": string; "exercise.leg_swings.instruction": string;
    "exercise.high_knees.name": string; "exercise.high_knees.instruction": string;
    "exercise.butt_kicks.name": string; "exercise.butt_kicks.instruction": string;
    "exercise.side_lunges.name": string; "exercise.side_lunges.instruction": string;
    "exercise.sprint_in_place.name": string; "exercise.sprint_in_place.instruction": string;
    "exercise.jumping_jacks.name": string; "exercise.jumping_jacks.instruction": string;

    // Rugby
    "exercise.arm_circles.name": string; "exercise.arm_circles.instruction": string;
    "exercise.shoulder_shrugs.name": string; "exercise.shoulder_shrugs.instruction": string;
    "exercise.push_up_prep.name": string; "exercise.push_up_prep.instruction": string;
    "exercise.burpees.name": string; "exercise.burpees.instruction": string;
    "exercise.mountain_climbers.name": string; "exercise.mountain_climbers.instruction": string;
    "exercise.bear_crawls.name": string; "exercise.bear_crawls.instruction": string;

    // Runner
    "exercise.walking_lunges.name": string; "exercise.walking_lunges.instruction": string;
    "exercise.calf_raises.name": string; "exercise.calf_raises.instruction": string;
    "exercise.ankle_circles.name": string; "exercise.ankle_circles.instruction": string;
    "exercise.skipping.name": string; "exercise.skipping.instruction": string;
    "exercise.a_skips.name": string; "exercise.a_skips.instruction": string;

    // Cyclist
    "exercise.hip_circles.name": string; "exercise.hip_circles.instruction": string;
    "exercise.cat_cow_stretch.name": string; "exercise.cat_cow_stretch.instruction": string;
    "exercise.knee_hugs.name": string; "exercise.knee_hugs.instruction": string;
    "exercise.torso_twists.name": string; "exercise.torso_twists.instruction": string;
    "exercise.hip_flexor_lunge.name": string; "exercise.hip_flexor_lunge.instruction": string;

    // Desk
    "exercise.neck_rolls.name": string; "exercise.neck_rolls.instruction": string;
    "exercise.shoulder_rolls.name": string; "exercise.shoulder_rolls.instruction": string;
    "exercise.wrist_circles.name": string; "exercise.wrist_circles.instruction": string;
    "exercise.seated_twists.name": string; "exercise.seated_twists.instruction": string;
    "exercise.arm_stretches.name": string; "exercise.arm_stretches.instruction": string;
    "exercise.standing_reach.name": string; "exercise.standing_reach.instruction": string;


    // BADGE REVEAL
    "badge.new_accolade": string;
    "badge.continue": string;
    "badge.first_step.name": string; "badge.first_step.desc": string;
    "badge.on_fire.name": string; "badge.on_fire.desc": string;
    "badge.champion.name": string; "badge.champion.desc": string;
    "badge.combo_king.name": string; "badge.combo_king.desc": string;
    "badge.survivor.name": string; "badge.survivor.desc": string;
    "badge.ninja.name": string; "badge.ninja.desc": string;
    "badge.unknown.name": string; "badge.unknown.desc": string;

    // NEW BADGES
    "badge.early_bird.name": string; "badge.early_bird.desc": string;
    "badge.night_owl.name": string; "badge.night_owl.desc": string;
    "badge.marathoner.name": string; "badge.marathoner.desc": string;
    "badge.speedster.name": string; "badge.speedster.desc": string;
    "badge.sharpshooter.name": string; "badge.sharpshooter.desc": string;
    "badge.social_butterfly.name": string; "badge.social_butterfly.desc": string;
    "badge.consistent.name": string; "badge.consistent.desc": string;
    "badge.unstoppable.name": string; "badge.unstoppable.desc": string;
    "badge.weekend_warrior.name": string; "badge.weekend_warrior.desc": string;
    "badge.yogi.name": string; "badge.yogi.desc": string;
    "badge.globetrotter.name": string; "badge.globetrotter.desc": string;
    "badge.clean_sheet.name": string; "badge.clean_sheet.desc": string;
    "badge.comeback_kid.name": string; "badge.comeback_kid.desc": string;
    "badge.centurion.name": string; "badge.centurion.desc": string;

    // SPORT MODES
    "mode.select_title": string;
    "mode.select_desc": string;
    "mode.football.name": string;
    "mode.football.desc": string;
    "mode.rugby.name": string;
    "mode.rugby.desc": string;
    "mode.runner.name": string;
    "mode.runner.desc": string;
    "mode.cyclist.name": string;
    "mode.cyclist.desc": string;
    "mode.desk.name": string;
    "mode.desk.desc": string;

    // FLEXIBILITY TRACKING
    "flexibility.title": string;
    "flexibility.shoulder": string;
    "flexibility.hip": string;
    "flexibility.spine": string;
    "flexibility.improved": string;
    "flexibility.tracking_desc": string;

    // TEAM CHALLENGES
    "team.title": string;
    "team.join": string;
    "team.create": string;
    "team.members": string;
    "team.progress": string;
    "team.sync_desc": string;

    // KIT UNLOCKING
    "kit.unlocked": string;
    "kit.new_colorway": string;
    "kit.milestone": string;
    "kit.customize": string;
};
