export type Metal =
  | 'ore'
  | 'tin'
  | 'lead'
  | 'iron'
  | 'brass'
  | 'copper'
  | 'silver'
  | 'gold'
  | 'electrum'
  | 'platinum'
  | 'mithril'
  | 'orichalcum'
  | 'aetherium';

export const METALS: Metal[] = [
  'ore',
  'tin',
  'lead',
  'iron',
  'brass',
  'copper',
  'silver',
  'gold',
  'electrum',
  'platinum',
  'mithril',
  'orichalcum',
  'aetherium'
];

export type Coin = {
  metal: Metal;
  id: string;
};

export type Tube = {
  coins: Coin[];
};

export type StateId = 'stamp' | 'flush' | 'none';

export type Folio = {
  id: string;
  tier: string;
  name: string;
  unlockMetal: Metal | null;
  metals: Metal[];
  weights: Record<string, number>;
  tubes: number;
  capacity: number;
  planchets: number;
  flushes: number;
  moveBudget: number;
};

export type GameState = {
  folioId: string;
  tubes: Tube[];
  pool: Coin[];
  planchets: number;
  flushes: number;
  moves: number;
  score: number;
  selectedTube: number | null;
  pendingState: StateId;
  completed: boolean;
  stars: number;
  history: HistoryFrame[];
  register: Set<string>;
  comboMultiplier: number;
};

export type HistoryFrame = {
  tubes: Tube[];
  pool: Coin[];
  planchets: number;
  flushes: number;
  moves: number;
  score: number;
  completed: boolean;
  stars: number;
  register: string[];
};
