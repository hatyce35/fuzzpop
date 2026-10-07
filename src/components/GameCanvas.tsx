import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  COLOR_CONFIG,
  FallingFuzzy,
  FloatingText,
  FuzzyBall,
  FuzzyColor,
  GameOverReason,
  LevelConfig,
  PopParticle,
  Projectile,
  SpecialType,
  Language,
} from '../types/game';
import { soundEngine } from '../utils/audio';
import {
  calculateTrajectory,
  findDisconnectedFuzzies,
  findMatches,
  findNearestEmptySlot,
  getColsInRow,
  getNeighbors,
  getSlotCenter,
  GRID_COLS,
  MAX_GRID_ROWS,
} from '../utils/hexGrid';
import { drawFuzzyBall } from '../utils/renderFuzzy';

interface GameCanvasProps {
  level: LevelConfig;
  currentFuzzy: { color: FuzzyColor; special: SpecialType };
  nextFuzzy: { color: FuzzyColor; special: SpecialType };
  shotsRemaining: number;
  popsCount: number;
  onPopsUpdated: (newCount: number) => void;
  onShotsUpdated: (newShots: number) => void;
  onScoreUpdated: (addedScore: number) => void;
  onRemainingUpdated: (remaining: number, total: number) => void;
  onAdvanceFuzzy: (
    current: { color: FuzzyColor; special: SpecialType },
    activeColors?: FuzzyColor[],
    remainingCount?: number
  ) => void;
  onLevelComplete: (bonusScore: number) => void;
  onGameOver: (reason?: GameOverReason) => void;
  aimAssist?: boolean;
  isPaused?: boolean;
  language?: Language;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  currentFuzzy,
  nextFuzzy,
  shotsRemaining,
  popsCount,
  aimAssist = true,
  isPaused = false,
  language = 'tr',
  onPopsUpdated,
  onShotsUpdated,
  onScoreUpdated,
  onRemainingUpdated,
  onAdvanceFuzzy,
  onLevelComplete,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Responsive dimensions
  const [dimensions, setDimensions] = useState({ width: 380, height: 600 });

  // Grid & Ball state stored in refs for 60fps loop access without lag
  const gridRef = useRef<(FuzzyBall | null)[][]>([]);
  const projectileRef = useRef<Projectile | null>(null);
  const fallingFuzziesRef = useRef<FallingFuzzy[]>([]);
  const particlesRef = useRef<PopParticle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const isResolvingRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Aiming trajectory state
  const isAimingRef = useRef(false);
  const aimAngleRef = useRef<number>(-Math.PI / 2); // straight up by default
  const targetAimAngleRef = useRef<number>(-Math.PI / 2);
  const trajectoryRef = useRef<{
    path: { x: number; y: number }[];
    hit: { x: number; y: number };
    hitCeiling: boolean;
  } | null>(null);

  // Animation & Launcher State
  const animFrameRef = useRef<number | null>(null);
  const comboCountRef = useRef(1);
  const launcherRecoilRef = useRef(0);

  // References to props
  const currentFuzzyRef = useRef(currentFuzzy);
  const nextFuzzyRef = useRef(nextFuzzy);
  const shotsRemainingRef = useRef(shotsRemaining);
  const popsCountRef = useRef(popsCount);
  const levelRef = useRef(level);
  const isLevelResolvedRef = useRef(false);
  const initialBallsCountRef = useRef<number>(0);

  // Callback refs to decouple from effect re-runs
  const onScoreUpdatedRef = useRef(onScoreUpdated);
  const onPopsUpdatedRef = useRef(onPopsUpdated);
  const onShotsUpdatedRef = useRef(onShotsUpdated);
  const onRemainingUpdatedRef = useRef(onRemainingUpdated);
  const onLevelCompleteRef = useRef(onLevelComplete);
  const onGameOverRef = useRef(onGameOver);
  const onAdvanceFuzzyRef = useRef(onAdvanceFuzzy);
  const handleProjectileLandedRef = useRef<(slotR: number, slotC: number, proj: Projectile) => void>(() => {});

  // Sync props to refs
  currentFuzzyRef.current = currentFuzzy;
  nextFuzzyRef.current = nextFuzzy;
  shotsRemainingRef.current = shotsRemaining;
  popsCountRef.current = popsCount;
  levelRef.current = level;
  onScoreUpdatedRef.current = onScoreUpdated;
  onPopsUpdatedRef.current = onPopsUpdated;
  onShotsUpdatedRef.current = onShotsUpdated;
  onRemainingUpdatedRef.current = onRemainingUpdated;
  onLevelCompleteRef.current = onLevelComplete;
  onGameOverRef.current = onGameOver;
  onAdvanceFuzzyRef.current = onAdvanceFuzzy;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Clear all pending timeouts
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  // Initialize level grid from level layout
  const initLevelGrid = useCallback(() => {
    clearAllTimeouts();
    isLevelResolvedRef.current = false;
    isResolvingRef.current = false;
    projectileRef.current = null;
    fallingFuzziesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    comboCountRef.current = 1;

    let initialCount = 0;
    const newGrid: (FuzzyBall | null)[][] = [];
    for (let r = 0; r < MAX_GRID_ROWS; r++) {
      const rowCols = getColsInRow(r);
      const rowArr: (FuzzyBall | null)[] = [];
      const layoutRow = level.layout[r];

      for (let c = 0; c < rowCols; c++) {
        const item = layoutRow ? layoutRow[c] : null;
        if (item) {
          initialCount++;
          const isSpecial = ['rainbow', 'bomb', 'lightning', 'ice', 'wild'].includes(item);
          const color: FuzzyColor = isSpecial
            ? level.colors[Math.floor(Math.random() * level.colors.length)]
            : (item as FuzzyColor);
          const special: SpecialType = isSpecial ? (item as SpecialType) : 'none';

          rowArr.push({
            id: `fuzz_${r}_${c}_${Date.now()}_${Math.random()}`,
            row: r,
            col: c,
            color,
            special,
            iceHitsRemaining: special === 'ice' ? 2 : undefined,
            scale: 1,
            alpha: 1,
            rotation: 0,
            blinkTimer: Math.random() * 4 + 2,
            isBlinking: false,
            eyeOffset: { x: 0, y: 0 },
            expression: 'idle',
            seed: Math.random() * 50,
            lookTimer: Math.random() * 2.5 + 1,
          });
        } else {
          rowArr.push(null);
        }
      }
      newGrid.push(rowArr);
    }

    // User requested:
    // "10 uncu bölümden sonra 1 tane 15inci bölümden sonra 2 tane çıkmaya başlasın"
    // Level 11-15: 1 bonus color-changing chameleon ball
    // Level 16+: 2 bonus color-changing chameleon balls
    if (level.id > 10) {
      const chameleonCount = level.id > 15 ? 2 : 1;
      const candidates: { r: number; c: number }[] = [];
      for (let r = 1; r < Math.min(5, MAX_GRID_ROWS); r++) {
        const cols = getColsInRow(r);
        for (let c = 0; c < cols; c++) {
          const ball = newGrid[r]?.[c];
          if (ball && ball.special === 'none') {
            candidates.push({ r, c });
          }
        }
      }

      if (candidates.length > 0) {
        for (let i = 0; i < chameleonCount && candidates.length > 0; i++) {
          const pickIndex = (level.id * 11 + i * 17) % candidates.length;
          const { r, c } = candidates.splice(pickIndex, 1)[0];
          const targetBall = newGrid[r]?.[c];
          if (targetBall) {
            targetBall.special = 'chameleon';
          }
        }
      }
    }

    gridRef.current = newGrid;
    initialBallsCountRef.current = initialCount;
    onRemainingUpdatedRef.current(initialCount, initialCount);
  }, [level.id, level.colors, level.layout]);

  // Handle Responsive Resize for Mobile, Tablet, and Desktop
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.max(260, Math.floor(rect.width));
      const h = Math.max(380, Math.floor(rect.height));
      setDimensions({ width: w, height: h });
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      clearAllTimeouts();
    };
  }, []);

  // Compute Layout Metrics
  const radius = dimensions.width / (GRID_COLS * 2);
  const topMargin = radius * 0.9;
  const launcherX = dimensions.width / 2;
  const launcherY = dimensions.height - radius * 1.8;

  // Initialize or re-init ONLY when level ID changes (or on mount)
  useEffect(() => {
    initLevelGrid();
  }, [level.id, initLevelGrid]);

  // Update Trajectory Guide
  const updateTrajectory = useCallback(() => {
    if (projectileRef.current !== null || isResolvingRef.current || isLevelResolvedRef.current) {
      trajectoryRef.current = null;
      return;
    }

    const traj = calculateTrajectory(
      launcherX,
      launcherY,
      aimAngleRef.current,
      gridRef.current,
      dimensions.width,
      dimensions.height,
      radius,
      topMargin
    );
    trajectoryRef.current = traj;
  }, [launcherX, launcherY, dimensions.width, dimensions.height, radius, topMargin]);

  // Spawn Soft Pop Particles
  const spawnPopParticles = (x: number, y: number, color: FuzzyColor) => {
    const conf = '#F472B6';
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const spd = Math.random() * 2.2 + 1.2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: Math.random() * 3.5 + 2,
        color: conf,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 25 + 22,
        shape: i % 3 === 0 ? 'fur' : i % 3 === 1 ? 'sparkle' : 'circle',
      });
    }
  };

  // Add Floating Score Text
  const addFloatingScore = (text: string, x: number, y: number, color: string = '#FACC15') => {
    floatingTextsRef.current.push({
      id: `score_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      scale: 1,
      life: 0,
    });
  };

  // Check Game State (Win / Loss)
  const evaluateGameState = useCallback(() => {
    if (isLevelResolvedRef.current) return;

    // Count remaining active balls on the grid and check if any touch the launcher ball
    let remainingBalls = 0;
    let touchesLauncher = false;
    for (let r = 0; r < MAX_GRID_ROWS; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const b = gridRef.current[r]?.[c];
        if (b != null) {
          remainingBalls++;

          // Check if this ball touches or reaches the launcher ball at (launcherX, launcherY)
          const center = getSlotCenter(r, c, dimensions.width, radius, topMargin);
          const distToLauncher = Math.hypot(center.x - launcherX, center.y - launcherY);

          // Balls touch when distance between centers <= radius * 2.15
          // Or when the ball's bottom edge crosses into the launcher danger boundary
          if (distToLauncher <= radius * 2.15 || center.y + radius >= launcherY - radius * 0.4) {
            touchesLauncher = true;
            b.expression = 'dizzy';
          }
        }
      }
    }

    onRemainingUpdatedRef.current(remainingBalls, initialBallsCountRef.current);

    // 1. WIN CONDITION: ONLY when ALL balls on screen are cleared!
    if (remainingBalls === 0) {
      isLevelResolvedRef.current = true;
      soundEngine.playLevelComplete();
      // Gentle celebratory pause so player can enjoy cleared board
      const winTimer = setTimeout(() => {
        onLevelCompleteRef.current(shotsRemainingRef.current * 150); // shots bonus
      }, 700);
      timeoutsRef.current.push(winTimer);
      return;
    }

    // 2. LOSS CONDITION A: Balls reach/touch the launcher ball and didn't fall ("atılacak topa değiyor ve düşmüyorsa")
    if (touchesLauncher && projectileRef.current === null && !isResolvingRef.current) {
      isLevelResolvedRef.current = true;
      soundEngine.playGameOver();
      addFloatingScore(
        language === 'tr' ? 'TOPA DEĞDİ! 💥' : 'HIT LAUNCHER! 💥',
        launcherX,
        launcherY - radius * 1.6,
        '#F43F5E'
      );
      const loseTimer = setTimeout(() => {
        onGameOverRef.current('launcher_hit');
      }, 550);
      timeoutsRef.current.push(loseTimer);
      return;
    }

    // 3. LOSS CONDITION B: Out of shots and balls still remain, after all resolutions done
    if (shotsRemainingRef.current <= 0 && projectileRef.current === null && !isResolvingRef.current) {
      isLevelResolvedRef.current = true;
      soundEngine.playGameOver();
      const loseTimer = setTimeout(() => {
        onGameOverRef.current('out_of_shots');
      }, 500);
      timeoutsRef.current.push(loseTimer);
    }
  }, [
    dimensions.width,
    radius,
    topMargin,
    launcherX,
    launcherY,
    language,
  ]);

  // Helper to extract active colors currently remaining on the board
  const getActiveBoardColors = useCallback((): FuzzyColor[] => {
    const active = new Set<FuzzyColor>();
    for (let r = 0; r < MAX_GRID_ROWS; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const b = gridRef.current[r]?.[c];
        if (b) active.add(b.color);
      }
    }
    return Array.from(active);
  }, []);

  // Helper to count remaining balls
  const getRemainingBallsCount = useCallback((): number => {
    let count = 0;
    for (let r = 0; r < MAX_GRID_ROWS; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (gridRef.current[r]?.[c] != null) count++;
      }
    }
    return count;
  }, []);

  // Projectile Landed and Resolved with Calm, Organic Staged Transitions
  const handleProjectileLanded = useCallback(
    (slotR: number, slotC: number, proj: Projectile) => {
      soundEngine.playAttach();
      launcherRecoilRef.current = 4;
      projectileRef.current = null;
      isResolvingRef.current = true;

      // Fail-safe timeout so isResolvingRef is NEVER stuck
      const safetyTimer = setTimeout(() => {
        if (isResolvingRef.current) {
          isResolvingRef.current = false;
          projectileRef.current = null;
          updateTrajectory();
        }
      }, 1200);
      timeoutsRef.current.push(safetyTimer);

      const newBall: FuzzyBall = {
        id: `fuzz_${slotR}_${slotC}_${Date.now()}`,
        row: slotR,
        col: slotC,
        color: proj.color,
        special: proj.special,
        iceHitsRemaining: proj.special === 'ice' ? 2 : undefined,
        scale: 1.2, // cozy snuggle squash
        alpha: 1,
        rotation: 0,
        blinkTimer: Math.random() * 4 + 2,
        isBlinking: false,
        eyeOffset: { x: 0, y: 0 },
        expression: 'idle',
      };

      if (!gridRef.current[slotR]) {
        gridRef.current[slotR] = [];
      }
      gridRef.current[slotR][slotC] = newBall;

      // Chameleon Bonus Mechanic:
      // "hangi topa vurulunca o renge dönecek olan toplar"
      // Any chameleon ball adjacent to the hit landing slot morphs into the projectile's color!
      const neighbors = getNeighbors(slotR, slotC);
      let morphedAny = false;
      neighbors.forEach((n) => {
        const nb = gridRef.current[n.row]?.[n.col];
        if (nb && nb.special === 'chameleon') {
          nb.color = proj.color;
          nb.scale = 1.35;
          nb.expression = 'surprised';
          morphedAny = true;
          const center = getSlotCenter(n.row, n.col, dimensions.width, radius, topMargin);
          spawnPopParticles(center.x, center.y, proj.color);
          addFloatingScore(language === 'tr' ? 'RENK DEĞİŞTİ! 🎨' : 'MORPH! 🎨', center.x, center.y - 12, '#38BDF8');
        }
      });
      if (morphedAny) {
        soundEngine.playMorph();
      }

      // Decrement shots remaining
      const newShots = Math.max(0, shotsRemainingRef.current - 1);
      shotsRemainingRef.current = newShots;
      onShotsUpdatedRef.current(newShots);

      // Find Matches
      const matchResult = findMatches(slotR, slotC, gridRef.current);
      const matches = matchResult.matchedBalls;

      if (matches.length > 0) {
        // Staged Transition: Matching balls make a cute surprised gasp & bounce
        matches.forEach((b) => {
          const gridBall = gridRef.current[b.row]?.[b.col];
          if (gridBall) {
            gridBall.expression = 'surprised';
            gridBall.scale = 1.18;
          }
        });

        // Gentle, calm pause before popping (no sudden instant disappearance)
        const popTimer = setTimeout(() => {
          const combo = comboCountRef.current;
          comboCountRef.current += 1;

          if (matchResult.type === 'bomb') {
            soundEngine.playBomb();
          } else if (matchResult.type === 'lightning') {
            soundEngine.playLightning();
          } else {
            soundEngine.playPop(combo);
          }

          let totalPopped = 0;
          let avgX = 0;
          let avgY = 0;

          matches.forEach((ball) => {
            const center = getSlotCenter(ball.row, ball.col, dimensions.width, radius, topMargin);
            spawnPopParticles(center.x, center.y, ball.color);
            gridRef.current[ball.row][ball.col] = null;
            totalPopped++;
            avgX += center.x;
            avgY += center.y;
          });

          avgX /= totalPopped;
          avgY /= totalPopped;

          // Score: +10 per fuzzy + bonus for larger matches + combo
          const baseScore = totalPopped * 10;
          const largeBonus = totalPopped > 3 ? (totalPopped - 3) * 15 : 0;
          const comboBonus = combo > 1 ? (combo - 1) * 25 : 0;
          const totalScore = baseScore + largeBonus + comboBonus;

          onScoreUpdatedRef.current(totalScore);
          const newPopsCount = popsCountRef.current + totalPopped;
          popsCountRef.current = newPopsCount;
          onPopsUpdatedRef.current(newPopsCount);

          addFloatingScore(`+${totalScore}`, avgX, avgY - 10);
          if (combo > 1) {
            soundEngine.playCombo(combo);
            addFloatingScore(language === 'tr' ? `KOMBO x${combo}!` : `COMBO x${combo}!`, avgX, avgY - 30, '#38BDF8');
          }

          // Gentle delay before checking & dropping disconnected fuzzies
          const dropTimer = setTimeout(() => {
            const disconnected = findDisconnectedFuzzies(gridRef.current);
            if (disconnected.length > 0) {
              soundEngine.playDrop(disconnected.length);

              let dropScore = 0;
              disconnected.forEach((ball) => {
                const center = getSlotCenter(ball.row, ball.col, dimensions.width, radius, topMargin);
                gridRef.current[ball.row][ball.col] = null;

                fallingFuzziesRef.current.push({
                  x: center.x,
                  y: center.y,
                  vx: (Math.random() - 0.5) * 2.2, // soft, calm drift
                  vy: -1.2 - Math.random() * 0.8, // gentle upward puff
                  radius,
                  color: ball.color,
                  special: ball.special,
                  rotation: 0,
                  vRot: (Math.random() - 0.5) * 0.1, // gentle spin
                  alpha: 1,
                  bounceCount: 0,
                });

                dropScore += 20; // +20 per falling fuzzy
              });

              onScoreUpdatedRef.current(dropScore);
              const dropPopsCount = popsCountRef.current + disconnected.length;
              popsCountRef.current = dropPopsCount;
              onPopsUpdatedRef.current(dropPopsCount);

              addFloatingScore(language === 'tr' ? `+${dropScore} DÜŞTÜ!` : `+${dropScore} DROP!`, avgX, avgY + 20, '#4ADE80');
            }

            updateTrajectory();
            isResolvingRef.current = false;
            projectileRef.current = null;

            // Check win/loss
            evaluateGameState();
          }, 140);

          timeoutsRef.current.push(dropTimer);
        }, 220); // 220ms soft anticipation

        timeoutsRef.current.push(popTimer);
      } else {
        // No match made: reset combo multiplier and settle gently
        comboCountRef.current = 1;
        const settleTimer = setTimeout(() => {
          updateTrajectory();
          isResolvingRef.current = false;
          projectileRef.current = null;
          evaluateGameState();
        }, 150);
        timeoutsRef.current.push(settleTimer);
      }
    },
    [
      dimensions.width,
      radius,
      topMargin,
      updateTrajectory,
      evaluateGameState,
    ]
  );
  handleProjectileLandedRef.current = handleProjectileLanded;

  // Shoot Action - Fast, responsive, never blocked by stale resolving state
  const shoot = useCallback(() => {
    if (
      projectileRef.current !== null ||
      shotsRemainingRef.current <= 0 ||
      isLevelResolvedRef.current
    ) {
      return;
    }

    soundEngine.playShoot();

    // Snapshot the currently loaded fuzzy so the projectile carries its exact identity
    const firedFuzzy = currentFuzzyRef.current;

    // Fast, swift, responsive arcade flight speed
    const speed = 11.5;
    const vx = Math.cos(aimAngleRef.current) * speed;
    const vy = Math.sin(aimAngleRef.current) * speed;

    projectileRef.current = {
      x: launcherX,
      y: launcherY,
      vx,
      vy,
      radius,
      color: firedFuzzy.color,
      special: firedFuzzy.special,
      expression: 'aiming',
      rotation: 0,
      trail: [],
    };

    launcherRecoilRef.current = 6;

    // Immediately advance the launcher fuzzy so the next fuzzy rolls in smoothly!
    // The ball in the launcher will NEVER change color while waiting for a shot!
    onAdvanceFuzzyRef.current(
      nextFuzzyRef.current,
      getActiveBoardColors(),
      getRemainingBallsCount()
    );
  }, [
    launcherX,
    launcherY,
    radius,
    getActiveBoardColors,
    getRemainingBallsCount,
  ]);

  // Effortless, Natural Touch / Pointer Aiming (Tracks mouse movement continuously)
  const updateAimFromPointer = useCallback((px: number, py: number) => {
    const dx = px - launcherX;
    // If touching/moving in the play area (above launcher), aim directly at that point!
    // If touching near or below the launcher, use a comfortable upward baseline so thumb swipes turn smoothly!
    const dy = py < launcherY - 15 ? py - launcherY : -90;
    let angle = Math.atan2(dy, dx);

    // Clamp angle so it doesn't aim downwards into floor
    if (angle > -0.15) angle = -0.15;
    if (angle < -Math.PI + 0.15) angle = -Math.PI + 0.15;

    aimAngleRef.current = angle;
    targetAimAngleRef.current = angle;
    updateTrajectory();
  }, [launcherX, launcherY, updateTrajectory]);

  // Window pointermove listener so mouse cursor movement ALWAYS turns the launcher smoothly
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (projectileRef.current !== null || isLevelResolvedRef.current || isPausedRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Track if mouse is on or near the canvas
      if (px >= -80 && px <= rect.width + 80 && py >= -80 && py <= rect.height + 80) {
        updateAimFromPointer(px, py);
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
    };
  }, [updateAimFromPointer]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only block if a ball is actively flying in the air, level is resolved, or game is paused
    if (projectileRef.current !== null || isLevelResolvedRef.current || isPausedRef.current) return;

    // Reset resolving flag when player touches
    isResolvingRef.current = false;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    isAimingRef.current = true;
    updateAimFromPointer(px, py);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (projectileRef.current !== null || isLevelResolvedRef.current || isPausedRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    updateAimFromPointer(px, py);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (isPausedRef.current) return;
    if (!isAimingRef.current) return;
    isAimingRef.current = false;
    shoot();
  };

  // 60FPS Game Loop with High-DPI Razor-Sharp Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Canvas Scaling (Retina / OLED crystal-clear sharpness)
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.floor(dimensions.width * dpr);
    canvas.height = Math.floor(dimensions.height * dpr);
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = isPausedRef.current ? 0 : Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const timeSec = currentTime / 1000;
      // Normalized time factor for 60fps standard across all screen refresh rates
      const timeFactor = isPausedRef.current ? 0 : Math.min(dt * 60, 2.0);

      // Trajectory refresh when aiming
      if (isAimingRef.current && projectileRef.current === null && !isResolvingRef.current) {
        updateTrajectory();
      }

      // Apply High-DPI transform
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear Canvas & Fill Lush Forest/Meadow Gradient
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const meadowGrad = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      meadowGrad.addColorStop(0, '#052E16'); // Deep forest green at top
      meadowGrad.addColorStop(0.65, '#064E3B');
      meadowGrad.addColorStop(1, '#022C22'); // Rich deep earth green at bottom
      ctx.fillStyle = meadowGrad;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw Curving Meadow Grass Blades in Background (Calm gentle sway)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      const grassCount = 14;
      for (let g = 0; g < grassCount; g++) {
        const gx = (g / (grassCount - 1)) * dimensions.width;
        const wave = Math.sin(timeSec * 1.2 + g) * 6;
        ctx.beginPath();
        ctx.moveTo(gx, dimensions.height);
        ctx.quadraticCurveTo(
          gx + (g % 2 === 0 ? 25 : -25) + wave,
          dimensions.height * 0.65,
          gx + (g % 2 === 0 ? -15 : 15) + wave * 1.4,
          dimensions.height * 0.35
        );
        ctx.stroke();
      }

      // Draw Charming White Daisies on Sides of Slingshot
      const drawDaisy = (flowerX: number, flowerY: number, flowerScale: number) => {
        ctx.save();
        ctx.translate(flowerX, flowerY);
        ctx.scale(flowerScale, flowerScale);

        // White daisy petals
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        for (let p = 0; p < 10; p++) {
          const pAngle = (p / 10) * Math.PI * 2;
          ctx.beginPath();
          ctx.ellipse(Math.cos(pAngle) * 20, Math.sin(pAngle) * 20, 16, 7, pAngle, 0, Math.PI * 2);
          ctx.fill();
        }

        // Golden center
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(-2, -2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawDaisy(dimensions.width - 25, launcherY - 20, 0.9);
      drawDaisy(28, launcherY + 15, 0.7);

      // 1. Draw Subtle Wall Guides & Ceiling Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      // Left Guide
      ctx.beginPath();
      ctx.moveTo(radius, topMargin);
      ctx.lineTo(radius, dimensions.height - 80);
      ctx.stroke();

      // Right Guide
      ctx.beginPath();
      ctx.moveTo(dimensions.width - radius, topMargin);
      ctx.lineTo(dimensions.width - radius, dimensions.height - 80);
      ctx.stroke();

      // Ceiling Line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.setLineDash([]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(radius * 0.5, topMargin + radius * 0.4);
      ctx.lineTo(dimensions.width - radius * 0.5, topMargin + radius * 0.4);
      ctx.stroke();

      // Soft Danger Boundary Line above launcher
      const dangerBoundaryY = launcherY - radius * 1.35;
      ctx.save();
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.32)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(radius * 0.8, dangerBoundaryY);
      ctx.lineTo(dimensions.width - radius * 0.8, dangerBoundaryY);
      ctx.stroke();
      ctx.restore();

      // 2. Draw Aiming Trajectory (Luminous Pearl Dots & Pulsing Reticle)
      if (
        aimAssist !== false &&
        trajectoryRef.current &&
        projectileRef.current === null &&
        !isResolvingRef.current &&
        !isLevelResolvedRef.current
      ) {
        const { path } = trajectoryRef.current;

        // Draw soft glow guide line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2.0;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          if (i === 0) ctx.moveTo(path[i].x, path[i].y);
          else ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        const ballConf = COLOR_CONFIG[currentFuzzyRef.current.color] || COLOR_CONFIG.pink;

        // Draw bouncing reflection points with soft glowing rings matching ball color
        for (let i = 1; i < path.length - 1; i++) {
          const bp = path[i];
          ctx.fillStyle = ballConf.main;
          ctx.beginPath();
          ctx.arc(bp.x, bp.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Target Reticle at end of trajectory matching ball color
        const hit = path[path.length - 1];
        const pulse = Math.sin(timeSec * 6) * 2;
        ctx.strokeStyle = ballConf.main;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, radius * 0.72 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `${ballConf.main}44`;
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, radius * 0.72 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Grid Fuzzies
      for (let r = 0; r < MAX_GRID_ROWS; r++) {
        const cols = getColsInRow(r);
        for (let c = 0; c < cols; c++) {
          const ball = gridRef.current[r]?.[c];
          if (!ball) continue;

          // Update blinking
          ball.blinkTimer -= dt;
          if (ball.blinkTimer <= 0) {
            ball.isBlinking = true;
            if (ball.blinkTimer <= -0.15) {
              ball.isBlinking = false;
              ball.blinkTimer = Math.random() * 4.5 + 2.5;
            }
          }

          // Autonomous Lively Eye Glances (Calm, gentle glances)
          if (ball.lookTimer !== undefined) {
            ball.lookTimer -= dt;
            if (ball.lookTimer <= 0) {
              ball.lookTimer = Math.random() * 3.5 + 2.5;
              const glanceAngles = [0, Math.PI, -Math.PI / 2, Math.PI / 2, 0];
              const ga = glanceAngles[Math.floor(Math.random() * glanceAngles.length)];
              const dist = Math.random() > 0.4 ? 0.6 : 0;
              (ball as unknown as { targetEyeOffset: { x: number; y: number } }).targetEyeOffset = {
                x: Math.cos(ga) * dist,
                y: Math.sin(ga) * dist,
              };
            }

            // When aiming, fuzzies glance down at the slingshot launcher gently
            if (isAimingRef.current && r >= 2) {
              (ball as unknown as { targetEyeOffset: { x: number; y: number } }).targetEyeOffset = { x: 0, y: 0.8 };
            }

            const targetObj = (ball as unknown as { targetEyeOffset?: { x: number; y: number } }).targetEyeOffset;
            const targetX = targetObj ? targetObj.x : 0;
            const targetY = targetObj ? targetObj.y : 0;
            ball.eyeOffset.x += (targetX - ball.eyeOffset.x) * (dt * 2.2);
            ball.eyeOffset.y += (targetY - ball.eyeOffset.y) * (dt * 2.2);
          }

          // Gentle scale spring back to 1
          if (ball.scale > 1) {
            ball.scale = Math.max(1, ball.scale - dt * 1.2);
          }

          const center = getSlotCenter(r, c, dimensions.width, radius, topMargin);
          drawFuzzyBall({
            ctx,
            x: center.x,
            y: center.y,
            radius,
            color: ball.color,
            special: ball.special,
            expression: ball.expression,
            scale: ball.scale,
            alpha: ball.alpha,
            rotation: ball.rotation,
            isBlinking: ball.isBlinking,
            eyeOffset: ball.eyeOffset,
            time: timeSec,
            seed: ball.seed || (r * 13 + c * 7),
          });
        }
      }

      // 4. Update & Draw Projectile (Calm, Smooth, Steady Flight)
      const proj = projectileRef.current;
      if (proj) {
        // Add trail
        proj.trail.push({ x: proj.x, y: proj.y, alpha: 0.55 });
        if (proj.trail.length > 6) proj.trail.shift();

        // Draw trail
        proj.trail.forEach((t, idx) => {
          ctx.fillStyle = `rgba(255, 255, 255, ${t.alpha * (idx / proj.trail.length) * 0.35})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, radius * 0.38, 0, Math.PI * 2);
          ctx.fill();
        });

        // Track flight time (safety against getting stuck)
        proj.flightTime = (proj.flightTime || 0) + dt;
        if (proj.flightTime > 1.8) {
          const slot = findNearestEmptySlot(
            proj.x,
            proj.y,
            gridRef.current,
            dimensions.width,
            radius,
            topMargin
          );
          handleProjectileLandedRef.current(slot.row, slot.col, proj);
          return;
        }

        // Move projectile steadily with normalized timeFactor
        proj.x += proj.vx * timeFactor;
        proj.y += proj.vy * timeFactor;
        proj.rotation += 0.02 * timeFactor;

        // Wall Bounce: Left
        if (proj.x <= radius) {
          proj.x = radius;
          proj.vx = Math.abs(proj.vx);
          soundEngine.playWallBounce();
        }
        // Wall Bounce: Right
        else if (proj.x >= dimensions.width - radius) {
          proj.x = dimensions.width - radius;
          proj.vx = -Math.abs(proj.vx);
          soundEngine.playWallBounce();
        }

        // Collision Check: Ceiling
        if (proj.y <= topMargin + radius) {
          proj.y = topMargin + radius;
          const slot = findNearestEmptySlot(
            proj.x,
            proj.y,
            gridRef.current,
            dimensions.width,
            radius,
            topMargin
          );
          handleProjectileLandedRef.current(slot.row, slot.col, proj);
        }
        // Collision Check: Grid Balls
        else {
          let collided = false;
          for (let r = 0; r < MAX_GRID_ROWS; r++) {
            const cols = getColsInRow(r);
            for (let c = 0; c < cols; c++) {
              const ball = gridRef.current[r]?.[c];
              if (!ball) continue;

              const center = getSlotCenter(r, c, dimensions.width, radius, topMargin);
              const dx = center.x - proj.x;
              const dy = center.y - proj.y;
              const distSq = dx * dx + dy * dy;

              if (distSq <= (radius * 1.95) * (radius * 1.95)) {
                collided = true;
                break;
              }
            }
            if (collided) break;
          }

          if (collided) {
            const slot = findNearestEmptySlot(
              proj.x,
              proj.y,
              gridRef.current,
              dimensions.width,
              radius,
              topMargin
            );
            handleProjectileLandedRef.current(slot.row, slot.col, proj);
          }
        }

        // Draw Projectile
        drawFuzzyBall({
          ctx,
          x: proj.x,
          y: proj.y,
          radius,
          color: proj.color,
          special: proj.special,
          expression: 'aiming',
          rotation: proj.rotation,
          scale: 1.05,
          alpha: 1,
          time: timeSec,
        });
      }

      // 5. Update & Draw Falling Disconnected Fuzzies (Soft, floaty wool drop)
      for (let i = fallingFuzziesRef.current.length - 1; i >= 0; i--) {
        const f = fallingFuzziesRef.current[i];
        f.vy += 0.08 * timeFactor; // Soft, gentle wool gravity
        f.x += (f.vx * 0.95 + Math.sin(timeSec * 2.2 + i) * 0.22) * timeFactor;
        f.y += f.vy * timeFactor;
        f.rotation += f.vRot * 0.25 * timeFactor;

        // Gentle bounce off bottom floor
        if (f.y >= dimensions.height - radius && f.bounceCount < 2) {
          f.y = dimensions.height - radius;
          f.vy = -f.vy * 0.35;
          f.bounceCount++;
        }

        if (f.y > dimensions.height + radius * 2) {
          fallingFuzziesRef.current.splice(i, 1);
          continue;
        }

        drawFuzzyBall({
          ctx,
          x: f.x,
          y: f.y,
          radius: f.radius,
          color: f.color,
          special: f.special,
          expression: 'falling',
          rotation: f.rotation,
          scale: 1,
          alpha: f.alpha,
          time: timeSec,
        });
      }

      // 6. Update & Draw Pop Particles (Soft fluff drifting)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += timeFactor;
        p.x += p.vx * 0.65 * timeFactor;
        p.y += p.vy * 0.65 * timeFactor;
        p.vy += 0.05 * timeFactor;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 7. Update & Draw Floating Score Text
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.life += dt;
        ft.y -= dt * 22; // gentle float
        ft.alpha = Math.max(0, 1 - ft.life / 1.1);

        if (ft.life >= 1.1) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 16px "Fredoka", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 8. Draw Wooden Slingshot Launcher
      if (launcherRecoilRef.current > 0) {
        launcherRecoilRef.current = Math.max(0, launcherRecoilRef.current - dt * 10);
      }

      const launchVisualY = launcherY + launcherRecoilRef.current;
      const forkWidth = radius * 1.5;
      const forkHeight = radius * 1.2;

      // Wooden Slingshot Left & Right Prongs (Y-fork)
      ctx.save();
      ctx.lineWidth = radius * 0.28;
      ctx.strokeStyle = '#78350F';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Left prong
      ctx.beginPath();
      ctx.moveTo(launcherX, launchVisualY + forkHeight * 0.9);
      ctx.quadraticCurveTo(
        launcherX - forkWidth * 0.6,
        launchVisualY + forkHeight * 0.4,
        launcherX - forkWidth * 0.95,
        launchVisualY - forkHeight * 0.3
      );
      ctx.stroke();

      // Right prong
      ctx.beginPath();
      ctx.moveTo(launcherX, launchVisualY + forkHeight * 0.9);
      ctx.quadraticCurveTo(
        launcherX + forkWidth * 0.6,
        launchVisualY + forkHeight * 0.4,
        launcherX + forkWidth * 0.95,
        launchVisualY - forkHeight * 0.3
      );
      ctx.stroke();

      // Slingshot Base Handle
      ctx.lineWidth = radius * 0.35;
      ctx.beginPath();
      ctx.moveTo(launcherX, launchVisualY + forkHeight * 0.7);
      ctx.lineTo(launcherX, launchVisualY + forkHeight * 1.6);
      ctx.stroke();

      // Golden wood highlights
      ctx.lineWidth = radius * 0.1;
      ctx.strokeStyle = '#D97706';
      ctx.beginPath();
      ctx.moveTo(launcherX - forkWidth * 0.9, launchVisualY - forkHeight * 0.25);
      ctx.quadraticCurveTo(
        launcherX - forkWidth * 0.55,
        launchVisualY + forkHeight * 0.35,
        launcherX,
        launchVisualY + forkHeight * 0.8
      );
      ctx.stroke();

      // Elastic sling band (holding the ball)
      ctx.strokeStyle = '#F472B6';
      ctx.lineWidth = radius * 0.16;
      ctx.beginPath();
      ctx.moveTo(launcherX - forkWidth * 0.9, launchVisualY - forkHeight * 0.2);
      ctx.quadraticCurveTo(
        launcherX,
        launchVisualY + radius * 0.5,
        launcherX + forkWidth * 0.9,
        launchVisualY - forkHeight * 0.2
      );
      ctx.stroke();

      // Directional Launch Arrow (Sleek, glowing, smooth)
      if (
        projectileRef.current === null &&
        shotsRemainingRef.current > 0 &&
        !isLevelResolvedRef.current &&
        !isResolvingRef.current
      ) {
        ctx.save();
        ctx.translate(launcherX, launchVisualY);
        ctx.rotate(aimAngleRef.current + Math.PI / 2);

        // Directional glowing arrow pointer with vibrant gradient
        const arrowLen = radius * 1.65;
        const arrowGrad = ctx.createLinearGradient(0, -arrowLen - radius * 0.6, 0, 0);
        arrowGrad.addColorStop(0, '#FB7185'); // Bright rose
        arrowGrad.addColorStop(0.5, '#F43F5E'); // Rich coral rose
        arrowGrad.addColorStop(1, '#E11D48'); // Deep crimson

        ctx.fillStyle = arrowGrad;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.2;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        // Arrow head
        ctx.moveTo(0, -arrowLen - radius * 0.65);
        ctx.lineTo(-radius * 0.44, -arrowLen);
        ctx.lineTo(-radius * 0.17, -arrowLen);
        // Shaft
        ctx.lineTo(-radius * 0.17, -radius * 0.85);
        ctx.lineTo(radius * 0.17, -radius * 0.85);
        ctx.lineTo(radius * 0.17, -arrowLen);
        ctx.lineTo(radius * 0.44, -arrowLen);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner highlight shine on arrow shaft
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.rect(-radius * 0.08, -arrowLen + radius * 0.1, radius * 0.16, arrowLen * 0.7);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      // Draw Current Fuzzy in Launcher (if not currently shooting)
      if (projectileRef.current === null && shotsRemainingRef.current > 0 && !isLevelResolvedRef.current) {
        // Eye offset towards aiming direction
        const eyeDx = Math.cos(aimAngleRef.current);
        const eyeDy = Math.sin(aimAngleRef.current);

        drawFuzzyBall({
          ctx,
          x: launcherX,
          y: launchVisualY,
          radius,
          color: currentFuzzyRef.current.color,
          special: currentFuzzyRef.current.special,
          expression: isAimingRef.current ? 'aiming' : 'idle',
          scale: 1.05,
          alpha: 1,
          eyeOffset: { x: eyeDx, y: eyeDy },
          time: timeSec,
          seed: 42,
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [dimensions, radius, topMargin, launcherX, launcherY]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 w-full max-w-md mx-auto flex items-center justify-center overflow-hidden touch-none"
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="block cursor-crosshair active:cursor-grabbing select-none"
      />
    </div>
  );
};
