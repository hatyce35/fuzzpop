import React from 'react';
import { Play, RotateCcw, Grid, Home, Volume2, VolumeX, Music } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { UserProgress } from '../types/game';
import { TRANSLATIONS } from '../utils/i18n';

interface PauseModalProps {
  levelId: number;
  score: number;
  settings: UserProgress['settings'];
  onResume: () => void;
  onRestart: () => void;
  onOpenLevels: () => void;
  onHome: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelId,
  score,
  settings,
  onResume,
  onRestart,
  onOpenLevels,
  onHome,
  onToggleSound,
  onToggleMusic,
}) => {
  const lang = settings.language || 'tr';
  const t = TRANSLATIONS[lang].pause;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 p-6 shadow-2xl flex flex-col items-center text-center text-white relative">
        {/* Cute Mascot Icon */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 p-0.5 shadow-lg shadow-sky-900/40 flex items-center justify-center mb-3">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl">
            ⏸️
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
          {t.title}
        </h3>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">
          {t.levelScore(levelId, score)}
        </p>

        {/* Sound & Music Quick Controls */}
        <div className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 my-4">
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleSound();
            }}
            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 cursor-pointer ${
              settings.sound
                ? 'bg-slate-700/80 border-sky-400/50 text-sky-300 shadow-sm'
                : 'bg-slate-900/80 border-slate-700/50 text-slate-500'
            }`}
          >
            {settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{t.sound} {settings.sound ? t.on : t.off}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMusic();
            }}
            className={`flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all active:scale-95 cursor-pointer ${
              settings.music
                ? 'bg-slate-700/80 border-teal-400/50 text-teal-300 shadow-sm'
                : 'bg-slate-900/80 border-slate-700/50 text-slate-500'
            }`}
          >
            <Music size={16} />
            <span>{t.music} {settings.music ? t.on : t.off}</span>
          </button>
        </div>

        {/* Primary Action: Resume */}
        <div className="w-full space-y-2.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="w-full min-h-[50px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Play size={18} className="fill-slate-950" />
            <span>{t.resume}</span>
          </button>

          {/* Restart Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <RotateCcw size={15} />
            <span>{t.restart}</span>
          </button>

          {/* Secondary Actions: Levels & Home */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenLevels();
              }}
              className="min-h-[44px] rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <Grid size={15} className="text-sky-400" />
              <span>{t.levels}</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onHome();
              }}
              className="min-h-[44px] rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <Home size={15} className="text-amber-400" />
              <span>{t.mainMenu}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
