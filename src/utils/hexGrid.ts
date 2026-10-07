import {
  FuzzyBall,
  FuzzyColor,
  SpecialType,
} from '../types/game';

export const GRID_COLS = 8;
export const MAX_GRID_ROWS = 26;

export interface Point {
  x: number;
  y: number;
}

export interface GridSlot {
  row: number;
  col: number;
  x: number;
  y: number;
}

/**
 * Calculates slot center coordinate for row r and col c.
 */
export function getSlotCenter(
  row: number,
  col: number,
  boardWidth: number,
  radius: number,
  topMargin: number
): Point {
  const isEven = row % 2 === 0;
  const colWidth = boardWidth / GRID_COLS;
  const x = isEven ? (col + 0.5) * colWidth : (col + 1.0) * colWidth;
  const rowHeight = radius * 1.7320508; // radius * sqrt(3)
  const y = topMargin + radius + row * rowHeight;
  return { x, y };
}

/**
 * Returns total columns allowed in a given row.
 */
export function getColsInRow(row: number): number {
  return row % 2 === 0 ? GRID_COLS : GRID_COLS - 1;
}

/**
 * Gets adjacent neighbor coordinates for a given (row, col) cell in hex grid.
 */
export function getNeighbors(row: number, col: number): { row: number; col: number }[] {
  const neighbors: { row: number; col: number }[] = [];
  const isEven = row % 2 === 0;

  const offsets = isEven
    ? [
        { r: -1, c: -1 },
        { r: -1, c: 0 },
        { r: 0, c: -1 },
        { r: 0, c: 1 },
        { r: 1, c: -1 },
        { r: 1, c: 0 },
      ]
    : [
        { r: -1, c: 0 },
        { r: -1, c: 1 },
        { r: 0, c: -1 },
        { r: 0, c: 1 },
        { r: 1, c: 0 },
        { r: 1, c: 1 },
      ];

  for (const off of offsets) {
    const nr = row + off.r;
    const nc = col + off.c;
    if (nr >= 0 && nr < MAX_GRID_ROWS) {
      const maxCols = getColsInRow(nr);
      if (nc >= 0 && nc < maxCols) {
        neighbors.push({ row: nr, col: nc });
      }
    }
  }

  return neighbors;
}

/**
 * Finds the best empty grid slot closest to the collision point
 * that is adjacent to at least one ball or is in row 0.
 */
export function findNearestEmptySlot(
  x: number,
  y: number,
  grid: (FuzzyBall | null)[][],
  boardWidth: number,
  radius: number,
  topMargin: number
): { row: number; col: number } {
  let bestSlot: { row: number; col: number } | null = null;
  let minDistanceSq = Infinity;

  // Primary: find empty slot adjacent to existing ball or in row 0
  for (let r = 0; r < MAX_GRID_ROWS; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      if (grid[r]?.[c] != null) continue; // slot already occupied

      // Valid if in row 0, OR adjacent to an existing ball
      let isValidCandidate = r === 0;
      if (!isValidCandidate) {
        const neighbors = getNeighbors(r, c);
        for (const n of neighbors) {
          if (n.row >= 0 && n.row < MAX_GRID_ROWS && grid[n.row]?.[n.col] != null) {
            isValidCandidate = true;
            break;
          }
        }
      }

      if (!isValidCandidate) continue;

      const center = getSlotCenter(r, c, boardWidth, radius, topMargin);
      const dx = center.x - x;
      const dy = center.y - y;
      const distSq = dx * dx + dy * dy;

      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        bestSlot = { row: r, col: c };
      }
    }
  }

  // Fallback 1: If no adjacent slot was found, pick ANY empty slot closest to (x, y)
  if (!bestSlot) {
    minDistanceSq = Infinity;
    for (let r = 0; r < MAX_GRID_ROWS; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (grid[r]?.[c] == null) {
          const center = getSlotCenter(r, c, boardWidth, radius, topMargin);
          const dx = center.x - x;
          const dy = center.y - y;
          const distSq = dx * dx + dy * dy;
          if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            bestSlot = { row: r, col: c };
          }
        }
      }
    }
  }

  // Fallback 2: Guaranteed slot
  return bestSlot || { row: 0, col: Math.floor(colsInRow0(boardWidth, radius) / 2) || 0 };
}

function colsInRow0(boardWidth: number, radius: number): number {
  return 8;
}

/**
 * Matches 3 or more connected fuzzies of the same color starting at (startRow, startCol).
 * Also handles Rainbow, Bomb, and Lightning special types!
 */
export function findMatches(
  startRow: number,
  startCol: number,
  grid: (FuzzyBall | null)[][]
): {
  matchedBalls: FuzzyBall[];
  type: 'color' | 'bomb' | 'lightning';
} {
  const origin = grid[startRow]?.[startCol];
  if (!origin) return { matchedBalls: [], type: 'color' };

  // Bomb fuzzy: pops all within 2 rings
  if (origin.special === 'bomb') {
    const bombVictims: FuzzyBall[] = [origin];
    const visited = new Set<string>();
    visited.add(`${startRow},${startCol}`);

    // Level 1 neighbors
    const ring1 = getNeighbors(startRow, startCol);
    for (const n1 of ring1) {
      const b1 = grid[n1.row]?.[n1.col];
      const key1 = `${n1.row},${n1.col}`;
      if (b1 && !visited.has(key1)) {
        visited.add(key1);
        bombVictims.push(b1);
      }
      // Level 2 neighbors
      const ring2 = getNeighbors(n1.row, n1.col);
      for (const n2 of ring2) {
        const b2 = grid[n2.row]?.[n2.col];
        const key2 = `${n2.row},${n2.col}`;
        if (b2 && !visited.has(key2)) {
          visited.add(key2);
          bombVictims.push(b2);
        }
      }
    }
    return { matchedBalls: bombVictims, type: 'bomb' };
  }

  // Lightning fuzzy: clears row
  if (origin.special === 'lightning') {
    const zapVictims: FuzzyBall[] = [];
    const cols = getColsInRow(startRow);
    for (let c = 0; c < cols; c++) {
      const b = grid[startRow]?.[c];
      if (b) zapVictims.push(b);
    }
    return { matchedBalls: zapVictims, type: 'lightning' };
  }

  // Rainbow fuzzy or standard color matching
  if (origin.special === 'rainbow') {
    // Collect all neighboring colors and see if any color forms a group with this rainbow ball
    const neighbors = getNeighbors(startRow, startCol);
    const adjacentColors = new Set<FuzzyColor>();
    for (const n of neighbors) {
      const b = grid[n.row]?.[n.col];
      if (b && b.color) {
        adjacentColors.add(b.color);
      }
    }

    const allMatched = new Set<FuzzyBall>();
    allMatched.add(origin);

    for (const testColor of adjacentColors) {
      const group = getSameColorCluster(startRow, startCol, testColor, grid);
      // Since rainbow counts as 1, if group has 3+ total balls, keep them
      if (group.length >= 3) {
        group.forEach((b) => allMatched.add(b));
      }
    }

    return { matchedBalls: Array.from(allMatched), type: 'color' };
  }

  // Standard match
  const cluster = getSameColorCluster(startRow, startCol, origin.color, grid);
  if (cluster.length >= 3) {
    return { matchedBalls: cluster, type: 'color' };
  }

  return { matchedBalls: [], type: 'color' };
}

function getSameColorCluster(
  startRow: number,
  startCol: number,
  targetColor: FuzzyColor,
  grid: (FuzzyBall | null)[][]
): FuzzyBall[] {
  const cluster: FuzzyBall[] = [];
  const visited = new Set<string>();
  const queue: { row: number; col: number }[] = [{ row: startRow, col: startCol }];
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const ball = grid[curr.row]?.[curr.col];
    if (!ball) continue;

    const matchesColor = ball.color === targetColor || ball.special === 'rainbow';
    if (!matchesColor) continue;

    cluster.push(ball);

    const neighbors = getNeighbors(curr.row, curr.col);
    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        const nextBall = grid[n.row]?.[n.col];
        if (nextBall && (nextBall.color === targetColor || nextBall.special === 'rainbow')) {
          queue.push(n);
        }
      }
    }
  }

  return cluster;
}

/**
 * Finds all floating/disconnected fuzzies on the board that are not anchored
 * to row 0 either directly or through neighbors.
 */
export function findDisconnectedFuzzies(
  grid: (FuzzyBall | null)[][]
): FuzzyBall[] {
  const anchored = new Set<string>();
  const queue: { row: number; col: number }[] = [];

  // Start BFS from all balls currently in top row (row 0)
  const cols0 = getColsInRow(0);
  for (let c = 0; c < cols0; c++) {
    if (grid[0]?.[c] != null) {
      anchored.add(`0,${c}`);
      queue.push({ row: 0, col: c });
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = getNeighbors(curr.row, curr.col);

    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!anchored.has(key) && grid[n.row]?.[n.col] != null) {
        anchored.add(key);
        queue.push(n);
      }
    }
  }

  // Any non-null ball not in anchored set is disconnected!
  const disconnected: FuzzyBall[] = [];
  for (let r = 0; r < MAX_GRID_ROWS; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      const b = grid[r]?.[c];
      if (b != null && !anchored.has(`${r},${c}`)) {
        disconnected.push(b);
      }
    }
  }

  return disconnected;
}

/**
 * Simulates trajectory raycast bouncing off left and right walls.
 * Returns array of trajectory line vertices and the collision hit point.
 */
export function calculateTrajectory(
  originX: number,
  originY: number,
  angleRad: number,
  grid: (FuzzyBall | null)[][],
  boardWidth: number,
  boardHeight: number,
  radius: number,
  topMargin: number
): { path: Point[]; hit: Point; hitCeiling: boolean } {
  const path: Point[] = [{ x: originX, y: originY }];
  let currX = originX;
  let currY = originY;
  let vx = Math.cos(angleRad);
  let vy = Math.sin(angleRad);

  const stepSize = 4;
  const maxSteps = 450;
  const minX = radius;
  const maxX = boardWidth - radius;
  const minY = topMargin + radius;

  let hitCeiling = false;

  for (let step = 0; step < maxSteps; step++) {
    currX += vx * stepSize;
    currY += vy * stepSize;

    // Wall bounce: Left wall
    if (currX <= minX) {
      currX = minX;
      vx = -vx;
      path.push({ x: currX, y: currY });
    }
    // Wall bounce: Right wall
    else if (currX >= maxX) {
      currX = maxX;
      vx = -vx;
      path.push({ x: currX, y: currY });
    }

    // Hit ceiling
    if (currY <= minY) {
      currY = minY;
      hitCeiling = true;
      path.push({ x: currX, y: currY });
      break;
    }

    // Check collision with existing balls
    let collided = false;
    for (let r = 0; r < MAX_GRID_ROWS; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const ball = grid[r]?.[c];
        if (!ball) continue;

        const center = getSlotCenter(r, c, boardWidth, radius, topMargin);
        const dx = center.x - currX;
        const dy = center.y - currY;
        const distSq = dx * dx + dy * dy;

        // Collision threshold: 2 * radius - slight overlap
        if (distSq <= (radius * 1.95) * (radius * 1.95)) {
          collided = true;
          break;
        }
      }
      if (collided) break;
    }

    if (collided) {
      path.push({ x: currX, y: currY });
      break;
    }
  }

  const hit = path[path.length - 1];
  return { path, hit, hitCeiling };
}
