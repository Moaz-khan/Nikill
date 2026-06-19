'use client';
import { fetchJson } from '../../utils/fetchApi';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowLeft, Star, Ruler } from 'lucide-react';
import styles from './ProductDetail.module.css';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuthStore } from '../../store/authStore';

interface ProductContentProps {
  productId: string;
}

const FALLBACK_PRODUCT = {
  id: '1',
  name: 'Nike Air Max Alpha Premium',
  category_name: "Training",
  target_audience: "Men",
  price: 140,
  original_price: 180,
  discount_badge: '22% OFF',
  description: 'Unleash your inner athlete with the Nike Air Max Alpha Premium. Designed for high-intensity training, it offers unparalleled stability, responsive cushioning, and a sleek modern aesthetic.',
  product_images: [
    { image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop' },
    { image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop' },
    { image_url: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=1000&auto=format&fit=crop' },
    { image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop' }
  ],
  product_colors: [
    { name: 'Red/Black', hex_code: '#E63946' },
    { name: 'Pure White', hex_code: '#F1FAEE' },
    { name: 'Midnight Navy', hex_code: '#1D3557' }
  ],
  rating: 4.8,
  reviews_count: 124,
  reviews: [
    { id: '1', user_name: 'Alex M.', rating: 5, created_at: '2023-10-12', review_text: 'Absolutely love these shoes! Incredibly comfortable.' },
    { id: '2', user_name: 'Sarah J.', rating: 4, created_at: '2023-09-28', review_text: 'Great fit and very stylish. Highly recommend for training.' },
  ],
  related_products: []
};

export default function ProductContent({ productId }: ProductContentProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isOnOrder, setIsOnOrder] = useState(false);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { user, isLoggedIn } = useAuthStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/detail/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.product_colors && data.product_colors.length > 0) {
            setSelectedColor(data.product_colors[0].name);
          }
        } else {
          setProduct(FALLBACK_PRODUCT);
          setSelectedColor(FALLBACK_PRODUCT.product_colors[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setProduct(FALLBACK_PRODUCT);
        setSelectedColor(FALLBACK_PRODUCT.product_colors[0].name);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontSize: '1.2rem' }}>
        Loading product...
      </div>
    );
  }

  if (!product) return null;

  const images = product.product_images?.length > 0
    ? product.product_images.map((img: any) => img.image_url)
    : ['/assets/hero1.png'];

  const colors = product.product_colors || [];
  const reviews = product.reviews || [];
  const relatedProducts = product.related_products || [];
  const isFav = isFavorite(product.id);
  const sizes = ['36', '37', '38', '39', '40', '41', '42'];

  const categoryLabel = product.target_audience
    ? `${product.target_audience}'s ${product.category_name || ''} Shoes`
    : product.category_name || 'Shoes';

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setIsOnOrder(false);
  };

  const handleOnOrderSelect = () => {
    setIsOnOrder(true);
    setSelectedSize(null);
  };

  const handleAddToCart = () => {
    if (!selectedSize && !isOnOrder) {
      alert("Please select a size!");
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: `$${product.price}`,
      originalPrice: product.original_price ? `$${product.original_price}` : undefined,
      image: images[0],
      color: selectedColor,
      size: selectedSize || 'Custom Order'
    });
  };

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites({
        id: product.id,
        name: product.name,
        price: `$${product.price}`,
        originalPrice: product.original_price ? `$${product.original_price}` : undefined,
        image: images[0],
        category: categoryLabel
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.text) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userId: user?.id || null,
          userName: user?.name || 'Anonymous',
          avatarUrl: user?.avatar || null,
          rating: newReview.rating,
          reviewText: newReview.text
        })
      });

      if (res.ok) {
        const savedReview = await res.json();
        // Update local state to show the new review immediately
        setProduct({
          ...product,
          reviews: [savedReview, ...reviews],
          reviews_count: (product.reviews_count || 0) + 1
        });
        setIsWritingReview(false);
        setNewReview({ rating: 5, text: '' });
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> <span>/</span> 
        <Link href={`/${(product.target_audience || 'men').toLowerCase()}`}>{product.target_audience || 'Men'}&apos;s Shoes</Link> <span>/</span> 
        <span style={{ color: 'var(--primary)' }}>{product.name}</span>
      </div>

      <section className={styles.productMain}>
        {/* Left: Image Gallery */}
        <div className={styles.gallery}>
          <div className={styles.thumbnails}>
            {images.map((img: string, idx: number) => (
              <button 
                key={idx}
                className={`${styles.thumbnail} ${activeImg === idx ? styles.thumbnailActive : ''}`}
                onClick={() => setActiveImg(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>
          <div className={styles.mainImageContainer}>
            {product.discount_badge && <div className={styles.discountBadge}>{product.discount_badge}</div>}
            <img 
              src={images[activeImg]} 
              alt={product.name} 
              className={styles.mainImage} 
            />
          </div>
        </div>

        {/* Right: Product Details */}
        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>
          <div className={styles.category}>{categoryLabel}</div>
          
          <div className={styles.priceWrapper}>
            <span className={styles.currentPrice}>${product.price}</span>
            {product.original_price && (
              <span className={styles.originalPrice}>${product.original_price}</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '0.4rem', color: '#FFB800' }}>
              <Star fill="#FFB800" size={18} />
              <span style={{ color: '#333', fontWeight: 600 }}>{product.rating || 0}</span>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>({product.reviews_count || reviews.length} reviews)</span>
            </div>
          </div>

          {/* Colors */}
          {colors.length > 0 && (
            <>
              <div className={styles.sectionTitle}>Select Color: <span style={{ color: '#666', fontWeight: 400 }}>{selectedColor}</span></div>
              <div className={styles.colors}>
                {colors.map((color: any) => (
                  <button
                    key={color.name}
                    className={`${styles.colorBtn} ${selectedColor === color.name ? styles.colorBtnActive : ''}`}
                    style={{ backgroundColor: color.hex_code }}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                  />
                ))}
              </div>
            </>
          )}

          {/* Sizes */}
          <div className={styles.sizesWrapper}>
            <div className={styles.sizeHeader}>
              <div className={styles.sectionTitle} style={{ margin: 0 }}>Select Size (EU)</div>
              <div className={styles.sizeGuide}><Ruler size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom'}} /> Size Guide</div>
            </div>
            
            <div className={styles.sizes}>
              {sizes.map(size => (
                <button
                  key={size}
                  className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ''}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <button 
              className={`${styles.onOrderBtn} ${isOnOrder ? styles.onOrderBtnActive : ''}`}
              onClick={handleOnOrderSelect}
            >
              Need a smaller or larger size? <strong>Order Custom Size</strong>
            </button>
            {isOnOrder && (
              <div style={{ marginTop: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Enter your specific size requirements..." 
                  style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--primary)', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
            )}
          </div>

          <div className={styles.description}>
            {product.description}
          </div>

          <div className={styles.actions}>
            <button className={styles.addToCart} onClick={handleAddToCart}>
              Add to Cart - ${product.price}
            </button>
            <button 
              className={styles.wishlistBtn} 
              onClick={handleToggleFavorite}
            >
              <Heart size={24} fill={isFav ? "var(--primary)" : "none"} color={isFav ? "var(--primary)" : "var(--foreground)"} />
            </button>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <h2 className={styles.reviewsTitle}>Customer Reviews ({reviews.length})</h2>
          <button 
            className={styles.writeReviewBtn}
            onClick={() => setIsWritingReview(!isWritingReview)}
          >
            {isWritingReview ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {isWritingReview && (
          <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
            <div className={styles.formGroup}>
              <label>Your Rating</label>
              <div className={styles.ratingSelect}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    type="button"
                    key={star} 
                    className={`${styles.starBtn} ${star <= newReview.rating ? styles.starBtnActive : ''}`}
                    onClick={() => setNewReview({...newReview, rating: star})}
                    style={{ padding: 0, margin: 0, display: 'flex' }}
                  >
                    <Star fill={star <= newReview.rating ? '#FFB800' : 'none'} color={star <= newReview.rating ? '#FFB800' : '#ddd'} size={28} />
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Your Review</label>
              <textarea 
                className={styles.formTextarea} 
                placeholder="What did you like or dislike?"
                value={newReview.text}
                onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                required
              ></textarea>
            </div>
            <button type="submit" className={styles.submitReviewBtn}>Submit Review</button>
          </form>
        )}

        <div className={styles.reviewsGrid}>
          {reviews.map((review: any) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewUser}>
                <div className={styles.avatar}>
                  {review.avatar_url ? (
                    <img src={review.avatar_url} alt={review.user_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    review.user_name?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <div className={styles.reviewerName}>{review.user_name}</div>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} fill={i < review.rating ? "#FFB800" : "none"} color={i < review.rating ? "#FFB800" : "#ddd"} size={16} />
                    ))}
                  </div>
                </div>
                <div className={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <p className={styles.reviewText}>{review.review_text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Similar Products</h2>
          <div className={styles.grid}>
            {relatedProducts.map((rp: any) => {
              const rpImage = rp.product_images?.length > 0 ? rp.product_images[0].image_url : '/assets/hero1.png';
              return (
                <Link href={`/product/${rp.id}`} key={rp.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.productCard} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'transform 0.3s' }}>
                    <div style={{ height: '280px', background: '#f4f4f4' }}>
                      <img src={rpImage} alt={rp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{rp.name}</h3>
                      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>${rp.price}</span>
                        {rp.original_price && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>${rp.original_price}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
