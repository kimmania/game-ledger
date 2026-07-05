import {
  GameState,
  Coin,
  Folio,
  StateId,
  checkMerges,
  canPour,
  performPour,
  deal,
  snapshot,
  restore,
  checkFolioComplete,
  evaluateStars,
  carryForwardState,
  loadProgress,
  saveProgress,
  saveGame,
  loadGame,
  loadRegister,
  saveRegister
} from './engine/index.ts';
import { getFolio, nextFolioId, FOLIO_ORDER } from './folios.ts';

export type AppHandlers = {
  render: () => void;
  play: (name: string) => void;
  showToast: (text: string) => void;
  announce: (text: string) => void;
};

export class LedgerApp {
  state: GameState;
  folio: Folio;
  handlers: AppHandlers;
  progress = loadProgress();
  register = loadRegister();

  constructor(handlers: AppHandlers) {
    this.handlers = handlers;
    const saved = loadGame();
    if (saved && FOLIO_ORDER.includes(saved.folioId)) {
      this.folio = getFolio(saved.folioId);
      this.state = saved.state;
    } else {
      this.folio = getFolio('coaling-1');
      this.state = this.createFreshState();
    }
    this.state.register = this.register;
  }

  createFreshState(): GameState {
    const fresh = createGameState(this.folio);
    fresh.register = this.register;
    return fresh;
  }

  startFolio(id: string): void {
    this.folio = getFolio(id);
    this.state = this.createFreshState();
    this.persist();
    this.handlers.render();
  }

  advanceFolio(): void {
    const next = nextFolioId(this.folio.id);
    if (!next) {
      this.handlers.showToast('All folios complete!');
      return;
    }
    this.folio = getFolio(next);
    this.state = carryForwardState(this.state, this.folio);
    this.state.register = this.register;
    this.persist();
    this.checkCompletion();
    this.handlers.render();
  }

  resetFolio(): void {
    this.state = this.createFreshState();
    this.persist();
    this.handlers.render();
  }

  persist(saveHistory = true): void {
    if (saveHistory) {
      const frame = snapshot(this.state);
      if (this.state.history.length > 20) this.state.history.shift();
      this.state.history.push(frame);
    }
    saveGame(this.folio.id, this.state);
  }

  pushUndoFrame(): void {
    const frame = snapshot(this.state);
    if (this.state.history.length > 20) this.state.history.shift();
    this.state.history.push(frame);
  }

  undo(): void {
    const frame = this.state.history.pop();
    if (!frame) return;
    restore(this.state, frame);
    this.state.pendingState = 'none';
    this.state.selectedTube = null;
    this.persist(false);
    this.handlers.render();
  }

  setPending(state: StateId): void {
    this.state.pendingState = state;
    this.state.selectedTube = null;
    this.handlers.render();
  }

  selectTube(index: number): void {
    if (this.state.completed) return;
    const { selectedTube, pendingState } = this.state;

    if (pendingState === 'stamp') {
      this.applyStamp(index);
      return;
    }
    if (pendingState === 'flush') {
      this.applyFlush(index);
      return;
    }

    if (selectedTube === null) {
      if (this.state.tubes[index].coins.length === 0) {
        this.handlers.play('invalid');
        return;
      }
      this.state.selectedTube = index;
      this.handlers.render();
      return;
    }

    if (selectedTube === index) {
      this.state.selectedTube = null;
      this.handlers.render();
      return;
    }

    if (!canPour(this.state.tubes[selectedTube], this.state.tubes[index], this.folio.capacity)) {
      this.handlers.play('invalid');
      this.state.selectedTube = null;
      this.handlers.render();
      return;
    }

    this.pushUndoFrame();
    performPour(this.state.tubes[selectedTube], this.state.tubes[index], this.folio.capacity);
    this.state.moves++;
    this.state.score += 10;
    this.resolveMerges();
    this.state.selectedTube = null;
    this.checkCompletion();
    this.persist(false);
    this.handlers.render();
  }

  resolveMerges(): void {
    this.state.comboMultiplier = 1;
    let totalChanges = 0;
    let totalMergeScore = 0;
    while (true) {
      const { changes, mergeScore, discovered } = checkMerges(this.state.tubes, this.folio.capacity);
      if (changes === 0) break;
      totalChanges += changes;
      totalMergeScore += mergeScore;
      for (const m of discovered) {
        if (!this.state.register.has(m)) {
          this.state.register.add(m);
          this.handlers.showToast(`Discovered ${m}!`);
          this.handlers.play('discovery');
        }
      }
      this.state.comboMultiplier += 0.5;
    }
    if (totalChanges) {
      this.state.score += Math.floor(totalMergeScore * this.state.comboMultiplier);
      this.handlers.play('merge');
    }
  }

  applyStamp(index: number): void {
    if (this.state.planchets <= 0) return;
    const tube = this.state.tubes[index];
    if (tube.coins.length === 0) {
      this.handlers.play('invalid');
      return;
    }
    const top = tube.coins[tube.coins.length - 1];
    this.pushUndoFrame();
    top.metal = 'planchet' as unknown as typeof top.metal;
    this.state.planchets--;
    this.state.pendingState = 'none';
    this.handlers.play('stamp');
    this.persist(false);
    this.handlers.render();
  }

  applyFlush(index: number): void {
    if (this.state.flushes <= 0) return;
    const tube = this.state.tubes[index];
    if (tube.coins.length === 0) {
      this.handlers.play('invalid');
      return;
    }
    const hasPlanchet = tube.coins.some(isPlanchet);
    if (hasPlanchet) {
      this.handlers.play('invalid');
      return;
    }
    this.pushUndoFrame();
    for (const coin of tube.coins) {
      this.state.pool.push(coin);
    }
    tube.coins = [];
    this.state.flushes--;
    this.state.pendingState = 'none';
    this.handlers.play('flush');
    this.persist(false);
    this.handlers.render();
  }

  deal(): void {
    if (this.state.completed) return;
    const empty = this.state.tubes.some((t) => t.coins.length === 0);
    if (!empty) {
      this.handlers.play('invalid');
      return;
    }
    this.pushUndoFrame();
    deal(this.state, this.folio);
    this.state.pool = [];
    this.state.moves++;
    this.resolveMerges();
    this.persist(false);
    this.handlers.render();
  }

  checkCompletion(): void {
    if (!checkFolioComplete(this.state, this.folio)) return;
    this.state.completed = true;
    this.state.stars = evaluateStars(this.state, this.folio);

    const idx = this.progress.completedFolios.indexOf(this.folio.id);
    if (idx === -1) this.progress.completedFolios.push(this.folio.id);

    const next = nextFolioId(this.folio.id);
    if (next && !this.progress.unlockedFolios.includes(next)) {
      this.progress.unlockedFolios.push(next);
    }
    if (!this.progress.unlockedFolios.includes('coaling-1')) {
      this.progress.unlockedFolios.push('coaling-1');
    }
    saveProgress(this.progress);
    saveRegister(this.state.register);

    setTimeout(() => this.handlers.render(), 800);
  }
}

function isPlanchet(c: Coin): boolean {
  return c.metal === ('planchet' as unknown as typeof c.metal);
}

function createGameState(folio: Folio): GameState {
  return {
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
}
