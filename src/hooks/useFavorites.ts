import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { supabase } from '@/integrations/supabase/client';
import { FAVORITES_STORAGE_KEY, getLocalFavorites, persistLocalFavorites } from '@/utils/favoritesStorage';
import { logger } from '@/utils/logger';

import { useToast } from './use-toast';
import { useAuth } from './useAuth';


// Rate limiting configuration
const RATE_LIMIT_MS = 500; // Minimum time between operations per property

export function useFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AbortController ref to cancel pending operations on user change
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track current user ID to prevent stale updates
  const currentUserIdRef = useRef<string | null>(null);
  // Rate limiting: track last operation time per property
  const lastOperationTimeRef = useRef<Map<string, number>>(new Map());
  // Pending operations to debounce rapid toggles
  const pendingOperationsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load favorites from localStorage (for guests) or Supabase (for authenticated users)
  // With proper cancellation to prevent race conditions
  useEffect(() => {
    const loadFavorites = async () => {
      // Cancel any pending operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this operation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const userId = user?.id ?? null;
      currentUserIdRef.current = userId;

      setIsLoading(true);

      try {
        if (!userId) {
          // Anonymous user - use localStorage only
          if (!abortController.signal.aborted) {
            setFavorites(getLocalFavorites());
            setIsLoading(false);
          }
          return;
        }

        // Step 1: Load from database first
        const { data, error } = await supabase
          .from('user_favorites')
          .select('property_id')
          .eq('user_id', userId);

        // Check if operation was cancelled
        if (abortController.signal.aborted || currentUserIdRef.current !== userId) {
          return;
        }

        if (error) throw error;

        const dbFavorites = data?.map(fav => fav.property_id) || [];

        // Step 2: Check for local favorites to sync
        const localFavorites = getLocalFavorites();

        if (localFavorites.length > 0) {
          // Find favorites that are in localStorage but not in database
          const dbFavoritesSet = new Set(dbFavorites);
          const favoritesToSync = localFavorites.filter(id => !dbFavoritesSet.has(id));

          if (favoritesToSync.length > 0) {
            const { error: syncError } = await supabase
              .from('user_favorites')
              .insert(
                favoritesToSync.map(propertyId => ({
                  user_id: userId,
                  property_id: propertyId,
                }))
              );

            // Check if operation was cancelled
            if (abortController.signal.aborted || currentUserIdRef.current !== userId) {
              return;
            }

            if (syncError) {
              logger.error('Error syncing favorites to database', syncError);
            } else {
              // Clear localStorage after successful sync
              localStorage.removeItem(FAVORITES_STORAGE_KEY);
              // Update state with merged favorites
              setFavorites([...dbFavorites, ...favoritesToSync]);
              setIsLoading(false);
              return;
            }
          }
        }

        // Final check before updating state
        if (!abortController.signal.aborted && currentUserIdRef.current === userId) {
          setFavorites(dbFavorites);
        }
      } catch (error) {
        // Only show error if operation wasn't cancelled
        if (!abortController.signal.aborted && currentUserIdRef.current === (user?.id ?? null)) {
          logger.error('Error loading favorites from database', error);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los favoritos',
            variant: 'destructive',
          });
        }
      } finally {
        // Only update loading state if operation wasn't cancelled
        if (!abortController.signal.aborted && currentUserIdRef.current === (user?.id ?? null)) {
          setIsLoading(false);
        }
      }
    };

    loadFavorites();

    // Cleanup function - cancel pending operation on unmount or user change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user?.id, toast]);

  // Save to localStorage for guests
  useEffect(() => {
    if (!user && favorites.length >= 0) {
      persistLocalFavorites(favorites);
    }
  }, [favorites, user]);

  const addFavorite = useCallback(async (propertyId: string) => {
    if (favorites.includes(propertyId)) return;

    // Rate limiting check
    const now = Date.now();
    const lastOp = lastOperationTimeRef.current.get(propertyId) || 0;
    const timeSinceLastOp = now - lastOp;

    // Clear any pending operation for this property
    const pendingOp = pendingOperationsRef.current.get(propertyId);
    if (pendingOp) {
      clearTimeout(pendingOp);
      pendingOperationsRef.current.delete(propertyId);
    }

    // If rate limited, debounce the operation
    if (timeSinceLastOp < RATE_LIMIT_MS) {
      const delay = RATE_LIMIT_MS - timeSinceLastOp;
      const timeoutId = setTimeout(() => {
        pendingOperationsRef.current.delete(propertyId);
        lastOperationTimeRef.current.set(propertyId, Date.now());
        performAddFavorite(propertyId);
      }, delay);
      pendingOperationsRef.current.set(propertyId, timeoutId);
      // Still do optimistic update for UI responsiveness
      setFavorites(prev => prev.includes(propertyId) ? prev : [...prev, propertyId]);
      return;
    }

    lastOperationTimeRef.current.set(propertyId, now);
    await performAddFavorite(propertyId);

    async function performAddFavorite(propId: string) {
      // Optimistic update
      setFavorites(prev => prev.includes(propId) ? prev : [...prev, propId]);

      if (user) {
        // Save to database
        try {
          const { error } = await supabase
            .from('user_favorites')
            .insert({
              user_id: user.id,
              property_id: propId,
            });

          if (error) throw error;
        } catch (error) {
          // Revert on error
          setFavorites(prev => prev.filter(id => id !== propId));
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
          item_id: propId,
        });
      }
    }
  }, [favorites, user, toast]);

  const removeFavorite = useCallback(async (propertyId: string) => {
    if (!favorites.includes(propertyId)) return;

    // Rate limiting check
    const now = Date.now();
    const lastOp = lastOperationTimeRef.current.get(propertyId) || 0;
    const timeSinceLastOp = now - lastOp;

    // Clear any pending operation for this property
    const pendingOp = pendingOperationsRef.current.get(propertyId);
    if (pendingOp) {
      clearTimeout(pendingOp);
      pendingOperationsRef.current.delete(propertyId);
    }

    // If rate limited, debounce the operation
    if (timeSinceLastOp < RATE_LIMIT_MS) {
      const delay = RATE_LIMIT_MS - timeSinceLastOp;
      const timeoutId = setTimeout(() => {
        pendingOperationsRef.current.delete(propertyId);
        lastOperationTimeRef.current.set(propertyId, Date.now());
        performRemoveFavorite(propertyId);
      }, delay);
      pendingOperationsRef.current.set(propertyId, timeoutId);
      // Still do optimistic update for UI responsiveness
      setFavorites(prev => prev.filter(id => id !== propertyId));
      return;
    }

    lastOperationTimeRef.current.set(propertyId, now);
    await performRemoveFavorite(propertyId);

    async function performRemoveFavorite(propId: string) {
      // Optimistic update
      setFavorites(prev => prev.filter(id => id !== propId));

      if (user) {
        // Remove from database
        try {
          const { error } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('property_id', propId);

          if (error) throw error;
        } catch (error) {
          // Revert on error
          setFavorites(prev => [...prev, propId]);
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
          item_id: propId,
        });
      }
    }
  }, [favorites, user, toast]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (favorites.includes(propertyId)) {
      await removeFavorite(propertyId);
    } else {
      await addFavorite(propertyId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  // Use Set for O(1) lookup performance
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback((propertyId: string) => {
    return favoritesSet.has(propertyId);
  }, [favoritesSet]);

  const clearFavorites = useCallback(async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error) {
        logger.error('Error clearing favorites', error);
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
