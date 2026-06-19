'use client';
import { fetchJson } from '../utils/fetchApi';

import React, { useState } from 'react';
import styles from './dashboard.module.css';
import { 
  Package, 
  CreditCard, 
  History, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Image from 'next/image';

const Dashboard = () => {
  const { user, isLoggedIn } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');

  React.useEffect(() => {
    if (!isLoggedIn) {
       // window.location.href = '/login';
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Login Required</h1>
          <p>Please login to view your dashboard.</p>
          <button onClick={() => window.location.href = '/login'} style={{ marginTop: '20px', padding: '10px 20px', background: '#FF6B00', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Login Now</button>
        </div>
      </div>
    );
  }
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  React.useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user, activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'orders') {
        const data = await fetchJson(`/api/orders/user/${user?.id}`);
        setOrders(data);
      } else if (activeTab === 'payments') {
        const data = await fetchJson(`/api/orders/payment-methods/${user?.id}`);
        setPaymentMethods(data);
      } else if (activeTab === 'history') {
        const data = await fetchJson(`/api/orders/user/${user?.id}`);
        setBillingHistory(data.filter((o: any) => o.status === 'paid'));
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/orders/payment-methods/${id}`, { method: 'DELETE' });
      fetchDashboardData();
    } catch (e) {}
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        <div className={styles.userProfile}>
          <div className={styles.avatarWrapper}>
            <Image src={user?.avatar || '/assets/avatar-placeholder.png'} alt="Profile" width={80} height={80} />
          </div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
        </div>
        
        <nav className={styles.sideNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={20} /> Orders & Tracking
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'payments' ? styles.active : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={20} /> Payment Methods
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'history' ? styles.active : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={20} /> Billing History
          </button>
        </nav>
      </div>

      <main className={styles.content}>
        {activeTab === 'orders' && (
          <div className={styles.section}>
            <div className={styles.header}>
              <h2>Orders & Tracking</h2>
              <p>Manage your current orders and track shipments.</p>
            </div>
            
            <div className={styles.orderGrid}>
              {orders.length === 0 && <p className={styles.emptyMsg}>You haven't placed any orders yet.</p>}
              {orders.map(order => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>#NK-{order.id.toString().slice(-4).toUpperCase()}</span>
                    <span className={`${styles.status} ${styles[order.status.toLowerCase().replace(' ', '')]}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className={styles.orderInfo}>
                    <div>
                      <label>Placed On</label>
                      <p>{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label>Total</label>
                      <p>${order.total_amount}</p>
                    </div>
                  </div>
                  <div className={styles.trackingInfo}>
                    <div className={styles.trackHeader}>
                      <MapPin size={16} /> <span>Status: {order.status}</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div className={styles.progress} style={{ 
                        width: order.status === 'delivered' ? '100%' : 
                               order.status === 'shipped' ? '70%' : '30%' 
                      }}></div>
                    </div>
                  </div>
                  <button className={styles.detailsBtn}>View Details <ChevronRight size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className={styles.section}>
            <div className={styles.header}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2>Payment Methods</h2>
                  <p>Securely manage your saved payment options.</p>
                </div>
                <button className={styles.addBtn}><Plus size={20} /> Add New Card</button>
              </div>
            </div>

            <div className={styles.paymentList}>
              {paymentMethods.length === 0 && <p className={styles.emptyMsg}>No saved payment methods.</p>}
              {paymentMethods.map(method => (
                <div key={method.id} className={styles.paymentCard}>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardIcon}>
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <p className={styles.cardNumber}>{method.card_brand} ending in {method.last4}</p>
                      <p className={styles.cardExpiry}>Expires {method.exp_month}/{method.exp_year}</p>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    {method.is_default && <span className={styles.defaultBadge}>Default</span>}
                    <button className={`${styles.iconAction} ${styles.delete}`} onClick={() => handleDeletePaymentMethod(method.id)}><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.section}>
            <div className={styles.header}>
              <h2>Billing History</h2>
              <p>View and download your past invoices.</p>
            </div>

            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.length === 0 && <tr><td colSpan={5} className={styles.emptyRow}>No billing history available.</td></tr>}
                {billingHistory.map(bill => (
                  <tr key={bill.id}>
                    <td>INV-{bill.id.toString().slice(-4).toUpperCase()}</td>
                    <td>{new Date(bill.created_at).toLocaleDateString()}</td>
                    <td>${bill.total_amount}</td>
                    <td><span className={styles.paidBadge}>Paid</span></td>
                    <td><a href={bill.stripe_invoice_url} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn}>View Invoice</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
