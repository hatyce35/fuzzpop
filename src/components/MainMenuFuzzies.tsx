import React, { useEffect, useRef } from 'react';
import { drawFuzzyBall } from '../utils/renderFuzzy';
import { FuzzyColor } from '../types/game';

interface FuzzyCharacterState {
  color: FuzzyColor;
  xRatio: number;
  yBaseRatio: number;
  radius: number;
  blinkTimer: number;
  isBlinking: boolean;
  lookTimer: number;
  eyeOffset: { x: number; y: number };
  targetEyeOffset: { x: number; y: number };
  bobSpeed: number;
  bobPhase: number;
  bobAmplitude: number;
  seed: number;
}

export const MainMenuFuzzies: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Characters: Green (Left), Blue (Center Hero), Yellow (Right)
    const characters: FuzzyCharacterState[] = [
      {
        color: 'green',
        xRatio: 0.22,
        yBaseRatio: 0.58,
        radius: 36,
        blinkTimer: Math.random() * 3 + 1,
        isBlinking: false,
        lookTimer: Math.random() * 2 + 1,
        eyeOffset: { x: 0, y: 0 },
        targetEyeOffset: { x: -0.4, y: 0 },
        bobSpeed: 2.1,
        bobPhase: 0,
        bobAmplitude: 4.5,
        seed: 12,
      },
      {
        color: 'blue',
        xRatio: 0.5,
        yBaseRatio: 0.48,
        radius: 46, // Center hero, slightly bigger
        blinkTimer: Math.random() * 3 + 2,
        isBlinking: false,
        lookTimer: Math.random() * 2 + 1.5,
        eyeOffset: { x: 0, y: 0 },
        targetEyeOffset: { x: 0, y: 0 },
        bobSpeed: 2.5,
        bobPhase: 1.2,
        bobAmplitude: 6.0,
        seed: 45,
      },
      {
        color: 'yellow',
        xRatio: 0.78,
        yBaseRatio: 0.58,
        radius: 36,
        blinkTimer: Math.random() * 3 + 1.5,
        isBlinking: false,
        lookTimer: Math.random() * 2 + 1,
        eyeOffset: { x: 0, y: 0 },
        targetEyeOffset: { x: 0.4, y: 0 },
        bobSpeed: 2.0,
        bobPhase: 2.5,
        bobAmplitude: 4.5,
        seed: 78,
      },
    ];

    let animId: number;
    let lastTime = performance.now();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handlePointerLeave = () => {
      mousePosRef.current = null;
    };

    window.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseleave', handlePointerLeave);

    const render = (timeMs: number) => {
      const dt = Math.min((timeMs - lastTime) / 1000, 0.1);
      lastTime = timeMs;
      const timeSec = timeMs / 1000;

      // Handle Resize / High-DPI
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const width = canvas.clientWidth || 320;
      const height = canvas.clientHeight || 140;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Draw each character
      characters.forEach((char) => {
        // Update Blinking
        char.blinkTimer -= dt;
        if (char.blinkTimer <= 0) {
          char.isBlinking = true;
          if (char.blinkTimer <= -0.16) {
            char.isBlinking = false;
            char.blinkTimer = Math.random() * 3.5 + 2.0;
          }
        }

        // Update Eye Looking Around Animations
        char.lookTimer -= dt;
        if (char.lookTimer <= 0) {
          char.lookTimer = Math.random() * 2.5 + 1.5;
          // Random glance targets: looking left, right, slightly up/down, or directly at user
          const glances = [
            { x: -0.5, y: -0.1 },
            { x: 0.5, y: -0.1 },
            { x: 0, y: -0.3 },
            { x: 0, y: 0.2 },
            { x: -0.3, y: 0.3 },
            { x: 0.3, y: 0.3 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
          ];
          char.targetEyeOffset = glances[Math.floor(Math.random() * glances.length)];
        }

        // If mouse is near, center character tracks mouse cursor!
        const posX = width * char.xRatio;
        const posY = height * char.yBaseRatio + Math.sin(timeSec * char.bobSpeed + char.bobPhase) * char.bobAmplitude;

        if (mousePosRef.current && char.color === 'blue') {
          const dx = mousePosRef.current.x - posX;
          const dy = mousePosRef.current.y - posY;
          const dist = Math.hypot(dx, dy);
          if (dist > 5) {
            char.targetEyeOffset = {
              x: Math.max(-0.65, Math.min(0.65, dx / 140)),
              y: Math.max(-0.55, Math.min(0.55, dy / 140)),
            };
          }
        }

        // Smooth eye lerp
        char.eyeOffset.x += (char.targetEyeOffset.x - char.eyeOffset.x) * Math.min(1, dt * 8);
        char.eyeOffset.y += (char.targetEyeOffset.y - char.eyeOffset.y) * Math.min(1, dt * 8);

        // Soft ambient floor shadow beneath fuzzy
        const shadowY = posY + char.radius * 0.92;
        const shadowGrad = ctx.createRadialGradient(posX, shadowY, 2, posX, shadowY, char.radius * 0.85);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(posX, shadowY, char.radius * 0.75, char.radius * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw fuzzy character
        drawFuzzyBall({
          ctx,
          x: posX,
          y: posY,
          radius: char.radius,
          color: char.color,
          isBlinking: char.isBlinking,
          eyeOffset: char.eyeOffset,
          expression: 'idle',
          time: timeSec,
          seed: char.seed,
        });
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-[340px] h-[145px] mx-auto relative mb-4 select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
