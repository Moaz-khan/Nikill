'use client';
import { fetchJson } from '../utils/fetchApi';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, StripeCardElement } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Plus, Shield, Lock, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuthStore } from '../store/authStore';
import styles from './checkout.module.css';

const ELEMENT_STYLE = {
  base: {
    fontSize: '16px',
    color: '#1a1a1a',
    fontFamily: 'Inter, system-ui, sans-serif',
    '::placeholder': { color: '#aab7c4' },
  },
  invalid: { color: '#dc3545' },
};

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { items, removeFromCart, clearCart } = useCart();
  const { user, isLoggedIn } = useAuthStore();
  
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [useNewCard, setUseNewCard] = useState(true);
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const getNumPrice = (priceStr: string) => parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  const subtotal = items.reduce((t, item) => t + (getNumPrice(item.price) * item.quantity), 0);
  const total = subtotal;

  // Fetch saved cards
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetch(`/api/orders/payment-methods/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedCards(data);
            const def = data.find((c: any) => c.is_default);
            if (def) {
              setSelectedCard(def.id);
              setUseNewCard(false);
            }
          }
        })
        .catch(() => {});
    }
  }, [isLoggedIn, user]);

  const handleDeleteCard = async (cardId: string) => {
    try {
      await fetch(`/api/orders/payment-methods/${cardId}`, { method: 'DELETE' });
      setSavedCards(prev => prev.filter(c => c.id !== cardId));
      if (selectedCard === cardId) {
        setSelectedCard(null);
        setUseNewCard(true);
      }
    } catch (err) {
      console.error('Delete card error:', err);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setError('');

    try {
      // 1. Create PaymentIntent
      const piRes = await fetch('/api/orders/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          items: items.map(i => ({
            productId: i.productId, name: i.name, color: i.color, size: i.size, quantity: i.quantity, price: i.price
          })),
          userId: user?.id || null
        })
      });
      const piData = await piRes.json();
      
      if (!piData.clientSecret) {
        throw new Error(piData.error || 'Failed to create payment. Check Stripe keys in Admin Settings.');
      }

      // 2. Confirm payment with card
      if (!stripe || !elements) throw new Error('Stripe not loaded');
      const cardNumber = elements.getElement(CardNumberElement);
      if (!cardNumber) throw new Error('Card details not loaded');

      const paymentResult = await stripe.confirmCardPayment(piData.clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: { name: cardholderName || 'Cardholder' }
        }
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message);
      }

      if (paymentResult.paymentIntent?.status === 'succeeded') {
        // 3. Confirm order — backend will fetch card info from Stripe & create invoice
        const confirmRes = await fetch('/api/orders/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map(i => ({
              productId: i.productId, name: i.name, color: i.color, size: i.size, quantity: i.quantity, price: i.price
            })),
            total, subtotal, discount: 0,
            userId: user?.id || null,
            paymentIntentId: paymentResult.paymentIntent.id,
            saveCard: saveCard && useNewCard && isLoggedIn
          })
        });
        const confirmData = await confirmRes.json();

        // 4. Clear cart & redirect
        await clearCart();
        
        const successUrl = confirmData.invoiceUrl 
          ? `/checkout/success?paid=true&invoice=${encodeURIComponent(confirmData.invoiceUrl)}`
          : '/checkout/success?paid=true';
        router.push(successUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.checkoutContainer}>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>No items in cart</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>Add some products to your cart before checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.checkoutTitle}>Checkout</h1>

      <div className={styles.checkoutLayout}>
        {/* LEFT — Payment */}
        <div className={styles.checkoutLeft}>

          {/* Saved Cards */}
          {savedCards.length > 0 && (
            <div className={styles.savedCards}>
              <div className={styles.savedCardsTitle}>
                <CreditCard size={18} /> Your Saved Cards
              </div>
              <div className={styles.cardList}>
                {savedCards.map(card => (
                  <div
                    key={card.id}
                    className={`${styles.savedCard} ${!useNewCard && selectedCard === card.id ? styles.savedCardActive : ''}`}
                    onClick={() => { setSelectedCard(card.id); setUseNewCard(false); }}
                  >
                    <div className={`${styles.cardRadio} ${!useNewCard && selectedCard === card.id ? styles.cardRadioActive : ''}`} />
                    <div className={styles.cardBrandIcon}>
                      {card.card_brand || 'CARD'}
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardNumber}>•••• •••• •••• {card.last4}</div>
                      <div className={styles.cardExpiry}>
                        {card.cardholder_name} · Exp {String(card.exp_month).padStart(2, '0')}/{card.exp_year}
                      </div>
                    </div>
                    {card.is_default && <span className={styles.defaultBadge}>Default</span>}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px' }}
                      title="Delete card"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Card */}
          <div className={styles.newCardSection}>
            <button
              className={`${styles.newCardToggle} ${useNewCard ? styles.newCardToggleActive : ''}`}
              onClick={() => { setUseNewCard(true); setSelectedCard(null); }}
            >
              <Plus size={18} /> {savedCards.length > 0 ? 'Use a New Card' : 'Enter Card Details'}
            </button>

            {useNewCard && (
              <div className={styles.stripeForm}>
                <div className={styles.formRow}>
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Name on card"
                    value={cardholderName}
                    onChange={e => setCardholderName(e.target.value)}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Card Number</label>
                  <div className={styles.stripeElement}>
                    <CardNumberElement options={{ style: ELEMENT_STYLE, showIcon: true }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className={styles.formRow} style={{ flex: 1 }}>
                    <label>Expiry Date</label>
                    <div className={styles.stripeElement}>
                      <CardExpiryElement options={{ style: ELEMENT_STYLE }} />
                    </div>
                  </div>
                  <div className={styles.formRow} style={{ flex: 1 }}>
                    <label>CVC</label>
                    <div className={styles.stripeElement}>
                      <CardCvcElement options={{ style: ELEMENT_STYLE }} />
                    </div>
                  </div>
                </div>

                {isLoggedIn && (
                  <label className={styles.saveCardCheck}>
                    <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} />
                    Save this card for future purchases
                  </label>
                )}
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: '0.8rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc3545', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* RIGHT — Order Summary */}
        <div className={styles.checkoutRight}>
          <div className={styles.orderSummary}>
            <h2 className={styles.summaryHeading}>Order Summary</h2>

            {items.map(item => (
              <div key={item.id} className={styles.summaryItem}>
                <img src={item.image} alt={item.name} className={styles.summaryItemImg} />
                <div className={styles.summaryItemInfo}>
                  <div className={styles.summaryItemName}>{item.name}</div>
                  <div className={styles.summaryItemMeta}>{item.color} · Size {item.size} · Qty {item.quantity}</div>
                </div>
                <div className={styles.summaryItemPrice}>{item.price}</div>
              </div>
            ))}

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{ fontWeight: 600, color: '#22c55e' }}>Free</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button 
              className={styles.payBtn}
              onClick={handlePay}
              disabled={processing || (!useNewCard && !selectedCard)}
            >
              <Lock size={18} />
              {processing ? 'Processing Payment...' : `Pay $${total.toFixed(2)}`}
            </button>

            <div className={styles.secureNote}>
              <Shield size={14} /> Secured by Stripe · 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper with Stripe Elements Provider
export default function CheckoutPage() {
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders/stripe-key')
      .then(res => res.json())
      .then(data => {
        if (data.publishableKey) {
          setStripePromise(loadStripe(data.publishableKey));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        Loading checkout...
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <Shield size={48} color="#dc3545" />
        <h2>Payment Not Configured</h2>
        <p style={{ color: '#666' }}>Stripe keys have not been set up yet. Please contact the administrator.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
