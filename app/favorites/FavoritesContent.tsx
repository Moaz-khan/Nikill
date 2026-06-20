'use client';

import React from 'react';
import Link from 'next/link';
import { HeartOff, ShoppingBag } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import styles from './Favorites.module.css';

export default function FavoritesContent() {
  const { favorites, removeFromFavorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <lord-icon
              src="https://cdn.lordicon.com/nvsfzbop.json"
              trigger="loop"
              delay="2000"
              state="morph-glitter"
              stroke="bold"
              colors="primary:#1a1a1a,secondary:#1a1a1a"
              style={{ width: "120px", height: "120px", marginBottom: "2rem" }}>
          </lord-icon>
          <p>Your wishlist is empty. Discover your next favorite pair!</p>
          <Link href="/men" className={styles.continueBtn}>
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Favorites</h1>
      
      <div className={styles.grid}>
        {favorites.map(item => (
          <div key={item.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <button 
                className={styles.removeBtn}
                onClick={() => removeFromFavorites(item.id)}
                title="Remove from favorites"
              >
                <HeartOff size={20} />
              </button>
              <Link href={`/product/${item.id}`}>
                <img src={item.image} alt={item.name} className={styles.image} />
              </Link>
            </div>
            <div className={styles.content}>
              <div className={styles.category}>{item.category || "Premium Shoes"}</div>
              <h3 className={styles.name}>{item.name}</h3>
              <div className={styles.priceWrapper}>
                <span className={styles.price}>{item.price}</span>
                {item.originalPrice && (
                  <span className={styles.originalPrice}>{item.originalPrice}</span>
                )}
              </div>
              <Link href={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                <button className={styles.addToCartBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={18} /> View Product
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
