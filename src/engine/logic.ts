import { Metal, Coin, Tube, Folio, GameState, HistoryFrame, METALS } from './types.ts';

function randInt(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

function makeId(): string {
  const arr = new Uint32Array(2);
  crypto.getRandomValues(arr);
  return `${arr[0].toString(36)}${arr[1].toString(36)}`;
}

function cloneCoin(c: Coin): Coin {
  return { metal: c.metal, id: c.id };
}

function cloneTubes(tubes: Tube[]): Tube[] {
  return tubes.map((tube) => ({ coins: tube.coins.map(cloneCoin) }));
}

export function carryForwardState(prev: GameState, folio: Folio): GameState {
  const state: GameState = {
    folioId: folio.id,
    tubes: cloneTubes(prev.tubes),
    pool: [],
    planchets: folio.planchets,
    flushes: folio.flushes,
    moves: 0,
    score: prev.score,
    selectedTube: null,
    pendingState: 'none',
    completed: false,
    stars: 0,
    history: [],
    register: new Set(prev.register),
    comboMultiplier: 1
  };

  // Expand tube count and normalize capacity for the new folio
  while (state.tubes.length < folio.tubes) {
    state.tubes.push({ coins: [] });
  }
  for (const tube of state.tubes) {
    if (tube.coins.length > folio.capacity) {
      tube.coins.splice(0, tube.coins.length - folio.capacity);
    }
  }

  deal(state, folio);
  return state;
}

export function nextTier(metal: Metal): Metal | null {
  const idx = METALS.indexOf(metal);
  return idx < METALS.length - 1 ? METALS[idx + 1] : null;
}

export function canPour(source: Tube, dest: Tube, capacity: number): boolean {
  if (source.coins.length === 0) return false;
  if (dest.coins.length >= capacity) return false;
  const top = source.coins[source.coins.length - 1].metal;
  if (top === ('planchet' as unknown as typeof top)) return false;
  if (dest.coins.length === 0) return true;
  const destTop = dest.coins[dest.coins.length - 1].metal;
  if (destTop === ('planchet' as unknown as typeof destTop)) return dest.coins.length + 1 <= capacity;
  return destTop === top;
}

function topRun(tube: Tube): number {
  if (tube.coins.length === 0) return 0;
  const top = tube.coins[tube.coins.length - 1].metal;
  if (top === ('planchet' as unknown as typeof top)) return 1;
  let count = 1;
  for (let i = tube.coins.length - 2; i >= 0; i--) {
    const m = tube.coins[i].metal;
    if (m === ('planchet' as unknown as typeof m) || m !== top) break;
    count++;
  }
  return count;
}

export function performPour(source: Tube, dest: Tube, capacity: number): number {
  const run = topRun(source);
  const head = dest.coins[dest.coins.length - 1]?.metal;
  const destHasPlanchet = head === ('planchet' as unknown as typeof head);
  const moved = Math.min(run, destHasPlanchet ? 1 : capacity - dest.coins.length);
  const block = source.coins.splice(source.coins.length - moved, moved);
  if (destHasPlanchet) {
    // absorb into planchet: replace planchet with the incoming metal
    dest.coins.pop();
    dest.coins.push(...block);
  } else {
    dest.coins.push(...block);
  }
  return moved;
}

export function checkMerges(tubes: Tube[], capacity: number): { changes: number; mergeScore: number; discovered: Metal[] } {
  let changes = 0;
  let mergeScore = 0;
  const discovered: Metal[] = [];

  for (const tube of tubes) {
    const topCoin = tube.coins[tube.coins.length - 1];
    if (!topCoin) continue;
    const top = topCoin.metal;
    if (top === ('planchet' as unknown as typeof top)) continue;
    const run = topRun(tube);
    if (run === capacity) {
      const nxt = nextTier(top);
      if (nxt) {
        const newCoin: Coin = { metal: nxt, id: makeId() };
        tube.coins.splice(tube.coins.length - capacity, capacity, newCoin);
        changes++;
        mergeScore += mergeValue(top);
        discovered.push(nxt);
      }
    }
  }
  return { changes, mergeScore, discovered };
}

function mergeValue(from: Metal): number {
  switch (from) {
    case 'iron':
      return 50;
    case 'copper':
      return 100;
    case 'silver':
      return 200;
    case 'gold':
      return 400;
    case 'platinum':
      return 800;
    case 'aetherium':
      return 1600;
  }
}

function weightedMetal(folio: Folio): Metal {
  const pool: Metal[] = [];
  for (const metal of folio.metals) {
    // don't deal coins that are already the Folio's objective
    if (folio.target[metal]) continue;
    const w = folio.weights[metal] || 0;
    for (let i = 0; i < w * 10; i++) pool.push(metal);
  }
  if (pool.length === 0) {
    // fallback to the first non-target metal (should never happen in authored folios)
    return folio.metals.find((m) => !folio.target[m]) || folio.metals[0];
  }
  return pool[randInt(pool.length)];
}

export function deal(state: GameState, folio: Folio): void {
  const tubesWithSpace = state.tubes.filter((t) => t.coins.length < folio.capacity);
  if (tubesWithSpace.length === 0) return;
  for (const tube of tubesWithSpace) {
    tube.coins.push({ metal: weightedMetal(folio), id: makeId() });
  }
}

export function createGameState(folio: Folio): GameState {
  const state: GameState = {
    folioId: folio.id,
    tubes: Array.from({ length: folio.tubes }, () => ({ coins: [] })),
    pool: [],
    planchets: folio.planchets,
    flushes: folio.flushes,
    moves: 0,
    score: 0,
    selectedTube: null,
    pendingState: 'none',
    completed: false,
    stars: 0,
    history: [],
    register: new Set<string>(),
    comboMultiplier: 1
  };
  deal(state, folio);
  return state;
}

export function snapshot(state: GameState): HistoryFrame {
  return {
    tubes: cloneTubes(state.tubes),
    pool: state.pool.map(cloneCoin),
    planchets: state.planchets,
    flushes: state.flushes,
    moves: state.moves,
    score: state.score,
    completed: state.completed,
    stars: state.stars,
    register: Array.from(state.register)
  };
}

export function restore(state: GameState, frame: HistoryFrame): void {
  state.tubes = cloneTubes(frame.tubes);
  state.pool = frame.pool.map(cloneCoin);
  state.planchets = frame.planchets;
  state.flushes = frame.flushes;
  state.moves = frame.moves;
  state.score = frame.score;
  state.completed = frame.completed;
  state.stars = frame.stars;
  state.register = new Set(frame.register);
  state.selectedTube = null;
  state.pendingState = 'none';
}

export function hasLegalMoves(state: GameState, folio: Folio): boolean {
  if (state.flushes > 0) return true;
  for (let i = 0; i < state.tubes.length; i++) {
    if (state.tubes[i].coins.length === 0) return true;
    for (let j = 0; j < state.tubes.length; j++) {
      if (i !== j && canPour(state.tubes[i], state.tubes[j], folio.capacity)) return true;
    }
  }
  return false;
}

export function countSeals(state: GameState): Record<Metal, number> {
  const counts: Record<string, number> = {};
  for (const metal of METALS) counts[metal] = 0;
  for (const tube of state.tubes) {
    for (const coin of tube.coins) {
      if (coin.metal === ('planchet' as unknown as typeof coin.metal)) continue;
      counts[coin.metal]++;
    }
  }
  return counts as Record<Metal, number>;
}

export function checkFolioComplete(state: GameState, folio: Folio): boolean {
  const counts = countSeals(state);
  for (const [metal, need] of Object.entries(folio.target)) {
    if ((counts[metal as Metal] || 0) < (need || 0)) return false;
  }
  return true;
}

export function evaluateStars(state: GameState, folio: Folio): number {
  if (!state.completed) return 0;
  if (state.moves <= folio.moveBudget && state.planchets > 0) return 3;
  if (state.moves <= folio.moveBudget) return 2;
  return 1;
}
