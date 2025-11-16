import { useState, useEffect, useCallback } from 'react';
import { PropertyFilters } from '@/types/property';

export interface SavedSearch {
  id: string;
  name: string;
  filters: PropertyFilters;
  createdAt: string;
}

const SAVED_SEARCHES_KEY = 'yr-inmobiliaria-saved-searches';

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
    } catch (error) {
      console.error('Error saving searches:', error);
    }
  }, [savedSearches]);

  const saveSearch = useCallback((name: string, filters: PropertyFilters) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };

    setSavedSearches(prev => [...prev, newSearch]);
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'save_search', {
        search_name: name,
      });
    }

    return newSearch;
  }, []);

  const deleteSearch = useCallback((searchId: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId));
    
    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'delete_search', {
        search_id: searchId,
      });
    }
  }, []);

  const updateSearch = useCallback((searchId: string, name: string, filters: PropertyFilters) => {
    setSavedSearches(prev =>
      prev.map(search =>
        search.id === searchId
          ? { ...search, name, filters }
          : search
      )
    );
  }, []);

  const getSearch = useCallback((searchId: string) => {
    return savedSearches.find(search => search.id === searchId);
  }, [savedSearches]);

  return {
    savedSearches,
    saveSearch,
    deleteSearch,
    updateSearch,
    getSearch,
    count: savedSearches.length,
  };
}
