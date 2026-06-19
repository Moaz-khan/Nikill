'use client';
import { fetchJson } from '../utils/fetchApi';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';

export interface CartItem {
  id: string;         // DB row id (UUID) or local id
  cartItemId: string; // productId-color-size
  productId: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'cartItemId' | 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isAdding: boolean;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API = '/api/user';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useAuthStore();

  // Fetch cart from API on login / mount
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !user?.id) return;
    setLoading(true);
    try {
      const data = await fetchJson(`${API}/cart/${user.id}`);
      if (Array.isArray(data)) {
        setItems(data.map((item: any) => ({
          id: item.id,
          cartItemId: item.cart_item_id,
          productId: item.product_id,
          name: item.name,
          price: item.price,
          originalPrice: item.original_price,
          image: item.image,
          color: item.color,
          size: item.size,
          quantity: item.quantity
        })));
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user?.id]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (newItem: Omit<CartItem, 'id' | 'cartItemId' | 'quantity'>) => {
    setIsAdding(true);
    const cartItemId = `${newItem.productId}-${newItem.color}-${newItem.size}`;

    if (isLoggedIn && user?.id) {
      // API call
      try {
        await fetchJson(`${API}/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: newItem.productId,
            name: newItem.name,
            price: newItem.price,
            originalPrice: newItem.originalPrice,
            image: newItem.image,
            color: newItem.color,
            size: newItem.size
          })
        });
        await fetchCart(); // Refresh from DB
      } catch (err) {
        console.error('Add to cart API error:', err);
      }
    } else {
      // Local state for guests
      setItems(prev => {
        const existing = prev.find(item => item.cartItemId === cartItemId);
        if (existing) {
          return prev.map(item =>
            item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...newItem, id: cartItemId, cartItemId, quantity: 1 }];
      });
    }

    setTimeout(() => setIsAdding(false), 800);
  };

  const removeFromCart = async (id: string) => {
    if (isLoggedIn && user?.id) {
      try {
        await fetchJson(`${API}/cart/${id}`, { method: 'DELETE' });
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Remove from cart error:', err);
      }
    } else {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    if (isLoggedIn && user?.id) {
      try {
        await fetchJson(`${API}/cart/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity })
        });
        setItems(prev => prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        ));
      } catch (err) {
        console.error('Update quantity error:', err);
      }
    } else {
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = async () => {
    if (isLoggedIn && user?.id) {
      try {
        await fetchJson(`${API}/cart/clear/${user.id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Clear cart error:', err);
      }
    }
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isAdding, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
