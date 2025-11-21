const FAVORITES_KEY = "yr-inmobiliaria-favorites";

export const getLocalFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
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
