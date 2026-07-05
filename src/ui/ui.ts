import { GameState, Folio, Coin, countSeals } from '../engine/index.ts';
import { METAL_CONFIG, svgShape } from '../engine/metals.ts';
import { FOLIOS } from '../folios.ts';

export class UIController {
  root: HTMLElement;
  app: HTMLElement;

  constructor() {
    const root = document.getElementById('app');
    if (!root) throw new Error('#app not found');
    this.root = root;
    this.app = document.createElement('div');
    this.app.className = 'ledger-app';
    this.root.appendChild(this.app);
  }

  clear(): void {
    this.app.innerHTML = '';
  }

  renderGame(state: GameState, folio: Folio, hooks: {
    selectTube: (i: number) => void;
    deal: () => void;
    setPending: (s: 'stamp' | 'flush' | 'none') => void;
    undo: () => void;
    reset: () => void;
    settings: () => void;
    help: () => void;
    nextFolio: () => void;
  }): void {
    this.clear();
    this.app.appendChild(this.header(folio, state, hooks));
    this.app.appendChild(this.targetPanel(state, folio));
    this.app.appendChild(this.tubesGrid(state, folio, hooks.selectTube));
    this.app.appendChild(this.controls(state, hooks));
    if (state.completed) {
      this.app.appendChild(this.winModal(state, folio, hooks));
    }
  }

  header(folio: Folio, state: GameState, hooks: { undo: () => void; reset: () => void; settings: () => void; help: () => void }): HTMLElement {
    const el = document.createElement('header');
    el.className = 'ledger-header';

    const title = document.createElement('h1');
    title.textContent = folio.name;
    el.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'ledger-meta';
    meta.innerHTML = `<span class="moves">Moves: ${state.moves} / ${folio.moveBudget}</span><span class="score">Score: ${state.score}</span>`;
    el.appendChild(meta);

    const buttons = document.createElement('div');
    buttons.className = 'ledger-header-buttons';
    buttons.appendChild(this.iconButton('Undo', hooks.undo));
    buttons.appendChild(this.iconButton('Reset', hooks.reset));
    buttons.appendChild(this.iconButton('?', hooks.help));
    buttons.appendChild(this.iconButton('⚙', hooks.settings));
    el.appendChild(buttons);
    return el;
  }

  targetPanel(state: GameState, folio: Folio): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ledger-targets';
    const counts = countSeals(state);
    for (const [metal, need] of Object.entries(folio.target)) {
      const cfg = METAL_CONFIG[metal as keyof typeof METAL_CONFIG];
      const have = counts[metal as keyof typeof counts] || 0;
      const item = document.createElement('div');
      item.className = 'target-pip';
      item.style.setProperty('--glow', cfg.glow);
      item.innerHTML = `<span class="target-shape">${svgShape(cfg.shape, cfg.hex)}</span><span class="target-label">${cfg.label}: ${have}/${need}</span>`;
      el.appendChild(item);
    }
    return el;
  }

  tubesGrid(state: GameState, folio: Folio, selectTube: (i: number) => void): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ledger-tubes';
    state.tubes.forEach((tube, index) => {
      const tubeEl = document.createElement('div');
      tubeEl.className = 'tube';
      if (state.selectedTube === index) tubeEl.classList.add('selected');
      tubeEl.addEventListener('click', () => selectTube(index));

      const cap = document.createElement('div');
      cap.className = 'tube-cap';
      cap.textContent = `${tube.coins.length}/${folio.capacity}`;
      tubeEl.appendChild(cap);

      const glass = document.createElement('div');
      glass.className = 'tube-glass';
      glass.style.setProperty('--capacity', String(folio.capacity));

      // coins are rendered bottom-up visually
      for (let i = 0; i < folio.capacity; i++) {
        const slot = document.createElement('div');
        slot.className = 'tube-slot';
        const coin = tube.coins[i];
        if (coin) {
          slot.appendChild(this.coinElement(coin));
        }
        glass.appendChild(slot);
      }
      tubeEl.appendChild(glass);

      const base = document.createElement('div');
      base.className = 'tube-base';
      tubeEl.appendChild(base);

      el.appendChild(tubeEl);
    });
    return el;
  }

  coinElement(coin: Coin): HTMLElement {
    const el = document.createElement('div');
    el.className = `coin coin-${coin.metal}`;
    if (coin.metal === ('planchet' as unknown as typeof coin.metal)) {
      el.className = 'coin coin-planchet';
      el.innerHTML = `<span class="coin-label">P</span>`;
    } else {
      const cfg = METAL_CONFIG[coin.metal];
      el.style.setProperty('--coin-color', cfg.hex);
      el.style.setProperty('--glow-color', cfg.glow);
      el.innerHTML = `<span class="coin-shape">${svgShape(cfg.shape, cfg.hex)}</span><span class="coin-label">${cfg.label[0]}</span>`;
    }
    return el;
  }

  controls(state: GameState, hooks: {
    deal: () => void;
    setPending: (s: 'stamp' | 'flush' | 'none') => void;
  }): HTMLElement {
    const el = document.createElement('div');
    el.className = 'ledger-controls';

    const deal = document.createElement('button');
    deal.className = `deal-btn${state.completed ? ' disabled' : ''}`;
    deal.textContent = 'Deal';
    deal.disabled = state.completed;
    deal.addEventListener('click', () => hooks.deal());
    el.appendChild(deal);

    const tools = document.createElement('div');
    tools.className = 'tool-pill';

    const stamp = document.createElement('button');
    stamp.className = `tool-btn${state.pendingState === 'stamp' ? ' active' : ''}${state.planchets <= 0 ? ' disabled' : ''}`;
    stamp.textContent = `Stamp (${state.planchets})`;
    stamp.disabled = state.planchets <= 0;
    stamp.addEventListener('click', () => hooks.setPending(state.pendingState === 'stamp' ? 'none' : 'stamp'));
    tools.appendChild(stamp);

    const flush = document.createElement('button');
    flush.className = `tool-btn${state.pendingState === 'flush' ? ' active' : ''}${state.flushes <= 0 ? ' disabled' : ''}`;
    flush.textContent = `Flush (${state.flushes})`;
    flush.disabled = state.flushes <= 0;
    flush.addEventListener('click', () => hooks.setPending(state.pendingState === 'flush' ? 'none' : 'flush'));
    tools.appendChild(flush);

    el.appendChild(tools);
    return el;
  }

  winModal(state: GameState, folio: Folio, hooks: { nextFolio: () => void; reset: () => void }): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const inner = document.createElement('div');
    inner.className = 'modal-inner win-modal';

    const title = document.createElement('h2');
    title.textContent = 'Folio Complete';
    inner.appendChild(title);

    const stars = document.createElement('div');
    stars.className = 'stars';
    stars.textContent = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
    inner.appendChild(stars);

    const detail = document.createElement('p');
    detail.textContent = `Moves: ${state.moves} / ${folio.moveBudget} · Score: ${state.score}`;
    inner.appendChild(detail);

    const buttons = document.createElement('div');
    buttons.className = 'modal-buttons';
    buttons.appendChild(this.textButton('Replay', hooks.reset));
    buttons.appendChild(this.textButton('Next Folio', hooks.nextFolio));
    inner.appendChild(buttons);

    overlay.appendChild(inner);
    return overlay;
  }

  renderCampaign(progress: { completedFolios: string[]; unlockedFolios: string[] }, selectFolio: (id: string) => void): void {
    this.clear();
    const list = document.createElement('div');
    list.className = 'folio-list';
    FOLIOS.forEach((folio) => {
      const isUnlocked = progress.unlockedFolios.includes(folio.id) || folio.id === 'coaling-1';
      const isDone = progress.completedFolios.includes(folio.id);
      const card = document.createElement('button');
      card.className = `folio-card${isUnlocked ? '' : ' locked'}${isDone ? ' done' : ''}`;
      card.disabled = !isUnlocked;
      card.textContent = `${folio.name}${isDone ? ' ★' : ''}`;
      card.addEventListener('click', () => selectFolio(folio.id));
      list.appendChild(card);
    });
    this.app.appendChild(list);
  }

  renderHelp(onClose: () => void): void {
    this.clear();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const inner = document.createElement('div');
    inner.className = 'modal-inner';
    inner.innerHTML = `
      <h2>Ironclad Ledger</h2>
      <p>Sort brass data-coins into the pneumatic tubes. Match four identical coins in a tube to merge them into the next metal tier.</p>
      <ul>
        <li><strong>Deal:</strong> fill all empty tubes with new coins.</li>
        <li><strong>Sort:</strong> tap a tube, then tap a destination. Only matching top coins may stack.</li>
        <li><strong>Stamp:</strong> convert a top coin into a Planchet wildcard.</li>
        <li><strong>Flush:</strong> empty a clogged tube back into the Deal pool.</li>
      </ul>
      <p>Reach the Folio target (shown above the tubes) to unlock the next vault.</p>
    `;
    inner.appendChild(this.textButton('Close', onClose));
    modal.appendChild(inner);
    this.app.appendChild(modal);
  }

  renderSettings(settings: { sound: boolean; music: boolean; reducedMotion: boolean; colorBlind: boolean }, onChange: (patch: Partial<typeof settings>) => void, onClose: () => void): void {
    this.clear();
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const inner = document.createElement('div');
    inner.className = 'modal-inner';
    inner.innerHTML = `<h2>Settings</h2>`;

    const makeToggle = (label: string, key: keyof typeof settings) => {
      const row = document.createElement('label');
      row.className = 'setting-row';
      row.textContent = label;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = settings[key];
      input.addEventListener('change', () => onChange({ [key]: input.checked }));
      row.appendChild(input);
      return row;
    };

    inner.appendChild(makeToggle('Sound', 'sound'));
    inner.appendChild(makeToggle('Music', 'music'));
    inner.appendChild(makeToggle('Reduced Motion', 'reducedMotion'));
    inner.appendChild(makeToggle('Color-Blind Shapes', 'colorBlind'));
    inner.appendChild(this.textButton('Close', onClose));
    modal.appendChild(inner);
    this.app.appendChild(modal);
  }

  showToast(text: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = text;
    this.app.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  }

  private iconButton(label: string, onClick: () => void): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }

  private textButton(label: string, onClick: () => void): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'text-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
  }
}
