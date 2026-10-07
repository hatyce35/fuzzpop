import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { COLOR_CONFIG, FuzzyColor, Language, SpecialType } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';

interface LauncherControlProps {
  currentFuzzy: { color: FuzzyColor; special: SpecialType };
  nextFuzzy: { color: FuzzyColor; special: SpecialType };
  shotsRemaining: number;
  language?: Language;
  onSwapFuzzies: () => void;
  isShooting: boolean;
}

export const LauncherControl: React.FC<LauncherControlProps> = ({
  nextFuzzy,
  shotsRemaining,
  language = 'tr',
  onSwapFuzzies,
  isShooting,
}) => {
  const nextConf = COLOR_CONFIG[nextFuzzy.color];
  const t = TRANSLATIONS[language].launcher;

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-4 pt-1 flex items-center justify-between pointer-events-auto select-none z-20 shrink-0">
      {/* Left: Next Fuzzy Preview & Swap Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSwapFuzzies}
          disabled={isShooting}
          className="group min-h-[48px] px-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          title={t.swapTooltip}
        >
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t.next}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Mini plush fuzzy representation */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shadow-md relative transition-transform group-hover:scale-110"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${nextConf.light}, ${nextConf.main} 60%, ${nextConf.dark})`,
                  boxShadow: `0 0 8px ${nextConf.main}55`,
                }}
              >
                {/* Mini plush ear puffs */}
                <div
                  className="w-2 h-2 rounded-full absolute -top-0.5 -left-0.5"
                  style={{ backgroundColor: nextConf.main }}
                />
                <div
                  className="w-2 h-2 rounded-full absolute -top-0.5 -right-0.5"
                  style={{ backgroundColor: nextConf.main }}
                />
                {/* Catchlight */}
                <div className="w-1.5 h-1.5 rounded-full bg-white/90 absolute top-1 left-1.5" />
                {/* Cute anime eyes */}
                <div className="flex gap-1 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950 relative">
                    <div className="w-0.5 h-0.5 rounded-full bg-white absolute top-0 left-0" />
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950 relative">
                    <div className="w-0.5 h-0.5 rounded-full bg-white absolute top-0 left-0" />
                  </div>
                </div>
              </div>
              <ArrowLeftRight
                size={14}
                className="text-slate-400 group-hover:text-amber-400 transition-colors"
              />
            </div>
          </div>
        </button>
      </div>

      {/* Center: Launcher Instruction / Status */}
      <div className="text-center px-1">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-400 tracking-wide line-clamp-1">
          {isShooting ? t.wheeee : t.dragToAim}
        </span>
      </div>

      {/* Right: Remaining Shots Meter */}
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-lg">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {t.shots}
        </span>
        <span
          className={`font-mono text-sm font-extrabold tabular-nums ${
            shotsRemaining <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
          }`}
        >
          {shotsRemaining}
        </span>
      </div>
    </div>
  );
};
