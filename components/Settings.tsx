import React, { useState } from 'react';
import { ArrowLeft, Bug, Trash2, Info, Volume2, VolumeX, Armchair, User, Palette, PenSquare, CheckCircle2, Globe } from 'lucide-react';
import { UserStats, UserSettings, CharacterArchetype, CharacterSkinId } from '../types';
import RigOverlay from './RigOverlay';
import { SoundEngine } from '../services/audioService';
import { LeaderboardService } from '../services/leaderboardService';
import { getAvatarForLevel } from '../utils/levelUtils';
import { useLocalization } from '../services/localization/LocalizationContext';
import { Language } from '../services/localization/translations';

interface SettingsProps {
  settings: UserSettings;
  userStats: UserStats;
  updateSettings: (newSettings: UserSettings) => void;
  updateUserStats: (newStats: UserStats) => void;
  onBack: () => void;
  onReset: () => void;
}

const ARCHETYPES: { id: CharacterArchetype; name: string }[] = [
  { id: 'CYBER', name: 'Cyber' },
  { id: 'STICKMAN', name: 'Stickman' },
  { id: 'MECH', name: 'Mech' },
  { id: 'ALIEN', name: 'Alien' },
  { id: 'SPIRIT', name: 'Spirit' },
];

const SKINS = [0, 1, 2, 3, 4];
const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'jp', label: '日本語', flag: '🇯🇵' },
  { code: 'kr', label: '한국어', flag: '🇰🇷' },
  { code: 'cn', label: '中文', flag: '🇨🇳' },
];

const Settings: React.FC<SettingsProps> = ({ settings, userStats, updateSettings, updateUserStats, onBack, onReset }) => {
  const { t, language, setLanguage } = useLocalization();
  const [activeTab, setActiveTab] = useState<'TYPE' | 'SKIN'>('TYPE');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userStats.username || 'Anonymous');

  const handleBack = () => {
    SoundEngine.playUI('back');
    onBack();
  };

  const update = (s: UserSettings) => {
    SoundEngine.playUI('toggle');
    updateSettings(s);
  };

  const saveName = () => {
    if (tempName.trim().length < 3) return;

    const newStats = { ...userStats, username: tempName };
    updateUserStats(newStats);
    setEditingName(false);

    // Update cloud entry immediately
    LeaderboardService.updateUserScore(
      newStats.userId,
      newStats.username,
      newStats.totalPoints,
      newStats.level,
      getAvatarForLevel(newStats.level)
    );
  };

  return (
    <div className="flex-1 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-slate-900 h-full overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center mb-4 px-4 pt-4 shrink-0">
        <button onClick={handleBack} className="p-2 bg-slate-800 rounded-full mr-4 hover:bg-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-6 w-full max-w-2xl mx-auto">

        {/* IDENTITY */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <User size={14} /> {t('settings.identity')}
          </h3>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl shadow-lg">
              {getAvatarForLevel(userStats.level)}
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    className="bg-slate-900 border border-indigo-500 rounded px-2 py-1 text-white text-sm w-full outline-none"
                    autoFocus
                  />
                  <button onClick={saveName} className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-500">
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-white text-lg flex items-center gap-2">
                    {userStats.username}
                    <button onClick={() => { setTempName(userStats.username); setEditingName(true); }} className="text-slate-500 hover:text-white transition-colors">
                      <PenSquare size={14} />
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">ID: {userStats.userId.substring(0, 8)}...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AVATAR EDITOR */}
        <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Palette size={14} /> {t('settings.avatar')}
          </h3>

          {/* PREVIEW BOX */}
          <div className="w-full h-48 bg-slate-900 rounded-xl relative overflow-hidden mb-4 border border-slate-700 shadow-inner">
            <div className="absolute inset-0 opacity-50 bg-[url('/assets/noise.svg')]"></div>
            <RigOverlay
              exercise="Jumping Jacks"
              mode="PREVIEW"
              isActive={true}
              archetype={settings.characterArchetype}
              skinId={settings.characterSkin}
              seatedMode={false}
            />
          </div>

          {/* TABS */}
          <div className="flex mb-4 bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => { SoundEngine.playUI('click'); setActiveTab('TYPE'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'TYPE' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {t('settings.archetype')}
            </button>
            <button
              onClick={() => { SoundEngine.playUI('click'); setActiveTab('SKIN'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'SKIN' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {t('settings.colorway')}
            </button>
          </div>

          {/* OPTIONS GRID */}
          <div className="grid grid-cols-3 gap-2">
            {activeTab === 'TYPE' ? ARCHETYPES.map((arch) => (
              <button
                key={arch.id}
                onClick={() => update({ ...settings, characterArchetype: arch.id })}
                className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${settings.characterArchetype === arch.id ? 'border-indigo-500 bg-indigo-500/20 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
              >
                {arch.name}
              </button>
            )) : SKINS.map((sId) => (
              <button
                key={sId}
                onClick={() => update({ ...settings, characterSkin: sId })}
                className={`p-2 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1 ${settings.characterSkin === sId ? 'border-white bg-white/10 text-white' : 'border-slate-700 bg-slate-900 text-slate-400'}`}
              >
                <div className={`w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 filter hue-rotate-${sId * 45}`}></div>
                Var {sId + 1}
              </button>
            ))}
          </div>
        </div>

        {/* PREFERENCES */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('settings.preferences')}</h3>

          {/* Language Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Globe className="text-indigo-400" />
              <span>{t('settings.language')}</span>
            </div>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as Language);
                  SoundEngine.playUI('click');
                }}
                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-2 py-1 outline-none focus:border-indigo-500"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 className="text-blue-400" /> : <VolumeX className="text-slate-500" />}
              <span>{t('settings.sound')}</span>
            </div>
            <button
              onClick={() => { SoundEngine.setMuted(settings.soundEnabled); update({ ...settings, soundEnabled: !settings.soundEnabled }); }}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Armchair className={settings.seatedMode ? "text-orange-400" : "text-slate-500"} />
              <div className="flex flex-col">
                <span>{t('settings.seated')}</span>
                <span className="text-xs text-slate-500">{t('settings.seated.desc')}</span>
              </div>
            </div>
            <button
              onClick={() => update({ ...settings, seatedMode: !settings.seatedMode })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.seatedMode ? 'bg-orange-600' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.seatedMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* DEVELOPER - Only Visible in Dev Builds */}
        {import.meta.env.DEV && (
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('settings.developer')}</h3>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bug className={settings.isDebugMode ? "text-emerald-400" : "text-slate-500"} />
                <div className="flex flex-col">
                  <span>{t('settings.debug')}</span>
                </div>
              </div>
              <button
                onClick={() => update({ ...settings, isDebugMode: !settings.isDebugMode })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.isDebugMode ? 'bg-emerald-600' : 'bg-slate-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.isDebugMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm(t('settings.resetConfirm'))) {
                  onReset();
                }
              }}
              className="w-full flex items-center justify-between text-red-400 hover:text-red-300 transition-colors mt-2"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={20} />
                <span>{t('settings.reset')}</span>
              </div>
            </button>
          </div>
        )}

        <div className="text-center pb-8">
          <p className="text-[10px] text-slate-600">v2.1.0 • AI-Powered</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;