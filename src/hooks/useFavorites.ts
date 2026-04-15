import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { supabase } from '@/integrations/supabase/client';
import {
  FAVORITES_STORAGE_KEY,
  getLocalFavorites,
  persistLocalFavorites,
} from '@/utils/favoritesStorage';
import { logger } from '@/utils/logger';

import { useToast } from './use-toast';
import { usePublicSession } from './usePublicSession';

const GUEST_FAVORITES_KEY = 'guest';

const loadFavorites = async (userId: string | null): Promise<string[]> => {
  if (!userId) {
    return getLocalFavorites();
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('property_id')
    .eq('user_id', userId);

  if (error) {
    logger.error('Error loading favorites from database', error);
    return [];
  }

  const dbFavorites = data?.map((favorite) => favorite.property_id) ?? [];
  const localFavorites = getLocalFavorites();
  const dbFavoritesSet = new Set(dbFavorites);
  const favoritesToSync = localFavorites.filter((propertyId) => !dbFavoritesSet.has(propertyId));

  if (favoritesToSync.length === 0) {
    return dbFavorites;
  }

  const mergedFavorites = [...new Set([...dbFavorites, ...favoritesToSync])];

  const { error: syncError } = await supabase.from('user_favorites').insert(
    favoritesToSync.map((propertyId) => ({
      user_id: userId,
      property_id: propertyId,
    }))
  );

  if (syncError) {
    logger.error('Error syncing local favorites to database', syncError);
    return mergedFavorites;
  }

  localStorage.removeItem(FAVORITES_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('favoritesChanged', { detail: [] }));
  return mergedFavorites;
};

export function useFavorites() {
  const { user, loading: sessionLoading } = usePublicSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const activeKey = useMemo(
    () => ['favorites', user?.id ?? GUEST_FAVORITES_KEY] as const,
    [user?.id]
  );

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: activeKey,
    queryFn: () => loadFavorites(user?.id ?? null),
    enabled: !sessionLoading,
    placeholderData: [],
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (user) {
      return;
    }

    const syncGuestFavorites = (event?: Event) => {
      if (event instanceof StorageEvent && event.key && event.key !== FAVORITES_STORAGE_KEY) {
        return;
      }

      queryClient.setQueryData(['favorites', GUEST_FAVORITES_KEY], getLocalFavorites());
    };

    window.addEventListener('storage', syncGuestFavorites);
    window.addEventListener('favoritesChanged', syncGuestFavorites);

    return () => {
      window.removeEventListener('storage', syncGuestFavorites);
      window.removeEventListener('favoritesChanged', syncGuestFavorites);
    };
  }, [queryClient, user]);

  const addFavorite = useCallback(
    async (propertyId: string) => {
      if (favorites.includes(propertyId)) {
        return;
      }

      const previousFavorites = favorites;
      const nextFavorites = [...favorites, propertyId];

      queryClient.setQueryData(activeKey, nextFavorites);

      if (!user) {
        persistLocalFavorites(nextFavorites);
        return;
      }

      try {
        const { error } = await supabase.from('user_favorites').insert({
          user_id: user.id,
          property_id: propertyId,
        });

        if (error) {
          throw error;
        }
      } catch (error) {
        queryClient.setQueryData(activeKey, previousFavorites);
        logger.error('Error adding favorite', error);
        toast({
          title: 'Error',
          description: 'No se pudo agregar a favoritos',
          variant: 'destructive',
        });
        return;
      }

      if (window.gtag) {
        window.gtag('event', 'add_to_favorites', {
          content_type: 'property',
          item_id: propertyId,
        });
      }
    },
    [activeKey, favorites, queryClient, toast, user]
  );

  const removeFavorite = useCallback(
    async (propertyId: string) => {
      if (!favorites.includes(propertyId)) {
        return;
      }

      const previousFavorites = favorites;
      const nextFavorites = favorites.filter((id) => id !== propertyId);

      queryClient.setQueryData(activeKey, nextFavorites);

      if (!user) {
        persistLocalFavorites(nextFavorites);
        return;
      }

      try {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) {
          throw error;
        }
      } catch (error) {
        queryClient.setQueryData(activeKey, previousFavorites);
        logger.error('Error removing favorite', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar de favoritos',
          variant: 'destructive',
        });
        return;
      }

      if (window.gtag) {
        window.gtag('event', 'remove_from_favorites', {
          content_type: 'property',
          item_id: propertyId,
        });
      }
    },
    [activeKey, favorites, queryClient, toast, user]
  );

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (favorites.includes(propertyId)) {
        await removeFavorite(propertyId);
        return;
      }

      await addFavorite(propertyId);
    },
    [addFavorite, favorites, removeFavorite]
  );

  const clearFavorites = useCallback(async () => {
    const previousFavorites = favorites;

    queryClient.setQueryData(activeKey, []);

    if (!user) {
      persistLocalFavorites([]);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      queryClient.setQueryData(activeKey, previousFavorites);
      logger.error('Error clearing favorites', error);
      toast({
        title: 'Error',
        description: 'No se pudieron limpiar los favoritos',
        variant: 'destructive',
      });
    }
  }, [activeKey, favorites, queryClient, toast, user]);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback(
    (propertyId: string) => favoritesSet.has(propertyId),
    [favoritesSet]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
    isLoading: sessionLoading || isLoading,
  };
}
