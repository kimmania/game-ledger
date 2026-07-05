import { Metal } from '../engine/types.ts';

export const METAL_CONFIG: Record<Metal, { label: string; hex: string; shape: string; glow: string }> = {
  ore: { label: 'Ore', hex: '#5d4037', shape: 'grid', glow: 'rgba(93,64,55,0.35)' },
  tin: { label: 'Tin', hex: '#9e9e9e', shape: 'hex', glow: 'rgba(158,158,158,0.4)' },
  lead: { label: 'Lead', hex: '#455a64', shape: 'shield', glow: 'rgba(69,90,100,0.4)' },
  iron: { label: 'Iron', hex: '#8B4513', shape: 'grid', glow: 'rgba(184,134,11,0.35)' },
  brass: { label: 'Brass', hex: '#d4af37', shape: 'wave', glow: 'rgba(255,193,7,0.4)' },
  copper: { label: 'Copper', hex: '#B87333', shape: 'wave', glow: 'rgba(255,140,0,0.4)' },
  silver: { label: 'Silver', hex: '#C0C0C0', shape: 'star', glow: 'rgba(255,255,255,0.45)' },
  electrum: { label: 'Electrum', hex: '#f5e082', shape: 'crown', glow: 'rgba(245,224,130,0.5)' },
  gold: { label: 'Gold', hex: '#FFD700', shape: 'crown', glow: 'rgba(255,215,0,0.5)' },
  platinum: { label: 'Platinum', hex: '#E5E4E2', shape: 'sun', glow: 'rgba(173,216,230,0.45)' },
  mithril: { label: 'Mithril', hex: '#4fc3f7', shape: 'rings', glow: 'rgba(79,195,247,0.5)' },
  orichalcum: { label: 'Orichalcum', hex: '#ff7043', shape: 'sun', glow: 'rgba(255,112,67,0.45)' },
  aetherium: { label: 'Aetherium', hex: '#9B59B6', shape: 'rings', glow: 'rgba(46,204,113,0.5)' }
};

export function svgShape(shape: string, color: string): string {
  switch (shape) {
    case 'grid':
      return `<rect x='12' y='12' width='6' height='6' fill='none' stroke='${color}' stroke-width='1.5'/><rect x='22' y='12' width='6' height='6' fill='none' stroke='${color}' stroke-width='1.5'/><rect x='12' y='22' width='6' height='6' fill='none' stroke='${color}' stroke-width='1.5'/><rect x='22' y='22' width='6' height='6' fill='none' stroke='${color}' stroke-width='1.5'/>`;
    case 'hex':
      return `<path d='M20 8 L40 8 L50 28 L40 48 L20 48 L10 28 Z' fill='none' stroke='${color}' stroke-width='2.5' stroke-linejoin='round'/>`;
    case 'wave':
      return `<path d='M10 25 Q20 15 30 25 T50 25' fill='none' stroke='${color}' stroke-width='2.5' stroke-linecap='round'/>`;
    case 'star':
      return `<path d='M30 10 L34 22 L47 22 L36 30 L40 42 L30 34 L20 42 L24 30 L13 22 L26 22 Z' fill='${color}'/>`;
    case 'shield':
      return `<path d='M15 12 L45 12 L45 30 Q45 42 30 48 Q15 42 15 30 Z' fill='none' stroke='${color}' stroke-width='2.5' stroke-linejoin='round'/>`;
    case 'crown':
      return `<path d='M12 38 L12 20 L20 28 L30 14 L40 28 L48 20 L48 38 Z' fill='none' stroke='${color}' stroke-width='2.5' stroke-linejoin='round'/>`;
    case 'sun':
      return `<circle cx='30' cy='28' r='10' fill='none' stroke='${color}' stroke-width='2'/><path d='M30 8 L30 14 M30 42 L30 48 M10 28 L16 28 M44 28 L50 28 M16 14 L20 18 M44 42 L40 38 M44 14 L40 18 M16 42 L20 38' stroke='${color}' stroke-width='2'/>`;
    case 'rings':
      return `<circle cx='30' cy='28' r='8' fill='none' stroke='${color}' stroke-width='2'/><circle cx='30' cy='28' r='14' fill='none' stroke='${color}' stroke-width='1.5'/><circle cx='30' cy='28' r='19' fill='none' stroke='${color}' stroke-width='1'/>`;
    default:
      return '';
  }
}
