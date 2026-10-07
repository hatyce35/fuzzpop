import React from 'react';
import { Play, Grid, Settings, Sparkles, Star } from 'lucide-react';
import { UserProgress } from '../types/game';
import { soundEngine } from '../utils/audio';
import { MainMenuFuzzies } from './MainMenuFuzzies';
import { TRANSLATIONS } from '../utils/i18n';

interface MainMenuProps {
  progress: UserProgress;
  onPlay: () => void;
  onOpenLevels: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  onPlay,
  onOpenLevels,
  onOpenSettings,
}) => {
  const lang = progress.settings.language || 'tr';
  const t = TRANSLATIONS[lang].mainMenu;

  const completedCount = Object.values(progress.levels).filter((l) => l.completed).length;
  const totalStars = Object.values(progress.levels).reduce((acc, curr) => acc + (curr.stars || 0), 0);

  const handlePlayClick = () => {
    soundEngine.playClick();
    onPlay();
  };

  const handleLevelsClick = () => {
    soundEngine.playClick();
    onOpenLevels();
  };

  const handleSettingsClick = () => {
    soundEngine.playClick();
    onOpenSettings();
  };

  return (
    <div className="relative flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-between p-6 select-none z-10 text-white">
      {/* Top: Stars Counter */}
      <div className="w-full flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-sm">
          <Star size={16} className="fill-amber-400 text-amber-300" />
          <span className="font-mono font-bold text-sm text-amber-300 tabular-nums">
            {totalStars}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-400 tracking-wide">
          {t.levelsCount(completedCount, 30)}
        </div>
      </div>

      {/* Center: Game Title & Authentic Animated Fuzzy Trio (Green, Blue, Yellow) */}
      <div className="flex flex-col items-center my-auto text-center w-full">
        <MainMenuFuzzies />

        {/* Title */}
        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-sky-400 drop-shadow-sm font-['Fredoka']">
          FUZZPOP
        </h1>

        {/* Subtitle */}
        <div className="flex items-center gap-2 mt-1.5 text-sky-200 font-semibold text-sm tracking-wide">
          <Sparkles size={14} className="text-amber-300" />
          <span>{t.subtitle}</span>
          <Sparkles size={14} className="text-amber-300" />
        </div>
      </div>

      {/* Bottom: Action Buttons */}
      <div className="w-full space-y-3 pb-4">
        {/* Play Button */}
        <button
          onClick={handlePlayClick}
          className="w-full min-h-[56px] rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Play size={22} className="fill-slate-950" />
          <span>
            {lang === 'tr' ? `BÖLÜM ${progress.unlockedLevel} OYNA` : `PLAY LEVEL ${progress.unlockedLevel}`}
          </span>
        </button>

        {/* Secondary Grid (Levels & Settings) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleLevelsClick}
            className="min-h-[50px] rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <Grid size={18} className="text-sky-400" />
            <span>{t.levels}</span>
          </button>

          <button
            onClick={handleSettingsClick}
            className="min-h-[50px] rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <Settings size={18} className="text-amber-400" />
            <span>{t.settings}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
