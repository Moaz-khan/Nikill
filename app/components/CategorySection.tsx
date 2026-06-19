'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Heart } from 'lucide-react';
import styles from './CategorySection.module.css';
import { useFavorites } from '../context/FavoritesContext';
import { fetchJson } from '../utils/fetchApi';

const CategorySection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  useEffect(() => {
    fetchJson('/api/categories/top')
      .then((data: any) => {
        const mappedCategories = data.map((cat: any) => ({
          id: cat.id,
          title: cat.name,
          image: cat.image_url || '/assets/hero1.png',
          link: `/shop?category=${encodeURIComponent(cat.name)}`
        }));
        setCategories(mappedCategories);
      })
      .catch(err => console.error('Error fetching categories:', err));
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
    <section className={styles.categorySection}>
      {/* Background Glows for Glassmorphism */}
      <div className={styles.bgGlow1}></div>
      <div className={styles.bgGlow2}></div>

      <div className={styles.container}>
        {/* Left Side: Content & Controls */}
        <div className={styles.leftSide}>
          <span className={styles.subHeading}>Shop By</span>
          <h2 className={styles.heading}>TOP<br />CATEGORIES</h2>
          
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

      {/* Right Side: Category Cards - Outside container to bleed to edge */}
      <div className={styles.sliderContainer}>
        <div className={styles.slider} ref={scrollRef}>
          {categories.map((cat, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardImageWrapper}>
                <button 
                  className={styles.favoriteBtn} 
                  aria-label="Add to favorite"
                  onClick={(e) => {
                    e.preventDefault();
                    const favItem = {
                      id: `cat-${index}`,
                      name: cat.title,
                      price: 'View Collection',
                      image: cat.image,
                      category: 'Category'
                    };
                    if (isFavorite(favItem.id)) {
                      removeFromFavorites(favItem.id);
                    } else {
                      addToFavorites(favItem);
                    }
                  }}
                >
                  <Heart size={20} fill={isFavorite(`cat-${index}`) ? "var(--primary)" : "none"} color={isFavorite(`cat-${index}`) ? "var(--primary)" : "currentColor"} />
                </button>
                <Image
                  src={cat.image}
                  alt={cat.title}
                  width={400}
                  height={400}
                  className={styles.cardImage}
                />
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{cat.title}</h3>
                <Link href={cat.link} className={styles.cardLink}>
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

export default CategorySection;
