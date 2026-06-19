'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import styles from './FeaturedSection.module.css';
import { useFavorites } from '../context/FavoritesContext';
import { fetchJson } from '../utils/fetchApi';

const FeaturedSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    fetchJson('/api/products/featured')
      .then((data: any) => {
        const mappedProducts = data.map((prod: any) => {
          let img = '/assets/hero1.png';
          if (prod.product_images && prod.product_images.length > 0) {
            img = prod.product_images[0].image_url;
          } else if (prod.image_url) {
            img = prod.image_url;
          }
          return {
            id: prod.id,
            title: prod.name,
            price: typeof prod.price === 'number' ? `$${prod.price.toFixed(2)}` : prod.price,
            image: img,
            badge: prod.discount_badge || null,
            originalPrice: prod.original_price ? `$${prod.original_price}` : null
          };
        });
        setProducts(mappedProducts);
      })
      .catch(err => console.error('Error fetching products:', err));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = 350; // Card width (320px) + gap (30px)
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - cardWidth 
        : scrollLeft + cardWidth;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        {/* Left Side: Content & Controls */}
        <div className={styles.leftSide}>
          <span className={styles.subHeading}>The Best</span>
          <h2 className={styles.heading}>FEATURED<br />PRODUCTS</h2>
          
          <div className={styles.controls}>
            <button 
              className={styles.controlBtn} 
              onClick={() => scroll('left')}
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className={styles.controlBtn} 
              onClick={() => scroll('right')}
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Product Cards */}
      <div className={styles.sliderContainer}>
        <div className={styles.slider} ref={scrollRef}>
          {products.map((product, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <button 
                  className={styles.favoriteBtn} 
                  aria-label="Add to favorite"
                  onClick={(e) => {
                    e.preventDefault();
                    const favItem = {
                      id: `feat-${product.id}`,
                      name: product.title,
                      price: product.price,
                      image: product.image,
                    };
                    if (isFavorite(favItem.id)) {
                      removeFromFavorites(favItem.id);
                    } else {
                      addToFavorites(favItem);
                    }
                  }}
                >
                  <Heart size={20} fill={isFavorite(`feat-${product.id}`) ? "var(--primary)" : "none"} color={isFavorite(`feat-${product.id}`) ? "var(--primary)" : "currentColor"} />
                </button>
                <Image
                  src={product.image}
                  alt={product.title}
                  width={400}
                  height={400}
                  className={styles.cardImage}
                />
              </div>
              <div className={styles.cardContent}>
                <div className={styles.price}>{product.price}</div>
                <h3 className={styles.cardTitle}>{product.title}</h3>
                <Link href={`/product/feat-${product.id}`} className={styles.cardLink}>
                  Shop Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
