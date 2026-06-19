'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, ShoppingBag, FileText } from 'lucide-react';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const invoiceUrl = searchParams.get('invoice');

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '50%', 
          background: 'linear-gradient(135deg, #22c55e, #16a34a)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem', boxShadow: '0 10px 30px rgba(34,197,94,0.3)'
        }}>
          <CheckCircle size={50} color="#fff" />
        </div>
        
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Confirmed!</h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem', lineHeight: 1.6 }}>
          Thank you for your purchase! Your payment has been processed successfully. 
          You will receive a confirmation email shortly.
        </p>

        <div style={{ 
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', 
          padding: '1.2rem', marginBottom: '2rem', fontSize: '0.95rem', color: '#166534' 
        }}>
          ✓ Payment received · ✓ Order confirmed · ✓ Invoice generated
        </div>

        {invoiceUrl && (
          <a 
            href={invoiceUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.9rem 1.8rem', background: '#635bff', color: '#fff', 
              borderRadius: '50px', textDecoration: 'none', fontWeight: 600,
              marginBottom: '1rem', transition: 'transform 0.2s'
            }}
          >
            <FileText size={18} /> View Invoice / Receipt
          </a>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <Link href="/" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.9rem 1.8rem', background: 'var(--foreground)', color: '#fff', 
            borderRadius: '50px', textDecoration: 'none', fontWeight: 600
          }}>
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
