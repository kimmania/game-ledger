import { Folio } from './engine/types.ts';

export const FOLIOS: Folio[] = [
  {
    id: 'coaling-1',
    tier: 'coaling',
    name: 'The Coaling Room',
    target: { copper: 2 },
    metals: ['iron'],
    weights: { iron: 1 },
    tubes: 5,
    capacity: 4,
    planchets: 2,
    flushes: 1,
    moveBudget: 30
  },
  {
    id: 'teller-1',
    tier: 'teller',
    name: 'The Teller Hall',
    target: { silver: 1, copper: 2 },
    metals: ['iron', 'copper'],
    weights: { iron: 0.7, copper: 0.3 },
    tubes: 6,
    capacity: 4,
    planchets: 2,
    flushes: 1,
    moveBudget: 45
  },
  {
    id: 'counting-1',
    tier: 'counting',
    name: 'The Counting House',
    target: { silver: 2 },
    metals: ['iron', 'copper', 'silver'],
    weights: { iron: 0.55, copper: 0.3, silver: 0.15 },
    tubes: 7,
    capacity: 5,
    planchets: 1,
    flushes: 2,
    moveBudget: 60
  },
  {
    id: 'vault-1',
    tier: 'vault',
    name: 'The Vault Core',
    target: { gold: 1, silver: 2 },
    metals: ['iron', 'copper', 'silver', 'gold'],
    weights: { iron: 0.4, copper: 0.3, silver: 0.2, gold: 0.1 },
    tubes: 8,
    capacity: 5,
    planchets: 1,
    flushes: 1,
    moveBudget: 80
  },
  {
    id: 'assayer-1',
    tier: 'assayer',
    name: 'The Assayer\'s Forge',
    target: { gold: 2 },
    metals: ['iron', 'copper', 'silver', 'gold', 'platinum'],
    weights: { iron: 0.3, copper: 0.25, silver: 0.2, gold: 0.15, platinum: 0.1 },
    tubes: 9,
    capacity: 6,
    planchets: 1,
    flushes: 1,
    moveBudget: 100
  },
  {
    id: 'director-1',
    tier: 'director',
    name: 'The Director\'s Balcony',
    target: { platinum: 1 },
    metals: ['iron', 'copper', 'silver', 'gold', 'platinum', 'aetherium'],
    weights: { iron: 0.25, copper: 0.2, silver: 0.18, gold: 0.15, platinum: 0.12, aetherium: 0.1 },
    tubes: 10,
    capacity: 6,
    planchets: 0,
    flushes: 1,
    moveBudget: 120
  },
  {
    id: 'aetherium-1',
    tier: 'aetherium',
    name: 'The Aetherium Wing',
    target: { aetherium: 1 },
    metals: ['iron', 'copper', 'silver', 'gold', 'platinum', 'aetherium'],
    weights: { iron: 0.2, copper: 0.18, silver: 0.18, gold: 0.17, platinum: 0.15, aetherium: 0.12 },
    tubes: 11,
    capacity: 6,
    planchets: 0,
    flushes: 0,
    moveBudget: 150
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
