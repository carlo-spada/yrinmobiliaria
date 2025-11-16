import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'yr-inmobiliaria-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: favorites }));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  const addFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) return prev;
      return [...prev, propertyId];
    });
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'add_to_favorites', {
        content_type: 'property',
        item_id: propertyId,
      });
    }
  }, []);

  const removeFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => prev.filter(id => id !== propertyId));
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'remove_from_favorites', {
        content_type: 'property',
        item_id: propertyId,
      });
    }
  }, []);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) {
        // Analytics event
        if (window.gtag) {
          window.gtag('event', 'remove_from_favorites', {
            content_type: 'property',
            item_id: propertyId,
          });
        }
        return prev.filter(id => id !== propertyId);
      } else {
        // Analytics event
        if (window.gtag) {
          window.gtag('event', 'add_to_favorites', {
            content_type: 'property',
            item_id: propertyId,
          });
        }
        return [...prev, propertyId];
      }
    });
  }, []);

  const isFavorite = useCallback((propertyId: string) => {
    return favorites.includes(propertyId);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  };
}
