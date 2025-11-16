import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { logger } from '@/utils/logger';

const FAVORITES_KEY = 'yr-inmobiliaria-favorites';

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load favorites from localStorage (for guests) or Supabase (for authenticated users)
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      
      if (user) {
        // Load from Supabase for authenticated users
        try {
          const { data, error } = await supabase
            .from('user_favorites')
            .select('property_id')
            .eq('user_id', user.id);

          if (error) throw error;

          const propertyIds = data?.map(fav => fav.property_id) || [];
          setFavorites(propertyIds);

          // Sync any localStorage favorites to database on login
          const localFavorites = getLocalFavorites();
          if (localFavorites.length > 0) {
            await syncLocalFavoritesToDatabase(localFavorites, propertyIds);
          }
        } catch (error) {
          logger.error('Error loading favorites from database', error);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los favoritos',
            variant: 'destructive',
          });
        }
      } else {
        // Load from localStorage for guests
        setFavorites(getLocalFavorites());
      }
      
      setIsLoading(false);
    };

    loadFavorites();
  }, [user, toast]);

  // Helper: Get favorites from localStorage
  const getLocalFavorites = (): string[] => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper: Sync localStorage favorites to database when user logs in
  const syncLocalFavoritesToDatabase = async (localFavorites: string[], dbFavorites: string[]) => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    try {
      // Find favorites that are in localStorage but not in database
      const favoritesToSync = localFavorites.filter(id => !dbFavorites.includes(id));
      
      if (favoritesToSync.length > 0) {
        const { error } = await supabase
          .from('user_favorites')
          .insert(
            favoritesToSync.map(propertyId => ({
              user_id: user.id,
              property_id: propertyId,
            }))
          );

        if (error) throw error;

        // Update state with merged favorites
        setFavorites([...dbFavorites, ...favoritesToSync]);
        
        // Clear localStorage after successful sync
        localStorage.removeItem(FAVORITES_KEY);
      }
    } catch (error) {
      logger.error('Error syncing favorites to database', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Save to localStorage for guests
  useEffect(() => {
    if (!user && favorites.length >= 0) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: favorites }));
      } catch (error) {
        logger.error('Error saving favorites to localStorage', error);
      }
    }
  }, [favorites, user]);

  const addFavorite = useCallback(async (propertyId: string) => {
    if (favorites.includes(propertyId)) return;

    // Optimistic update
    setFavorites(prev => [...prev, propertyId]);

    if (user) {
      // Save to database
      try {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            property_id: propertyId,
          });

        if (error) throw error;
      } catch (error) {
        // Revert on error
        setFavorites(prev => prev.filter(id => id !== propertyId));
        logger.error('Error adding favorite', error);
        toast({
          title: 'Error',
          description: 'No se pudo agregar a favoritos',
          variant: 'destructive',
        });
        return;
      }
    }

    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'add_to_favorites', {
        content_type: 'property',
        item_id: propertyId,
      });
    }
  }, [favorites, user, toast]);

  const removeFavorite = useCallback(async (propertyId: string) => {
    if (!favorites.includes(propertyId)) return;

    // Optimistic update
    setFavorites(prev => prev.filter(id => id !== propertyId));

    if (user) {
      // Remove from database
      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) throw error;
      } catch (error) {
        // Revert on error
        setFavorites(prev => [...prev, propertyId]);
        logger.error('Error removing favorite', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar de favoritos',
          variant: 'destructive',
        });
        return;
      }
    }

    // Analytics event
    if (window.gtag) {
      window.gtag('event', 'remove_from_favorites', {
        content_type: 'property',
        item_id: propertyId,
      });
    }
  }, [favorites, user, toast]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      await removeFavorite(propertyId);
    } else {
      await addFavorite(propertyId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((propertyId: string) => {
    return favorites.includes(propertyId);
  }, [favorites]);

  const clearFavorites = useCallback(async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error clearing favorites:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron limpiar los favoritos',
          variant: 'destructive',
        });
        return;
      }
    }
    
    setFavorites([]);
  }, [user, toast]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
    isLoading,
  };
}
