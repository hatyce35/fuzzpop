import React from 'react';
import { ArrowLeft, Lock, Star } from 'lucide-react';
import { LEVELS } from '../data/levels';
import { UserProgress } from '../types/game';
import { soundEngine } from '../utils/audio';
import { TRANSLATIONS } from '../utils/i18n';

interface LevelSelectProps {
  progress: UserProgress;
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  progress,
  onSelectLevel,
  onBackToMenu,
}) => {
  const lang = progress.settings.language || 'tr';
  const t = TRANSLATIONS[lang].levelSelect;

  return (
    <div className="flex-1 w-full max-w-md mx-auto flex flex-col p-4 select-none z-10 text-white overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          onClick={() => {
            soundEngine.playClick();
            onBackToMenu();
          }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-transform cursor-pointer"
          aria-label={t.back}
          title={t.back}
        >
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
            <ArrowLeft size={18} />
          </div>
        </button>

        <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">
          {t.title}
        </h2>

        <div className="w-10" />
      </div>

      {/* Scrollable Levels Grid */}
      <div className="flex-1 overflow-y-auto py-4 px-1 grid grid-cols-4 gap-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
        {LEVELS.map((lvl) => {
          const isUnlocked = lvl.id <= progress.unlockedLevel;
          const levelData = progress.levels[lvl.id];
          const stars = levelData?.stars || 0;

          return (
            <button
              key={lvl.id}
              disabled={!isUnlocked}
              onClick={() => {
                soundEngine.playClick();
                onSelectLevel(lvl.id);
              }}
              title={isUnlocked ? (lang === 'tr' ? `Bölüm ${lvl.id}` : `Level ${lvl.id}`) : t.locked}
              className={`min-h-[72px] rounded-2xl flex flex-col items-center justify-center p-2 relative transition-all active:scale-95 shadow-md ${
                isUnlocked
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 hover:border-sky-400/60 cursor-pointer'
                  : 'bg-slate-900/40 border border-slate-800/40 opacity-45 cursor-not-allowed'
              }`}
            >
              {isUnlocked ? (
                <>
                  <span className="font-mono text-base font-bold text-slate-100">
                    {lvl.id < 10 ? `0${lvl.id}` : lvl.id}
                  </span>
                  {/* Star indicators */}
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3].map((sIndex) => (
                      <Star
                        key={sIndex}
                        size={10}
                        className={
                          sIndex <= stars
                            ? 'fill-amber-400 text-amber-300'
                            : 'fill-slate-800 text-slate-700'
                        }
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <Lock size={16} />
                  <span className="font-mono text-xs font-semibold mt-1">
                    {lvl.id < 10 ? `0${lvl.id}` : lvl.id}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
