import { z } from 'zod';

import { logger } from './logger';

const FAVORITES_KEY = "yr-inmobiliaria-favorites";

// Validation schema for favorites - array of UUID strings
const FavoritesSchema = z.array(z.string().uuid());

export const getLocalFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    const validated = FavoritesSchema.safeParse(parsed);

    if (!validated.success) {
      logger.warn('Invalid favorites data in localStorage, clearing');
      localStorage.removeItem(FAVORITES_KEY);
      return [];
    }

    return validated.data;
  } catch {
    logger.warn('Failed to parse favorites from localStorage');
    return [];
  }
};

export const persistLocalFavorites = (favorites: string[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent("favoritesChanged", { detail: favorites }));
  } catch {
    // swallow; caller logs in hook
  }
};

export const FAVORITES_STORAGE_KEY = FAVORITES_KEY;
