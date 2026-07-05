import { Folio } from './engine/types.ts';

export const FOLIOS: Folio[] = [
  {
    id: 'mine-1',
    tier: 'mine',
    name: 'The Miners\' Vein',
    unlockMetal: 'tin',
    metals: ['ore'],
    weights: { ore: 1 },
    tubes: 5,
    capacity: 4,
    planchets: 2,
    flushes: 1,
    moveBudget: 20
  },
  {
    id: 'smelter-1',
    tier: 'smelter',
    name: 'The Smelter Yard',
    unlockMetal: 'lead',
    metals: ['ore', 'tin'],
    weights: { ore: 0.5, tin: 0.5 },
    tubes: 5,
    capacity: 4,
    planchets: 2,
    flushes: 1,
    moveBudget: 25
  },
  {
    id: 'coaling-1',
    tier: 'coaling',
    name: 'The Coaling Room',
    unlockMetal: 'iron',
    metals: ['ore', 'tin', 'lead'],
    weights: { ore: 0.4, tin: 0.3, lead: 0.3 },
    tubes: 5,
    capacity: 4,
    planchets: 2,
    flushes: 1,
    moveBudget: 30
  },
  {
    id: 'alloy-1',
    tier: 'alloy',
    name: 'The Alloy Works',
    unlockMetal: 'brass',
    metals: ['tin', 'lead', 'iron'],
    weights: { tin: 0.4, lead: 0.35, iron: 0.25 },
    tubes: 6,
    capacity: 4,
    planchets: 2,
    flushes: 1,
    moveBudget: 35
  },
  {
    id: 'teller-1',
    tier: 'teller',
    name: 'The Teller Hall',
    unlockMetal: 'copper',
    metals: ['lead', 'iron', 'brass'],
    weights: { lead: 0.35, iron: 0.4, brass: 0.25 },
    tubes: 6,
    capacity: 4,
    planchets: 2,
    flushes: 1,
    moveBudget: 40
  },
  {
    id: 'mintage-1',
    tier: 'mintage',
    name: 'The Mintage',
    unlockMetal: 'silver',
    metals: ['iron', 'brass', 'copper'],
    weights: { iron: 0.35, brass: 0.35, copper: 0.3 },
    tubes: 7,
    capacity: 4,
    planchets: 2,
    flushes: 1,
    moveBudget: 45
  },
  {
    id: 'counting-1',
    tier: 'counting',
    name: 'The Counting House',
    unlockMetal: 'gold',
    metals: ['brass', 'copper', 'silver'],
    weights: { brass: 0.25, copper: 0.45, silver: 0.3 },
    tubes: 7,
    capacity: 5,
    planchets: 1,
    flushes: 2,
    moveBudget: 60
  },
  {
    id: 'exchange-1',
    tier: 'exchange',
    name: 'The Exchange Floor',
    unlockMetal: 'electrum',
    metals: ['copper', 'silver', 'gold'],
    weights: { copper: 0.3, silver: 0.5, gold: 0.2 },
    tubes: 8,
    capacity: 5,
    planchets: 1,
    flushes: 2,
    moveBudget: 75
  },
  {
    id: 'vault-1',
    tier: 'vault',
    name: 'The Vault Core',
    unlockMetal: 'platinum',
    metals: ['silver', 'gold', 'electrum'],
    weights: { silver: 0.3, gold: 0.5, electrum: 0.2 },
    tubes: 8,
    capacity: 5,
    planchets: 1,
    flushes: 2,
    moveBudget: 90
  },
  {
    id: 'arcane-1',
    tier: 'arcane',
    name: 'The Arcane Refinery',
    unlockMetal: 'mithril',
    metals: ['gold', 'electrum', 'platinum'],
    weights: { gold: 0.4, electrum: 0.35, platinum: 0.25 },
    tubes: 9,
    capacity: 6,
    planchets: 1,
    flushes: 2,
    moveBudget: 105
  },
  {
    id: 'sunforge-1',
    tier: 'sunforge',
    name: 'The Sunforge',
    unlockMetal: 'orichalcum',
    metals: ['electrum', 'platinum', 'mithril'],
    weights: { electrum: 0.3, platinum: 0.45, mithril: 0.25 },
    tubes: 9,
    capacity: 6,
    planchets: 1,
    flushes: 2,
    moveBudget: 120
  },
  {
    id: 'assayer-1',
    tier: 'assayer',
    name: 'The Assayer\'s Forge',
    unlockMetal: 'aetherium',
    metals: ['platinum', 'mithril', 'orichalcum'],
    weights: { platinum: 0.35, mithril: 0.35, orichalcum: 0.3 },
    tubes: 10,
    capacity: 6,
    planchets: 1,
    flushes: 2,
    moveBudget: 140
  },
  {
    id: 'director-1',
    tier: 'director',
    name: 'The Director\'s Balcony',
    unlockMetal: null,
    metals: ['gold', 'electrum', 'platinum', 'mithril', 'orichalcum', 'aetherium'],
    weights: { gold: 0.2, electrum: 0.18, platinum: 0.16, mithril: 0.15, orichalcum: 0.13, aetherium: 0.1 },
    tubes: 10,
    capacity: 7,
    planchets: 0,
    flushes: 1,
    moveBudget: 160
  }
];

export const FOLIO_ORDER = FOLIOS.map((f) => f.id);

export function getFolio(id: string): Folio {
  const found = FOLIOS.find((f) => f.id === id);
  if (!found) throw new Error(`Unknown folio ${id}`);
  return found;
}

export function nextFolioId(currentId: string): string | null {
  const idx = FOLIO_ORDER.indexOf(currentId);
  return idx >= 0 && idx < FOLIO_ORDER.length - 1 ? FOLIO_ORDER[idx + 1] : null;
}
