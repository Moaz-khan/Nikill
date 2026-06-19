'use client';
import { fetchJson } from '../utils/fetchApi';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import styles from './CategoryPage.module.css';
import { useFavorites } from '../context/FavoritesContext';

interface CategoryContentProps {
  category: string;
}

const CAROUSEL_DATA = {
  men: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=2000&auto=format&fit=crop',
      title: 'Men\'s Collection',
      desc: 'Engineered for ultimate performance and relentless style.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=2000&auto=format&fit=crop',
      title: 'Defy Limits',
      desc: 'Discover the latest innovations in running and training.'
    }
  ],
  women: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop',
      title: 'Women\'s Collection',
      desc: 'Empower your stride with elegance and power.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=2000&auto=format&fit=crop',
      title: 'Street Elegance',
      desc: 'Seamlessly transition from gym to street in style.'
    }
  ],
  kids: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=2000&auto=format&fit=crop',
      title: 'Kids\' Collection',
      desc: 'Built for play, designed for the future.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?q=80&w=2000&auto=format&fit=crop',
      title: 'Next Generation',
      desc: 'Durable, comfortable, and ready for adventure.'
    }
  ],
  sale: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop',
      title: 'End of Season Sale',
      desc: 'Up to 50% off on selected premium styles.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=2000&auto=format&fit=crop',
      title: 'Flash Deals',
      desc: 'Limited time offers you cannot miss.'
    }
  ],
  'new-arrivals': [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop',
      title: 'New Arrivals',
      desc: 'Be the first to step into the future of footwear.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=2000&auto=format&fit=crop',
      title: 'Fresh Drops',
      desc: 'Latest trends, straight out of the box.'
    }
  ],
  shop: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2000&auto=format&fit=crop',
      title: 'Our Complete Collection',
      desc: 'Discover everything NIKILL has to offer, from performance gear to street icons.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2000&auto=format&fit=crop',
      title: 'Premium Footwear',
      desc: 'Browse our full range of elite sneakers and athletic shoes.'
    }
  ]
};

const FILTERS = {
  categories: ['Running', 'Training', 'Basketball', 'Lifestyle', 'Golf'],
  colors: ['Black', 'White', 'Red', 'Blue', 'Grey'],
  prices: ['Under $100', '$100 - $150', 'Over $150']
};

export default function CategoryContent({ category }: CategoryContentProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  // Normalize category to map to our dummy data
  const normalizedCategory = category.toLowerCase();
  const validCategory = ['men', 'women', 'kids', 'sale', 'new-arrivals', 'shop'].includes(normalizedCategory) ? normalizedCategory as keyof typeof CAROUSEL_DATA : 'men';
  
  const banners = CAROUSEL_DATA[validCategory] || CAROUSEL_DATA.men;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let endpoint = '/api/products';
        if (validCategory === 'sale') {
          endpoint = '/api/products/sale';
        } else if (validCategory === 'new-arrivals') {
          endpoint = '/api/products/new-arrivals';
        } else if (['men', 'women', 'kids'].includes(validCategory)) {
          endpoint = `/api/products/audience/${validCategory}`;
        }
        
        const data = await fetchJson(endpoint);
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch category products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [validCategory]);

  const displayedProducts = activeTab 
    ? products.filter(p => p.target_audience?.toLowerCase() === activeTab)
    : products;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className={styles.pageWrapper}>
      {/* Dynamic Carousel Banner */}
      <section className={styles.carouselSection}>
        {banners.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`${styles.carouselSlide} ${index === activeSlide ? styles.carouselSlideActive : ''}`}
          >
            <img src={slide.image} alt={slide.title} className={styles.carouselImage} />
            <div className={styles.carouselContent}>
              {index === activeSlide && (
                <>
                  <h1 className={styles.carouselTitle}>{slide.title}</h1>
                  <p className={styles.carouselDesc}>{slide.desc}</p>
                </>
              )}
            </div>
          </div>
        ))}
        <div className={styles.indicators}>
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`${styles.dot} ${index === activeSlide ? styles.dotActive : ''}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <main className={styles.mainContainer}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Filters</h2>
          
          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>Shop by Category</div>
            <ul className={styles.filterList}>
              {FILTERS.categories.map(cat => (
                <li key={cat} className={styles.filterItem}>
                  <div className={styles.checkbox}></div>
                  <span>{cat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>Shop by Price</div>
            <ul className={styles.filterList}>
              {FILTERS.prices.map(price => (
                <li key={price} className={styles.filterItem}>
                  <div className={styles.checkbox}></div>
                  <span>{price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterHeader}>Color</div>
            <ul className={styles.filterList}>
              {FILTERS.colors.map(color => (
                <li key={color} className={styles.filterItem}>
                  <div className={styles.checkbox}></div>
                  <span>{color}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Product Area */}
        <section className={styles.productArea}>
          
          {/* Specific Navigation Tabs */}
          {validCategory === 'kids' && (
            <div className={styles.kidsNavWrapper}>
              {['Baby', 'Baba', 'New Born'].map((tab) => (
                <button 
                  key={tab}
                  className={`${styles.kidsTab} ${activeTab === tab.toLowerCase() ? styles.kidsTabActive : ''}`}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {['sale', 'new-arrivals'].includes(validCategory) && (
            <div className={styles.kidsNavWrapper}>
              {['Men', 'Women', 'Baby', 'Baba', 'New Born'].map((tab) => (
                <button 
                  key={tab}
                  className={`${styles.kidsTab} ${activeTab === tab.toLowerCase() ? styles.kidsTabActive : ''}`}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          <div className={styles.productHeader}>
            <div className={styles.productCount}>
              {loading ? 'Loading...' : `Showing ${displayedProducts.length} Results`} {activeTab ? `for ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` : `for ${validCategory === 'shop' ? 'All Products' : validCategory.replace('-', ' ')}`}
            </div>
            <select className={styles.sortSelect} defaultValue="newest">
              <option value="newest">Sort By: Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          <div className={styles.productGrid}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>Loading products...</div>
            ) : displayedProducts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>No products found in this category.</div>
            ) : (
              displayedProducts.map((product) => {
                // Handle different image formats (mock data vs database)
                let imageUrl = product.image_url || product.image || '/assets/hero1.png';
                if (product.product_images && product.product_images.length > 0) {
                  imageUrl = product.product_images[0].image_url;
                }

                return (
                  <Link href={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className={styles.productCard}>
                      <div className={styles.imageWrapper}>
                        <img src={imageUrl} alt={product.name} className={styles.productImg} />
                        <button 
                          className={styles.wishlistBtn} 
                          aria-label="Add to wishlist"
                          onClick={(e) => { 
                            e.preventDefault();
                            const favItem = {
                              id: `prod-${product.id}`,
                              name: product.name,
                              price: product.price,
                              originalPrice: product.original_price || product.originalPrice,
                              image: imageUrl,
                              category: product.category_name || product.cat
                            };
                            if (isFavorite(favItem.id)) {
                              removeFromFavorites(favItem.id);
                            } else {
                              addToFavorites(favItem);
                            }
                          }}
                        >
                          <Heart size={18} fill={isFavorite(`prod-${product.id}`) ? "var(--primary)" : "none"} color={isFavorite(`prod-${product.id}`) ? "var(--primary)" : "var(--foreground)"} />
                        </button>
                      </div>
                      <div className={styles.cardContent}>
                        {(product.discount_badge || product.badge) && <span className={styles.badge}>{product.discount_badge || product.badge}</span>}
                        <h3 className={styles.productName}>{product.name}</h3>
                        <div className={styles.productCategory}>
                          {product.category_name || product.cat}
                        </div>
                        <div className={styles.productBottom}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span className={styles.productPrice}>${product.price}</span>
                            {(product.original_price || product.originalPrice) && (
                              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.95rem' }}>
                                ${product.original_price || product.originalPrice}
                              </span>
                            )}
                          </div>
                      <button 
                        className={styles.addBtn} 
                        aria-label="Add to cart"
                        onClick={(e) => { e.preventDefault(); /* Handle cart */ }}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
