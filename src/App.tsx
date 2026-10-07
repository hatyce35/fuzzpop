import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameOverModal } from './components/GameOverModal';
import { HeaderHUD } from './components/HeaderHUD';
import { LauncherControl } from './components/LauncherControl';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelect } from './components/LevelSelect';
import { MainMenu } from './components/MainMenu';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { LEVELS } from './data/levels';
import { FuzzyColor, GameOverReason, SpecialType, UserProgress } from './types/game';
import { soundEngine } from './utils/audio';
import { loadUserProgress, recordLevelSuccess, resetAllProgress, saveUserProgress, unlockLevel } from './utils/storage';
import { getLocalizedLevel } from './utils/i18n';

type AppView = 'MENU' | 'LEVEL_SELECT' | 'GAME';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);
  const [view, setView] = useState<AppView>('MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Gameplay state
  const [score, setScore] = useState<number>(0);
  const [popsCount, setPopsCount] = useState<number>(0);
  const [shotsRemaining, setShotsRemaining] = useState<number>(28);
  const [remainingBalls, setRemainingBalls] = useState<number>(0);
  const [totalBalls, setTotalBalls] = useState<number>(0);

  const [currentFuzzy, setCurrentFuzzy] = useState<{ color: FuzzyColor; special: SpecialType }>({
    color: 'purple',
    special: 'none',
  });
  const [nextFuzzy, setNextFuzzy] = useState<{ color: FuzzyColor; special: SpecialType }>({
    color: 'blue',
    special: 'none',
  });

  // Modals
  const [showPause, setShowPause] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLevelComplete, setShowLevelComplete] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>('launcher_hit');
  const [earnedStars, setEarnedStars] = useState<number>(0);

  const currentLang = progress.settings.language || 'tr';
  const baseLevelConfig = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  const levelConfig = useMemo(
    () => getLocalizedLevel(baseLevelConfig, currentLang),
    [baseLevelConfig, currentLang]
  );

  // Helper to generate a smart fuzzy for the current level (prioritizes remaining board colors!)
  const generateSmartFuzzy = useCallback(
    (
      colors: FuzzyColor[],
      levelId: number,
      activeColors?: FuzzyColor[],
      remainingCount?: number
    ): { color: FuzzyColor; special: SpecialType } => {
      // Use active board colors if provided and non-empty
      const candidateColors = activeColors && activeColors.length > 0 ? activeColors : colors;

      let chosenColor: FuzzyColor;

      // RULE: When down to the last balls (<= 12 remaining) OR in early levels (<= 14),
      // give 100% ONLY colors that actually exist on the board!
      if ((remainingCount !== undefined && remainingCount <= 12) || levelId <= 14) {
        chosenColor = candidateColors[Math.floor(Math.random() * candidateColors.length)];
      } else {
        // In later levels with many balls: 85% chance to pick from active remaining colors
        if (Math.random() < 0.85) {
          chosenColor = candidateColors[Math.floor(Math.random() * candidateColors.length)];
        } else {
          chosenColor = colors[Math.floor(Math.random() * colors.length)];
        }
      }

      // Special fuzzy probability from level 8 onward (gentle rainbow/bomb chance)
      let special: SpecialType = 'none';
      if (levelId >= 8 && Math.random() < 0.12) {
        const specials: SpecialType[] = ['rainbow', 'bomb'];
        if (levelId >= 16) specials.push('lightning');
        if (levelId >= 21) specials.push('wild');
        special = specials[Math.floor(Math.random() * specials.length)];
      }

      return { color: chosenColor, special };
    },
    []
  );

  // Start / Reset a specific level
  const startLevel = useCallback(
    (levelId: number) => {
      const lvl = LEVELS.find((l) => l.id === levelId) || LEVELS[0];
      setCurrentLevelId(levelId);
      setScore(0);
      setPopsCount(0);
      setShotsRemaining(lvl.shotsLimit);

      // Count starting balls
      let initialCount = 0;
      lvl.layout.forEach((row) => {
        row.forEach((cell) => {
          if (cell !== null) initialCount++;
        });
      });
      setTotalBalls(initialCount);
      setRemainingBalls(initialCount);

      setCurrentFuzzy(generateSmartFuzzy(lvl.colors, levelId));
      setNextFuzzy(generateSmartFuzzy(lvl.colors, levelId));
      setShowPause(false);
      setShowLevelComplete(false);
      setShowGameOver(false);
      setView('GAME');
    },
    [generateSmartFuzzy]
  );

  // Initialize Audio settings on mount
  useEffect(() => {
    soundEngine.setSoundEnabled(progress.settings.sound);
    soundEngine.setMusicEnabled(progress.settings.music);
    if (progress.settings.music) {
      soundEngine.startMusic();
    }
  }, [progress.settings.sound, progress.settings.music]);

  // Advance fuzzy after shoot with active colors from board
  const handleAdvanceFuzzy = useCallback(
    (
      newCurrent: { color: FuzzyColor; special: SpecialType },
      activeColors?: FuzzyColor[],
      remainingCount?: number
    ) => {
      setCurrentFuzzy(newCurrent);
      setNextFuzzy(generateSmartFuzzy(baseLevelConfig.colors, currentLevelId, activeColors, remainingCount));
    },
    [generateSmartFuzzy, baseLevelConfig.colors, currentLevelId]
  );

  // Swap current & next fuzzy cleanly
  const handleSwapFuzzies = useCallback(() => {
    soundEngine.playClick();
    setCurrentFuzzy(nextFuzzy);
    setNextFuzzy(currentFuzzy);
  }, [currentFuzzy, nextFuzzy]);

  // Handle Score update
  const handleScoreUpdated = useCallback((added: number) => {
    setScore((prev) => prev + added);
  }, []);

  // Handle Pops count update
  const handlePopsUpdated = useCallback((newCount: number) => {
    setPopsCount(newCount);
  }, []);

  // Handle Shots update
  const handleShotsUpdated = useCallback((remaining: number) => {
    setShotsRemaining(remaining);
  }, []);

  // Handle Remaining balls update
  const handleRemainingUpdated = useCallback((rem: number, tot: number) => {
    setRemainingBalls(rem);
    setTotalBalls(tot);
  }, []);

  // Handle Level Complete
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Handle Level Complete
  const handleLevelComplete = useCallback(
    (bonusScore: number) => {
      const finalScore = scoreRef.current + bonusScore;
      setScore(finalScore);

      let stars = 1;
      if (finalScore >= levelConfig.starThresholds[2]) {
        stars = 3;
      } else if (finalScore >= levelConfig.starThresholds[1]) {
        stars = 2;
      }
      setEarnedStars(stars);

      const updated = recordLevelSuccess(currentLevelId, finalScore, stars);
      setProgress(updated);
      setShowLevelComplete(true);
    },
    [levelConfig, currentLevelId]
  );

  // Handle Game Over
  const handleGameOver = useCallback((reason: GameOverReason = 'launcher_hit') => {
    setGameOverReason(reason);
    soundEngine.playGameOver();
    setShowGameOver(true);
  }, []);

  // Skip level (advances directly to next level)
  const handleSkipLevel = useCallback(() => {
    soundEngine.playClick();
    if (currentLevelId < 30) {
      const updated = unlockLevel(currentLevelId + 1);
      setProgress(updated);
      startLevel(currentLevelId + 1);
    } else {
      setView('LEVEL_SELECT');
    }
  }, [currentLevelId, startLevel]);

  // Continue with +5 extra shots on Game Over
  const handleContinueWithShots = useCallback((extraShots: number) => {
    soundEngine.playClick();
    setShotsRemaining((prev) => prev + extraShots);
    setShowGameOver(false);
  }, []);

  // Sound & Music toggles for pause modal
  const handleToggleSound = useCallback(() => {
    const nextSound = !progress.settings.sound;
    const updated = {
      ...progress,
      settings: { ...progress.settings, sound: nextSound },
    };
    setProgress(updated);
    saveUserProgress(updated);
    soundEngine.setSoundEnabled(nextSound);
  }, [progress]);

  const handleToggleMusic = useCallback(() => {
    const nextMusic = !progress.settings.music;
    const updated = {
      ...progress,
      settings: { ...progress.settings, music: nextMusic },
    };
    setProgress(updated);
    saveUserProgress(updated);
    soundEngine.setMusicEnabled(nextMusic);
    if (nextMusic) {
      soundEngine.startMusic();
    } else {
      soundEngine.stopMusic();
    }
  }, [progress]);

  // Keyboard shortcut listener: Escape or P to pause/resume
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (view === 'GAME' && !showLevelComplete && !showGameOver && !showSettings) {
          setShowPause((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, showLevelComplete, showGameOver, showSettings]);

  // Settings update
  const handleUpdateSettings = (newSettings: UserProgress['settings']) => {
    const updated = { ...progress, settings: newSettings };
    setProgress(updated);
    saveUserProgress(updated);
  };

  // Reset progress
  const handleResetProgress = () => {
    const fresh = resetAllProgress();
    setProgress(fresh);
    setCurrentLevelId(1);
    setView('MENU');
    setShowSettings(false);
  };

  return (
    <div className="relative w-full h-[100dvh] flex items-center justify-center bg-slate-950 overflow-hidden font-['Fredoka',sans-serif] select-none">
      {/* Background Ambience: Subtle Pastel Gradient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(15,23,42,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_120%,rgba(217,70,239,0.12),rgba(15,23,42,0))]" />

      {/* Responsive Game Container: Seamless on phones, tablets, and desktop */}
      <main className="relative w-full max-w-md sm:max-w-lg md:max-w-[480px] h-full sm:h-[96dvh] sm:max-h-[920px] flex flex-col justify-between overflow-hidden shadow-2xl bg-slate-950/70 backdrop-blur-sm sm:border sm:border-slate-800/80 sm:rounded-3xl">
        {/* VIEW: MAIN MENU */}
        {view === 'MENU' && (
          <MainMenu
            progress={progress}
            onPlay={() => startLevel(progress.unlockedLevel)}
            onOpenLevels={() => setView('LEVEL_SELECT')}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* VIEW: LEVEL SELECT */}
        {view === 'LEVEL_SELECT' && (
          <LevelSelect
            progress={progress}
            onSelectLevel={(lvlId) => startLevel(lvlId)}
            onBackToMenu={() => setView('MENU')}
          />
        )}

        {/* VIEW: GAMEPLAY */}
        {view === 'GAME' && (
          <div className="relative flex-1 w-full flex flex-col h-full overflow-hidden select-none">
            {/* Top HUD */}
            <HeaderHUD
              level={levelConfig}
              score={score}
              remainingBalls={remainingBalls}
              totalBalls={totalBalls}
              shotsRemaining={shotsRemaining}
              language={currentLang}
              onRestart={() => startLevel(currentLevelId)}
              onOpenSettings={() => setShowSettings(true)}
              onPause={() => setShowPause(true)}
              onHome={() => setView('MENU')}
              onSkipLevel={currentLevelId < 30 ? handleSkipLevel : undefined}
            />

            {/* Game Canvas Area */}
            <GameCanvas
              key={`game_level_${currentLevelId}`}
              level={levelConfig}
              aimAssist={progress.settings.aimAssist}
              isPaused={showPause || showSettings}
              language={currentLang}
              onPopsUpdated={handlePopsUpdated}
              onScoreUpdated={handleScoreUpdated}
              onShotsUpdated={handleShotsUpdated}
              onRemainingUpdated={handleRemainingUpdated}
              onLevelComplete={handleLevelComplete}
              onGameOver={handleGameOver}
              currentFuzzy={currentFuzzy}
              nextFuzzy={nextFuzzy}
              onAdvanceFuzzy={handleAdvanceFuzzy}
              shotsRemaining={shotsRemaining}
              popsCount={popsCount}
            />

            {/* Bottom Launcher Control */}
            <LauncherControl
              currentFuzzy={currentFuzzy}
              nextFuzzy={nextFuzzy}
              shotsRemaining={shotsRemaining}
              language={currentLang}
              onSwapFuzzies={handleSwapFuzzies}
              isShooting={false}
            />
          </div>
        )}

        {/* MODAL: PAUSE */}
        {showPause && (
          <PauseModal
            levelId={currentLevelId}
            score={score}
            settings={progress.settings}
            onResume={() => setShowPause(false)}
            onRestart={() => {
              setShowPause(false);
              startLevel(currentLevelId);
            }}
            onOpenLevels={() => {
              setShowPause(false);
              setView('LEVEL_SELECT');
            }}
            onHome={() => {
              setShowPause(false);
              setView('MENU');
            }}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* MODAL: LEVEL COMPLETE */}
        {showLevelComplete && (
          <LevelCompleteModal
            levelId={currentLevelId}
            score={score}
            stars={earnedStars}
            language={currentLang}
            onNextLevel={() => {
              if (currentLevelId < 30) {
                startLevel(currentLevelId + 1);
              } else {
                setView('LEVEL_SELECT');
              }
            }}
            onReplay={() => startLevel(currentLevelId)}
            onOpenLevels={() => {
              setShowLevelComplete(false);
              setView('LEVEL_SELECT');
            }}
            hasNextLevel={currentLevelId < 30}
          />
        )}

        {/* MODAL: GAME OVER */}
        {showGameOver && (
          <GameOverModal
            levelId={currentLevelId}
            remainingBalls={remainingBalls}
            totalBalls={totalBalls}
            score={score}
            language={currentLang}
            reason={gameOverReason}
            onReplay={() => startLevel(currentLevelId)}
            onOpenLevels={() => {
              setShowGameOver(false);
              setView('LEVEL_SELECT');
            }}
            onContinueWithShots={handleContinueWithShots}
            onSkipLevel={handleSkipLevel}
            hasNextLevel={currentLevelId < 30}
          />
        )}

        {/* MODAL: SETTINGS */}
        {showSettings && (
          <SettingsModal
            progress={progress}
            onUpdateSettings={handleUpdateSettings}
            onResetProgress={handleResetProgress}
            onClose={() => setShowSettings(false)}
          />
        )}
      </main>
    </div>
  );
}
