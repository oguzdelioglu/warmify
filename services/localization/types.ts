
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
};
