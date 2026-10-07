import React from 'react';
import { RotateCcw, Settings, Star, FastForward, Pause } from 'lucide-react';
import { Language, LevelConfig } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';

interface HeaderHUDProps {
  level: LevelConfig;
  score: number;
  remainingBalls: number;
  totalBalls: number;
  shotsRemaining: number;
  language?: Language;
  onRestart: () => void;
  onOpenSettings: () => void;
  onPause: () => void;
  onHome?: () => void;
  onSkipLevel?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  level,
  score,
  remainingBalls,
  totalBalls,
  shotsRemaining,
  language = 'tr',
  onRestart,
  onOpenSettings,
  onPause,
  onSkipLevel,
}) => {
  const t = TRANSLATIONS[language].header;
  const tOver = TRANSLATIONS[language].gameOver;

  const currentStars =
    score >= level.starThresholds[2]
      ? 3
      : score >= level.starThresholds[1]
      ? 2
      : score >= level.starThresholds[0]
      ? 1
      : 0;

  const clearedCount = Math.max(0, totalBalls - remainingBalls);
  const targetProgress = totalBalls > 0 ? Math.min(1, clearedCount / totalBalls) : 0;
  const isLowShots = shotsRemaining <= 5;

  return (
    <header className="w-full max-w-md mx-auto px-3 pt-2 pb-1.5 flex items-center justify-between text-white z-20 shrink-0 select-none">
      {/* Left: Level badge & Shots Remaining */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold tracking-wider uppercase text-sky-300">
            {t.level(level.id)}
          </span>
          <div
            className={`flex items-center gap-1 font-bold text-sm px-2.5 py-0.5 rounded-full transition-colors ${
              isLowShots
                ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40 animate-pulse'
                : 'bg-slate-800/80 text-amber-300 border border-slate-700/50'
            }`}
          >
            <span className="text-xs">🎯</span>
            <span className="font-mono tabular-nums">{shotsRemaining}</span>
          </div>
        </div>
      </div>

      {/* Center: Clear All Objective & Progress */}
      <div className="flex flex-col items-center max-w-[190px]">
        {/* Objective Progress Header */}
        <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-200 mb-1 px-0.5">
          <span className="text-[11px] font-bold tracking-wide text-sky-200 uppercase">
            {t.clearBoard}
          </span>
          <span
            className={`font-mono text-[11px] font-bold tabular-nums ${
              remainingBalls <= 5 ? 'text-amber-300 animate-bounce' : 'text-emerald-300'
            }`}
          >
            {remainingBalls} {tOver.left}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-40 h-2.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/60 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 rounded-full transition-all duration-300"
            style={{ width: `${targetProgress * 100}%` }}
          />
        </div>

        {/* Stars and Score */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((starIndex) => (
              <Star
                key={starIndex}
                size={12}
                className={`transition-colors duration-300 ${
                  starIndex <= currentStars
                    ? 'fill-amber-400 text-amber-300'
                    : 'fill-slate-800 text-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="font-mono font-bold text-xs text-amber-300 tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Right: Quick actions (Pause, Skip, Restart, Settings) */}
      <div className="flex items-center gap-1">
        {onSkipLevel && (
          <button
            onClick={onSkipLevel}
            title={t.skipTooltip}
            aria-label={t.skipTooltip}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-emerald-400 hover:text-emerald-300 active:scale-90 transition-transform cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 shadow-sm">
              <FastForward size={16} />
            </div>
          </button>
        )}
        <button
          onClick={onPause}
          title={t.pauseTooltip}
          aria-label={t.pauseTooltip}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-sky-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-sky-950/70 hover:bg-sky-900/80 border border-sky-500/40 shadow-sm">
            <Pause size={16} className="fill-sky-400/30" />
          </div>
        </button>
        <button
          onClick={onRestart}
          title={t.restartTooltip}
          aria-label={t.restartTooltip}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 shadow-sm">
            <RotateCcw size={16} />
          </div>
        </button>
        <button
          onClick={onOpenSettings}
          title={t.settingsTooltip}
          aria-label={t.settingsTooltip}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 shadow-sm">
            <Settings size={16} />
          </div>
        </button>
      </div>
    </header>
  );
};
