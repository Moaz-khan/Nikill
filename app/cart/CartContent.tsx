'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './Cart.module.css';

export default function CartContent() {
  const { items, updateQuantity, removeFromCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const router = useRouter();

  // Parse price "$140" -> 140
  const getNumPrice = (priceStr: string) => {
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  const subtotal = items.reduce((total, item) => total + (getNumPrice(item.price) * item.quantity), 0);
  
  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'nikill20') {
      setDiscount(subtotal * 0.2);
      alert('Promo code applied successfully!');
    } else {
      alert('Invalid promo code');
      setDiscount(0);
    }
  };

  const total = subtotal - discount;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <lord-icon
              src="https://cdn.lordicon.com/uisoczqi.json"
              trigger="loop"
              delay="2000"
              stroke="bold"
              colors="primary:#1a1a1a,secondary:#1a1a1a"
              style={{ width: "120px", height: "120px", marginBottom: "2rem" }}>
          </lord-icon>
          <p>Your shopping cart is currently empty.</p>
          <Link href="/men" className={styles.continueBtn}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})</h1>
      
      <div className={styles.cartLayout}>
        <div className={styles.itemsList}>
          {items.map(item => (
            <div key={item.id} className={styles.itemCard}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              
              <div className={styles.itemDetails}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <div className={styles.itemMeta}>
                      <span>Color: <strong>{item.color}</strong></span>
                      <span>Size: <strong>{item.size}</strong></span>
                    </div>
                  </div>
                  <div className={styles.itemPrice}>{item.price}</div>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityCtrl}>
                    <button 
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontWeight: 600, width: '24px', textAlign: 'center' }}>{item.quantity}</span>
                    <button 
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button 
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Estimated Shipping</span>
            <span style={{ fontWeight: 600 }}>Free</span>
          </div>

          {discount > 0 && (
            <div className={styles.summaryRow} style={{ color: '#FF3B30' }}>
              <span>Discount</span>
              <span style={{ fontWeight: 600 }}>-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className={styles.promoContainer}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>Promo Code</div>
            <div className={styles.promoInput}>
              <input 
                type="text" 
                placeholder="Enter code (Try 'nikill20')" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button onClick={handleApplyPromo}>Apply</button>
            </div>
          </div>

          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button 
            className={styles.checkoutBtn} 
            style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={handleCheckout}
          >
            Proceed to Checkout <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
