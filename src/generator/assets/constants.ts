export const LAYER_GROUPS = [
  'Faces',
  'Heads',
  'Eyes',
  'Eyebrows',
  'Noses',
  'Mouths',
  'Cheeks',
  'Ears',
] as const;
export type TLayerGroup = typeof LAYER_GROUPS[number];
export type TLayerMap = Record<TLayerGroup, string[]>;

export const LAYER_TAG = {
  // не включать в рендер
  Experimental: '#Exp',
  // необходимо перебраться несколько цветов
  Multicolor: '#Multi',
} as const;

export const TILE_PROPS = {
  type: {
    eyes: 'EYES',
    skin: 'SKIN',
    hairs: 'HAIRS',
    empty: 'EMPTY',
  },
} as const;
