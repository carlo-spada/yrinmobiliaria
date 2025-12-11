import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

import { PropertyFilters } from '@/types/property';
import { logger } from '@/utils/logger';

export interface SavedSearch {
  id: string;
  name: string;
  filters: PropertyFilters;
  createdAt: string;
}

const SAVED_SEARCHES_KEY = 'yr-inmobiliaria-saved-searches';

// Validation schema for saved searches
const SavedSearchSchema = z.object({
  id: z.string(),
  name: z.string(),
  filters: z.record(z.unknown()), // PropertyFilters is a flexible record type
  createdAt: z.string(),
});

const SavedSearchesSchema = z.array(SavedSearchSchema);

/**
 * Load and validate saved searches from localStorage
 */
const loadSavedSearches = (): SavedSearch[] => {
  try {
    const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    const validated = SavedSearchesSchema.safeParse(parsed);

    if (!validated.success) {
      logger.warn('Invalid saved searches in localStorage, clearing');
      localStorage.removeItem(SAVED_SEARCHES_KEY);
      return [];
    }

    return validated.data as SavedSearch[];
  } catch {
    logger.warn('Failed to parse saved searches from localStorage');
    return [];
  }
};

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>(loadSavedSearches);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(savedSearches));
    } catch (error) {
      logger.error('Error saving searches:', error);
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
