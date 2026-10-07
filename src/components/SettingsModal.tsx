import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Eye,
  RotateCcw,
  X,
  HelpCircle,
  Globe,
} from 'lucide-react';
import { Language, UserProgress } from '../types/game';
import { soundEngine } from '../utils/audio';
import { TRANSLATIONS } from '../utils/i18n';

interface SettingsModalProps {
  progress: UserProgress;
  onUpdateSettings: (newSettings: UserProgress['settings']) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const lang = progress.settings.language || 'tr';
  const t = TRANSLATIONS[lang].settings;

  const toggleSound = () => {
    const nextVal = !progress.settings.sound;
    soundEngine.setSoundEnabled(nextVal);
    if (nextVal) soundEngine.playClick();
    onUpdateSettings({ ...progress.settings, sound: nextVal });
  };

  const toggleMusic = () => {
    soundEngine.playClick();
    const nextVal = !progress.settings.music;
    soundEngine.setMusicEnabled(nextVal);
    onUpdateSettings({ ...progress.settings, music: nextVal });
  };

  const toggleAimAssist = () => {
    soundEngine.playClick();
    const nextVal = !progress.settings.aimAssist;
    onUpdateSettings({ ...progress.settings, aimAssist: nextVal });
  };

  const setLanguage = (newLang: Language) => {
    soundEngine.playClick();
    onUpdateSettings({ ...progress.settings, language: newLang });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 p-5 shadow-2xl flex flex-col text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold tracking-tight text-slate-100">
            {showHowToPlay ? (lang === 'tr' ? 'NASIL OYNANIR?' : 'HOW TO PLAY') : t.title}
          </h3>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {showHowToPlay ? (
          <div className="py-4 space-y-3 max-h-[380px] overflow-y-auto text-xs text-slate-300 pr-1">
            {lang === 'tr' ? (
              <>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="font-bold text-sky-300 block mb-1">🎯 1. Hedef Al ve At</span>
                  <p>Parmağınızla veya farenizle hedef çizgisine yön verin. Bıraktığınızda top yukarı fırlar.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="font-bold text-purple-300 block mb-1">✨ 2. 3 veya Daha Fazla Eşleştir</span>
                  <p>Aynı renkteki en az 3 sevimli tüylüyü bir araya getirip büyük bir neşeyle patlatın!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="font-bold text-emerald-300 block mb-1">🎈 3. Bağlantısız Topları Düşür</span>
                  <p>Tavan bağlantısını kaybeden toplar yere dökülür ve her biri için +20 ekstra puan kazandırır!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="font-bold text-amber-300 block mb-1">🎨 4. Bukalemun & Özel Toplar</span>
                  <p>10. bölümden sonra gelen Renk Değiştiren Toplar, vurduğunuz topun rengine bürünür!</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="font-bold text-sky-300 block mb-1">🎯 1. Aim & Shoot</span>
                  <p>Drag finger or mouse to aim the trajectory guide. Release to shoot your fuzzy upwards.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="font-bold text-purple-300 block mb-1">✨ 2. Match 3 to Pop</span>
                  <p>Connect 3 or more fuzzies of the same color to pop them in a burst of joy!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="font-bold text-emerald-300 block mb-1">🎈 3. Drop Disconnected Balls</span>
                  <p>Any fuzzies detached from the ceiling will tumble down for +20 bonus score each!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="font-bold text-amber-300 block mb-1">🎨 4. Chameleon & Specials</span>
                  <p>After level 10, bonus Chameleon balls morph into whichever color you hit them with!</p>
                </div>
              </>
            )}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowHowToPlay(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-sky-300 mt-2 cursor-pointer"
            >
              {lang === 'tr' ? 'Ayarlara Dön' : 'Back to Settings'}
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            {/* Language Selection Section */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Globe size={15} className="text-sky-400" />
                <span>{t.language}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setLanguage('tr')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    lang === 'tr'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇹🇷 Türkçe</span>
                  {lang === 'tr' && <span className="text-[10px] bg-sky-400/20 text-sky-300 px-1 rounded">✓</span>}
                </button>

                <button
                  onClick={() => setLanguage('en')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🇬🇧 English</span>
                  {lang === 'en' && <span className="text-[10px] bg-sky-400/20 text-sky-300 px-1 rounded">✓</span>}
                </button>
              </div>
            </div>

            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2.5">
                {progress.settings.sound ? (
                  <Volume2 size={18} className="text-emerald-400" />
                ) : (
                  <VolumeX size={18} className="text-slate-500" />
                )}
                <span className="text-sm font-semibold text-slate-200">
                  {t.soundEffects}
                </span>
              </div>
              <button
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  progress.settings.sound ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    progress.settings.sound ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Music Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <Music
                  size={18}
                  className={progress.settings.music ? 'text-sky-400' : 'text-slate-500'}
                />
                <span className="text-sm font-semibold text-slate-200">
                  {t.music}
                </span>
              </div>
              <button
                onClick={toggleMusic}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  progress.settings.music ? 'bg-sky-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    progress.settings.music ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Aim Assist Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <Eye
                  size={18}
                  className={progress.settings.aimAssist ? 'text-amber-400' : 'text-slate-500'}
                />
                <span className="text-sm font-semibold text-slate-200">
                  {t.aimAssist}
                </span>
              </div>
              <button
                onClick={toggleAimAssist}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  progress.settings.aimAssist ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    progress.settings.aimAssist ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* How to Play Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowHowToPlay(true);
              }}
              className="w-full p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 flex items-center justify-between text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle size={16} />
                <span>{lang === 'tr' ? 'Nasıl Oynanır & İpuçları' : 'How to Play & Tips'}</span>
              </div>
              <span>›</span>
            </button>

            {/* Reset Progress Section */}
            <div className="pt-2">
              {showConfirmReset ? (
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                  <span className="text-xs text-rose-300 font-medium block text-center">
                    {t.confirmReset}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onResetProgress();
                        setShowConfirmReset(false);
                      }}
                      className="py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                    >
                      {lang === 'tr' ? 'Evet, Sıfırla' : 'Yes, Reset'}
                    </button>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setShowConfirmReset(false);
                      }}
                      className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      {lang === 'tr' ? 'İptal' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowConfirmReset(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-slate-800 hover:border-rose-900/60 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>{t.resetButton}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
