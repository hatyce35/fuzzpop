import React, { useEffect } from 'react';
import { RotateCcw, Grid, PlusCircle, FastForward, AlertTriangle } from 'lucide-react';
import { GameOverReason, Language } from '../types/game';
import { soundEngine } from '../utils/audio';
import { TRANSLATIONS } from '../utils/i18n';

interface GameOverModalProps {
  levelId: number;
  remainingBalls: number;
  totalBalls: number;
  score: number;
  language?: Language;
  reason?: GameOverReason;
  onReplay: () => void;
  onOpenLevels: () => void;
  onContinueWithShots: (extraShots: number) => void;
  onSkipLevel: () => void;
  hasNextLevel: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  levelId,
  remainingBalls,
  totalBalls,
  score,
  language = 'tr',
  reason = 'launcher_hit',
  onReplay,
  onOpenLevels,
  onContinueWithShots,
  onSkipLevel,
  hasNextLevel,
}) => {
  const t = TRANSLATIONS[language].gameOver;
  const cleared = Math.max(0, totalBalls - remainingBalls);

  // Play mournful sad game-over sound on appearance
  useEffect(() => {
    soundEngine.playGameOver();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-rose-500/30 p-6 shadow-2xl shadow-rose-950/30 flex flex-col items-center text-center text-white relative">
        {/* Sad, cute crying fuzzy mascot */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-700 via-pink-600 to-rose-400 border-4 border-slate-950 shadow-xl flex items-center justify-center relative overflow-hidden">
            {/* Sad eyes and mouth */}
            <div className="flex flex-col items-center justify-center pt-1">
              <div className="flex items-center gap-3">
                {/* Left teary eye */}
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-slate-950 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white -mt-1 -ml-1" />
                  </div>
                  {/* Tear drop left */}
                  <div className="absolute -bottom-3.5 left-1 w-2 h-3 bg-sky-300 rounded-b-full rounded-t-sm animate-bounce opacity-90 shadow-sm" />
                </div>
                {/* Right teary eye */}
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-slate-950 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white -mt-1 -ml-1" />
                  </div>
                  {/* Tear drop right */}
                  <div className="absolute -bottom-3.5 right-1 w-2 h-3 bg-sky-300 rounded-b-full rounded-t-sm animate-bounce opacity-90 shadow-sm delay-150" />
                </div>
              </div>
              {/* Sad curved mouth */}
              <div className="w-4 h-2 border-t-2 border-slate-950 rounded-t-full mt-2" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400 uppercase">
          {t.title}
        </h3>

        {/* Specific Reason Badge */}
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
          <AlertTriangle size={13} className="shrink-0 text-amber-400" />
          <span>{t.reasonText(reason)}</span>
        </div>

        <p className="text-xs font-semibold text-slate-300 mt-2">
          {t.subtitle(levelId, reason)}
        </p>

        {/* Status Card */}
        <div className="w-full py-3 px-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 my-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>{t.fuzziesCleared}</span>
            <span className="font-mono font-bold text-amber-300 tabular-nums">
              {cleared} / {totalBalls}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>{t.remainingOnBoard}</span>
            <span className="font-mono font-bold text-rose-300 tabular-nums">
              {remainingBalls} {t.left}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-700/40">
            <span>{t.currentScore}</span>
            <span className="font-mono font-bold text-slate-100 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          {/* Primary Action Button: TEKRAR DENE */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onReplay();
            }}
            className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 hover:from-rose-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-rose-950/40 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw size={19} className="text-slate-950 shrink-0" />
            <span>{t.replay}</span>
          </button>

          {/* Continue with +5 shots (if ran out of shots) */}
          {reason === 'out_of_shots' && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onContinueWithShots(5);
              }}
              className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle size={16} className="text-amber-400 shrink-0" />
              <span>{t.continueShots}</span>
            </button>
          )}

          {/* Bottom row: Skip Level & Level Select */}
          <div className={`grid ${hasNextLevel ? 'grid-cols-2' : 'grid-cols-1'} gap-2.5`}>
            {hasNextLevel && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onSkipLevel();
                }}
                className="min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                <FastForward size={15} />
                <span>{t.skipLevel(levelId + 1)}</span>
              </button>
            )}

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenLevels();
              }}
              className="min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-md"
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
