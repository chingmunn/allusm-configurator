import type { FrameFinish, PanelFinish, RailFinish } from './types';

export const panelFinishColors: Record<PanelFinish, string> = {
  'natural-oak': '#d0b18b',
  walnut: '#6f4d37',
  'blue-stain': '#406b8c',
  'red-stain': '#8a433f',
  'dark-green': '#365845',
  'light-grey-metal': '#bcc3c8',
  'dark-metal': '#4a5056',
  'clear-glass': '#dff4ff',
};

export type PanelMaterialSpec = {
  color: string;
  opacity: number;
  roughness: number;
  metalness: number;
};

export const panelFinishMaterials: Record<PanelFinish, PanelMaterialSpec> = {
  'natural-oak': {
    color: '#d0b18b',
    opacity: 1,
    roughness: 0.58,
    metalness: 0.06,
  },
  walnut: {
    color: '#6f4d37',
    opacity: 1,
    roughness: 0.62,
    metalness: 0.04,
  },
  'blue-stain': {
    color: '#406b8c',
    opacity: 1,
    roughness: 0.5,
    metalness: 0.08,
  },
  'red-stain': {
    color: '#8a433f',
    opacity: 1,
    roughness: 0.52,
    metalness: 0.08,
  },
  'dark-green': {
    color: '#365845',
    opacity: 1,
    roughness: 0.56,
    metalness: 0.06,
  },
  'light-grey-metal': {
    color: '#bcc3c8',
    opacity: 1,
    roughness: 0.32,
    metalness: 0.62,
  },
  'dark-metal': {
    color: '#4a5056',
    opacity: 1,
    roughness: 0.28,
    metalness: 0.68,
  },
  'clear-glass': {
    color: '#dff4ff',
    opacity: 0.34,
    roughness: 0.08,
    metalness: 0.02,
  },
};

export const frameFinishColors: Record<FrameFinish, string> = {
  'raw-aluminium': '#b8c0c7',
  black: '#23262b',
};

export const railFinishColors: Record<RailFinish, string> = {
  'light-grey-metal': '#c9ced2',
  'dark-metal': '#4b5057',
};
