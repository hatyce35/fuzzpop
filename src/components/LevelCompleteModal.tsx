import React from 'react';
import { Play, RotateCcw, Grid, Star, Sparkles } from 'lucide-react';
import { Language } from '../types/game';
import { soundEngine } from '../utils/audio';
import { TRANSLATIONS } from '../utils/i18n';

interface LevelCompleteModalProps {
  levelId: number;
  score: number;
  stars: number;
  language?: Language;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevels: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  score,
  stars,
  language = 'tr',
  onNextLevel,
  onReplay,
  onOpenLevels,
  hasNextLevel,
}) => {
  const t = TRANSLATIONS[language].levelComplete;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 p-6 shadow-2xl flex flex-col items-center text-center text-white relative overflow-hidden">
        {/* Decorative Sparkles */}
        <div className="absolute top-3 left-4 text-amber-300 opacity-60">
          <Sparkles size={20} />
        </div>
        <div className="absolute top-3 right-4 text-sky-300 opacity-60">
          <Sparkles size={20} />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
          {t.title}
        </h3>
        <p className="text-xs font-semibold text-emerald-300 mt-0.5">
          {t.fantastic} ✨ {language === 'tr' ? `Bölüm ${levelId < 10 ? '0' + levelId : levelId}` : `Level ${levelId < 10 ? '0' + levelId : levelId}`}
        </p>

        {/* 3 Animated Stars */}
        <div className="flex items-center justify-center gap-3 my-5">
          {[1, 2, 3].map((sIndex) => {
            const isFilled = sIndex <= stars;
            return (
              <div
                key={sIndex}
                className={`transition-all duration-500 transform ${
                  isFilled
                    ? 'scale-110 -translate-y-1'
                    : 'scale-90 opacity-40'
                }`}
              >
                <Star
                  size={sIndex === 2 ? 44 : 36}
                  className={
                    isFilled
                      ? 'fill-amber-400 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                      : 'fill-slate-800 text-slate-700'
                  }
                />
              </div>
            );
          })}
        </div>

        {/* Final Score Card */}
        <div className="w-full py-3 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t.score}
          </span>
          <div className="text-3xl font-mono font-black text-amber-300 mt-0.5 tabular-nums">
            {score.toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          {hasNextLevel && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onNextLevel();
              }}
              className="w-full min-h-[50px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Play size={18} className="fill-slate-950" />
              <span>{t.nextLevel}</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                onReplay();
              }}
              className="min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              <RotateCcw size={15} />
              <span>{t.replay}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenLevels();
              }}
              className="min-h-[46px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-md"
            >
              <Grid size={15} className="text-sky-400" />
              <span>{t.levels}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
