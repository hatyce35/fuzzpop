import {
  COLOR_CONFIG,
  FuzzyColor,
  FuzzyExpression,
  SpecialType,
} from '../types/game';

interface DrawFuzzyOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  radius: number;
  color: FuzzyColor;
  special?: SpecialType;
  expression?: FuzzyExpression;
  rotation?: number;
  scale?: number;
  alpha?: number;
  isBlinking?: boolean;
  eyeOffset?: { x: number; y: number };
  time?: number;
  seed?: number;
}

/**
 * Procedurally renders an ultra-gorgeous, premium plush pom-pom character:
 * - Rich 3D velvet sphere lighting with soft ambient occlusion drop shadow
 * - Overlapping dense rounded fur petals / cloud puffs (no thin wire lines!)
 * - Adorable plush bunny/bear ear fluffs with pastel inner cushions
 * - Jewel-like anime eyes with triple gloss catchlights and curved lashes
 * - Soft airbrushed rosy blush cheeks with sparkle highlights
 * - Sweet expressive chibi mouth with tiny pink tongue
 * - Silky specular sheen arc on top rim for touchable, tactile depth
 */
export function drawFuzzyBall(options: DrawFuzzyOptions): void {
  const {
    ctx,
    x,
    y,
    radius,
    color,
    special = 'none',
    expression = 'idle',
    rotation = 0,
    scale = 1,
    alpha = 1,
    isBlinking = false,
    eyeOffset = { x: 0, y: 0 },
    time = 0,
    seed = 0,
  } = options;

  if (alpha <= 0.01) return;

  const conf = COLOR_CONFIG[color] || COLOR_CONFIG.pink;
  const r = radius * scale;

  // Gentle, soothing living breathing cycle
  const breatheCycle = Math.sin(time * 1.5 + seed * 1.6);
  const breathStretchY = breatheCycle * 0.022;
  const breathSquashX = -breathStretchY * 0.7;

  ctx.save();
  ctx.translate(x, y);

  // --- 0. Soft Ambient Occlusion Drop Shadow on Ground ---
  ctx.save();
  ctx.scale(1, 0.36);
  const shadowGrad = ctx.createRadialGradient(0, (r * 1.7) / 0.36, 0, 0, (r * 1.7) / 0.36, r * 0.85);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.32)');
  shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.16)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.arc(0, (r * 1.7) / 0.36, r * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Subtle natural living micro-sway
  ctx.rotate(rotation + Math.sin(time * 1.2 + seed * 2) * 0.012);
  ctx.scale(1 + breathSquashX, 1 + breathStretchY);
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Dynamic colors for specials
  let mainColor = conf.main;
  let darkColor = conf.dark;
  let lightColor = conf.light;
  let fringeColor = conf.furFringe;

  if (special === 'bomb') {
    mainColor = '#475569';
    darkColor = '#0F172A';
    lightColor = '#94A3B8';
    fringeColor = '#64748B';
  } else if (special === 'rainbow') {
    const hue = (time * 50 + seed * 30) % 360;
    mainColor = `hsl(${hue}, 85%, 60%)`;
    darkColor = `hsl(${hue}, 90%, 40%)`;
    lightColor = `hsl(${hue}, 95%, 85%)`;
    fringeColor = `hsl(${hue}, 85%, 72%)`;
  } else if (special === 'chameleon') {
    // Opalescent morphing color cycle
    const hue = (time * 45 + seed * 50) % 360;
    mainColor = `hsl(${hue}, 80%, 55%)`;
    darkColor = `hsl(${(hue + 30) % 360}, 85%, 35%)`;
    lightColor = `hsl(${(hue - 20 + 360) % 360}, 90%, 82%)`;
    fringeColor = `hsl(${hue}, 80%, 75%)`;
  }

  // --- 1. Soft Fluffy Ear Puffs / Pom-Pom Ears (Swaying Gently) ---
  const earSway = Math.sin(time * 2.0 + seed) * (r * 0.035);
  const earY = -r * 0.72;
  const earX = r * 0.54;

  [-1, 1].forEach((dir) => {
    const ex = dir * earX;
    const ey = earY + (dir === 1 ? earSway : -earSway);

    // Outer ear fluff puff (radial gradient for 3D softness)
    const earGrad = ctx.createRadialGradient(ex - dir * r * 0.06, ey - r * 0.06, r * 0.04, ex, ey, r * 0.34);
    earGrad.addColorStop(0, lightColor);
    earGrad.addColorStop(0.55, mainColor);
    earGrad.addColorStop(1, darkColor);

    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Soft pastel inner ear cushion
    ctx.fillStyle = 'rgba(254, 205, 211, 0.75)'; // Soft rose pastel
    ctx.beginPath();
    ctx.ellipse(ex, ey + r * 0.02, r * 0.16, r * 0.19, dir * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // Tiny ear tip fluff sparkles
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(ex - dir * r * 0.05, ey - r * 0.08, r * 0.05, 0, Math.PI * 2);
    ctx.fill();
  });

  // --- 2. Dense Soft Plush Fur Petals / Cloud Puffs (No wire lines!) ---
  // Layer A: Outer Cloud Puffs (36 overlapping rounded petals)
  const outerPetalCount = 36;
  for (let i = 0; i < outerPetalCount; i++) {
    const angle = (i / outerPetalCount) * Math.PI * 2;
    const wave = Math.sin(angle * 5 + time * 1.6 + seed) * (r * 0.03);
    const lengthMod = ((i * 17) % 5) * (r * 0.025);
    const dist = r * 0.88 + wave + lengthMod;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    const petalRadius = r * 0.22;

    const pGrad = ctx.createRadialGradient(px * 0.9, py * 0.9, petalRadius * 0.1, px, py, petalRadius);
    pGrad.addColorStop(0, lightColor);
    pGrad.addColorStop(0.65, mainColor);
    pGrad.addColorStop(1, fringeColor);

    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, petalRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layer B: Mid Density Fluff Puffs (24 overlapping round cushions)
  const midPetalCount = 24;
  for (let i = 0; i < midPetalCount; i++) {
    const angle = (i / midPetalCount) * Math.PI * 2 + 0.12;
    const wave = Math.cos(angle * 4 - time * 1.3 + seed) * (r * 0.025);
    const dist = r * 0.78 + wave;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    const petalRadius = r * 0.26;

    const pGrad = ctx.createRadialGradient(px * 0.85, py * 0.85, petalRadius * 0.1, px, py, petalRadius);
    pGrad.addColorStop(0, lightColor);
    pGrad.addColorStop(0.7, mainColor);
    pGrad.addColorStop(1, darkColor);

    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, petalRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 3. Main Soft Woolly Body (Spherical 3D Velvet Gradient) ---
  const bodyGrad = ctx.createRadialGradient(
    -r * 0.28,
    -r * 0.32,
    r * 0.06,
    0,
    0,
    r * 0.94
  );
  bodyGrad.addColorStop(0, '#FFFFFF'); // Soft light crest
  bodyGrad.addColorStop(0.18, lightColor);
  bodyGrad.addColorStop(0.5, mainColor);
  bodyGrad.addColorStop(0.88, darkColor);
  bodyGrad.addColorStop(1, darkColor);

  ctx.beginPath();
  ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // --- 4. Velvet Specular Sheen Arc (Touchable Silkiness) ---
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(-r * 0.18, -r * 0.35, r * 0.48, r * 0.24, -0.4, 0, Math.PI * 2);
  const sheenGrad = ctx.createLinearGradient(-r * 0.4, -r * 0.5, 0, -r * 0.2);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  sheenGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.15)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.fill();
  ctx.restore();

  // --- 5. Special Ball Effects (Bomb, Lightning, Ice) ---
  if (special === 'bomb') {
    // Bomb wick
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = r * 0.12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.82);
    ctx.quadraticCurveTo(r * 0.22, -r * 1.25, r * 0.06, -r * 1.52);
    ctx.stroke();

    // Bomb spark
    const sparkR = r * 0.22 + Math.sin(time * 18) * (r * 0.05);
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(r * 0.06, -r * 1.52, sparkR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(r * 0.06, -r * 1.52, sparkR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (special === 'lightning') {
    // Golden crest aura
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, -r * 0.9, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, -r * 0.9, r * 0.11, 0, Math.PI * 2);
    ctx.fill();
  } else if (special === 'ice') {
    // Crystalline frost cracks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = r * 0.085;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.45, -r * 0.32);
    ctx.lineTo(-r * 0.15, 0);
    ctx.lineTo(-r * 0.4, r * 0.32);
    ctx.stroke();
  }

  // --- 6. Soft Rosy Blush Cheeks (Airbrushed & Cute) ---
  const cheekRadius = r * 0.19;
  const cheekY = r * 0.22;
  const cheekSpacing = r * 0.52;

  ctx.save();
  [-1, 1].forEach((dir) => {
    const cx = dir * cheekSpacing;
    const cGrad = ctx.createRadialGradient(cx, cheekY, 0, cx, cheekY, cheekRadius);
    cGrad.addColorStop(0, 'rgba(244, 63, 94, 0.58)');
    cGrad.addColorStop(0.7, 'rgba(251, 113, 133, 0.3)');
    cGrad.addColorStop(1, 'rgba(251, 113, 133, 0)');

    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.arc(cx, cheekY, cheekRadius, 0, Math.PI * 2);
    ctx.fill();

    // Cheek micro-shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.arc(cx + dir * r * 0.04, cheekY - r * 0.05, r * 0.035, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // --- 7. Precious Jewel-Like Chibi Eyes ---
  const eyeWidth = r * 0.29;
  const eyeHeight = r * 0.36;
  const eyeSpacing = r * 0.24;
  const eyeCenterY = -r * 0.02;

  const leftEyeX = -eyeSpacing;
  const rightEyeX = eyeSpacing;

  let pupilShiftX = eyeOffset.x * (r * 0.11);
  let pupilShiftY = eyeOffset.y * (r * 0.11);

  if (expression === 'aiming') {
    pupilShiftX = eyeOffset.x * (r * 0.13);
    pupilShiftY = eyeOffset.y * (r * 0.13);
  }

  if (isBlinking) {
    // Happy squint closed smiling eyes
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = r * 0.09;
    ctx.lineCap = 'round';

    [leftEyeX, rightEyeX].forEach((ex) => {
      ctx.beginPath();
      ctx.arc(ex, eyeCenterY, eyeWidth * 0.85, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Cute eyelashes
      [-1, 0, 1].forEach((lDir) => {
        const lx = ex + lDir * (eyeWidth * 0.48);
        const ly = eyeCenterY - eyeHeight * 0.38;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + lDir * (r * 0.08), ly - r * 0.14);
        ctx.stroke();
      });
    });
  } else if (expression === 'falling' || expression === 'dizzy') {
    // Dizzy spiral eyes
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = r * 0.08;
    ctx.lineCap = 'round';

    [leftEyeX, rightEyeX].forEach((ex) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(ex, eyeCenterY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = r * 0.035;
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = r * 0.065;
      for (let a = 0; a < Math.PI * 3.5; a += 0.25) {
        const spiralR = (a / (Math.PI * 3.5)) * (eyeWidth * 0.75);
        const sx = ex + Math.cos(a + time * 4.5) * spiralR;
        const sy = eyeCenterY + Math.sin(a + time * 4.5) * spiralR;
        if (a === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    });
  } else {
    // Standard Iconic Jewel Eyes
    [leftEyeX, rightEyeX].forEach((ex, idx) => {
      // White Oval Sclera
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(ex, eyeCenterY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Soft eye contour border
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.lineWidth = r * 0.038;
      ctx.stroke();

      // Dark Obsidian Pupil
      const pupilRadius = eyeWidth * 0.66;
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(ex + pupilShiftX, eyeCenterY + pupilShiftY, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Colorful glowing iris crescent
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(
        ex + pupilShiftX,
        eyeCenterY + pupilShiftY + pupilRadius * 0.32,
        pupilRadius * 0.54,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Catchlight 1: Main Glossy Oval Sparkle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(
        ex + pupilShiftX - pupilRadius * 0.3,
        eyeCenterY + pupilShiftY - pupilRadius * 0.3,
        pupilRadius * 0.38,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Catchlight 2: Secondary Soft Sparkle
      ctx.beginPath();
      ctx.arc(
        ex + pupilShiftX + pupilRadius * 0.28,
        eyeCenterY + pupilShiftY + pupilRadius * 0.28,
        pupilRadius * 0.18,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Catchlight 3: Micro Star Twinkle
      ctx.beginPath();
      ctx.arc(
        ex + pupilShiftX - pupilRadius * 0.1,
        eyeCenterY + pupilShiftY + pupilRadius * 0.38,
        pupilRadius * 0.1,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Curved Eyelashes on top of each eye
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = r * 0.055;
      ctx.lineCap = 'round';

      const topY = eyeCenterY - eyeHeight * 0.95;
      const isLeft = idx === 0;

      // Center lash
      ctx.beginPath();
      ctx.moveTo(ex, topY);
      ctx.quadraticCurveTo(
        ex + (isLeft ? -r * 0.04 : r * 0.04),
        topY - r * 0.12,
        ex + (isLeft ? -r * 0.06 : r * 0.06),
        topY - r * 0.2
      );
      ctx.stroke();

      // Outer lash
      const outerX = ex + (isLeft ? -eyeWidth * 0.55 : eyeWidth * 0.55);
      ctx.beginPath();
      ctx.moveTo(outerX, topY + r * 0.04);
      ctx.quadraticCurveTo(
        outerX + (isLeft ? -r * 0.1 : r * 0.1),
        topY - r * 0.08,
        outerX + (isLeft ? -r * 0.16 : r * 0.16),
        topY - r * 0.14
      );
      ctx.stroke();
    });
  }

  // --- 8. Sweet Expressive Chibi Mouth ---
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = r * 0.065;
  ctx.lineCap = 'round';

  const mouthY = r * 0.36;

  if (expression === 'popping' || expression === 'surprised') {
    // Surprised gasp "O"
    ctx.beginPath();
    ctx.arc(0, mouthY, r * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.arc(0, mouthY + r * 0.05, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
  } else if (expression === 'falling' || expression === 'dizzy') {
    // Wavy dizzy mouth
    ctx.beginPath();
    ctx.moveTo(-r * 0.16, mouthY);
    ctx.quadraticCurveTo(-r * 0.08, mouthY - r * 0.08, 0, mouthY);
    ctx.quadraticCurveTo(r * 0.08, mouthY + r * 0.08, r * 0.16, mouthY);
    ctx.stroke();
  } else {
    // Happy, sweet little open smile with tiny pink tongue
    ctx.beginPath();
    ctx.arc(0, mouthY - r * 0.02, r * 0.15, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Cute pink tongue inside
    ctx.fillStyle = '#FB7185';
    ctx.beginPath();
    ctx.arc(0, mouthY + r * 0.06, r * 0.07, 0, Math.PI);
    ctx.fill();
  }

  // --- 9. Special Chameleon / Color-Shifting Aura & Crown Badge ---
  if (special === 'chameleon') {
    ctx.save();
    // Shimmering color-change aura ring
    const haloGrad = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, r * 1.35);
    haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    haloGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.22)');
    haloGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Cute rotating color-morph spiral badge on forehead
    const badgeY = -r * 0.58;
    ctx.translate(0, badgeY);
    ctx.rotate(time * 3);
    const dotColors = ['#F43F5E', '#10B981', '#38BDF8', '#FBBF24'];
    dotColors.forEach((dc, dIdx) => {
      const dAngle = (dIdx / dotColors.length) * Math.PI * 2;
      ctx.fillStyle = dc;
      ctx.beginPath();
      ctx.arc(Math.cos(dAngle) * r * 0.18, Math.sin(dAngle) * r * 0.18, r * 0.075, 0, Math.PI * 2);
      ctx.fill();
    });
    // Center bright sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}
