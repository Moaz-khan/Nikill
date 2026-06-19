'use client';
import { fetchJson } from '../utils/fetchApi';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

export interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  category?: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: Omit<FavoriteItem, 'id' | 'productId'> & { id?: string; productId?: string }) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  isAddingFav: boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const API = '/api/user';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isAddingFav, setIsAddingFav] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useAuthStore();

  // Fetch favorites from API on login / mount
  const fetchFavorites = useCallback(async () => {
    if (!isLoggedIn || !user?.id) return;
    setLoading(true);
    try {
      const data = await fetchJson(`${API}/favorites/${user.id}`);
      if (Array.isArray(data)) {
        setFavorites(data.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          name: item.name,
          price: item.price,
          originalPrice: item.original_price,
          image: item.image,
          category: item.category
        })));
      }
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addToFavorites = async (newItem: Omit<FavoriteItem, 'id' | 'productId'> & { id?: string; productId?: string }) => {
    setIsAddingFav(true);
    const productId = newItem.productId || newItem.id || '';

    if (isLoggedIn && user?.id) {
      try {
        await fetchJson(`${API}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId,
            name: newItem.name,
            price: newItem.price,
            originalPrice: newItem.originalPrice,
            image: newItem.image,
            category: newItem.category
          })
        });
        await fetchFavorites();
      } catch (err) {
        console.error('Add to favorites error:', err);
      }
    } else {
      // Local state for guests
      setFavorites(prev => {
        if (prev.find(item => item.productId === productId)) return prev;
        return [...prev, { ...newItem, id: productId, productId }];
      });
    }

    setTimeout(() => setIsAddingFav(false), 800);
  };

  const removeFromFavorites = async (productId: string) => {
    if (isLoggedIn && user?.id) {
      try {
        await fetchJson(`${API}/favorites/${user.id}/${productId}`, { method: 'DELETE' });
        setFavorites(prev => prev.filter(item => item.productId !== productId));
      } catch (err) {
        console.error('Remove from favorites error:', err);
      }
    } else {
      setFavorites(prev => prev.filter(item => item.productId !== productId && item.id !== productId));
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(item => item.productId === productId || item.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite, isAddingFav, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
