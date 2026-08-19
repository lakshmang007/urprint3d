import { MaterialOption, ColorOption } from '../types';

export const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    id: 'pla-matte',
    name: 'PLA Matte',
    description: 'Eco-friendly cornstarch filament with a soft satin finish and clean layer lines.',
    priceMultiplier: 1.0,
    badge: 'Popular',
    properties: {
      durability: 3,
      flexibility: 1,
      finish: 'Matte Satin',
    },
  },
  {
    id: 'petg-tough',
    name: 'Tough PETG',
    description: 'Impact-resistant & heat-tolerant polymer ideal for mechanical and outdoor items.',
    priceMultiplier: 1.25,
    badge: 'Durable',
    properties: {
      durability: 4,
      flexibility: 3,
      finish: 'Semi-Gloss',
    },
  },
  {
    id: 'resin-hd',
    name: 'High Detail Resin',
    description: 'UV-cured photopolymer with sub-micron 0.025mm resolution for ultra-fine miniatures.',
    priceMultiplier: 1.6,
    badge: 'Ultra-Fine',
    properties: {
      durability: 3,
      flexibility: 1,
      finish: 'Glass Smooth',
    },
  },
  {
    id: 'carbon-fiber',
    name: 'Carbon Fiber',
    description: 'Reinforced PETG infused with micro carbon fibers for exceptional rigidity.',
    priceMultiplier: 1.9,
    badge: 'Pro Grade',
    properties: {
      durability: 5,
      flexibility: 1,
      finish: 'Textured Dark',
    },
  },
  {
    id: 'dual-silk',
    name: 'Dual Silk',
    description: 'Co-extruded dual-color sheen filament that changes color in varying light.',
    priceMultiplier: 1.35,
    badge: 'Artisan',
    properties: {
      durability: 3,
      flexibility: 2,
      finish: 'Iridescent Metallic',
    },
  },
  {
    id: 'flex-tpu',
    name: 'Flex TPU',
    description: 'Rubber-like elastomeric polymer with high elasticity and grip.',
    priceMultiplier: 1.45,
    badge: 'Flexible',
    properties: {
      durability: 5,
      flexibility: 5,
      finish: 'Matte Rubber',
    },
  },
];

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'obsidian-black', name: 'Obsidian Black', hex: '#1C1917', popular: true },
  { id: 'marble-white', name: 'Marble White', hex: '#F5F5F4', popular: true },
  { id: 'silk-emerald', name: 'Silk Emerald', hex: '#047857' },
  { id: 'electric-cobalt', name: 'Electric Cobalt', hex: '#1D4ED8', popular: true },
  { id: 'burnt-terracotta', name: 'Burnt Terracotta', hex: '#C2410C' },
  { id: 'titanium-silver', name: 'Titanium Silver', hex: '#94A3B8' },
  { id: 'copper-gold', name: 'Silk Copper', hex: '#B45309' },
  { id: 'neon-violet', name: 'Neon Violet', hex: '#7C3AED' },
];
