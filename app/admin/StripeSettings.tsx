'use client';
import { fetchJson } from '../utils/fetchApi';
import React, { useState, useEffect } from 'react';
import styles from './admin.module.css';
import { Shield, Key, Save, AlertTriangle, RefreshCw, Package } from 'lucide-react';

interface KeyConfig {
  dbKey: string;
  label: string;
  prefix: string;
  placeholder: string;
}

const STRIPE_KEYS: KeyConfig[] = [
  { dbKey: 'STRIPE_PUBLISHABLE_KEY', label: 'Publishable Key', prefix: 'pk_', placeholder: 'pk_test_... or pk_live_...' },
  { dbKey: 'STRIPE_SECRET_KEY', label: 'Secret Key', prefix: 'sk_', placeholder: 'sk_test_... or sk_live_...' }
];

export default function StripeSettings() {
  const [maskedKeys, setMaskedKeys] = useState<Record<string, string>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await fetchJson('/api/settings');
      const mapped: Record<string, string> = {};
      data.forEach((s: any) => {
        if (s.key === 'STRIPE_SECRET_KEY' || s.key === 'STRIPE_PUBLISHABLE_KEY') {
          mapped[s.key] = s.value;
        }
      });
      setMaskedKeys(mapped);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const handleSave = async (config: KeyConfig) => {
    if (!inputValue.trim()) {
      setMessage('Please enter a valid key');
      return;
    }
    if (!inputValue.startsWith(config.prefix)) {
      setMessage(`Invalid format. ${config.label} starts with ${config.prefix}test_ or ${config.prefix}live_`);
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: config.dbKey, value: inputValue })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${config.label} saved successfully!`);
        setInputValue('');
        setEditingKey(null);
        fetchSettings();
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (err) {
      setMessage('❌ Error connecting to server.');
    } finally {
      setSaving(false);
    }
  };

  const preventCopy = (e: React.ClipboardEvent | React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const renderKeyCard = (config: KeyConfig) => {
    const masked = maskedKeys[config.dbKey];
    const isEditing = editingKey === config.dbKey;

    return (
      <div key={config.dbKey} style={{ background: '#f8f9fa', borderRadius: '10px', padding: '1.2rem', border: '1px solid #e9ecef' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
          <Key size={16} color="#666" />
          <span style={{ fontWeight: 600, color: '#333' }}>{config.label}</span>
          {masked && <span style={{ marginLeft: 'auto', background: '#d1fae5', color: '#065f46', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Active</span>}
          {!masked && <span style={{ marginLeft: 'auto', background: '#fee2e2', color: '#991b1b', padding: '0.15rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Not Set</span>}
        </div>

        {masked && !isEditing && (
          <div 
            style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#555', userSelect: 'none', WebkitUserSelect: 'none', letterSpacing: '1px', marginBottom: '0.8rem' }}
            onCopy={preventCopy}
            onCut={preventCopy}
            onMouseDown={preventCopy}
          >
            {masked}
          </div>
        )}

        {!masked && !isEditing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc3545', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
            <AlertTriangle size={14} />
            <span>Not configured yet</span>
          </div>
        )}

        {!isEditing ? (
          <button 
            onClick={() => { setEditingKey(config.dbKey); setInputValue(''); setMessage(''); }}
            style={{ background: '#635bff', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            {masked ? 'Change' : 'Add Key'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                placeholder={config.placeholder}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                autoComplete="off"
                onCopy={preventCopy}
                onCut={preventCopy}
                style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
              <button 
                onClick={() => handleSave(config)} 
                disabled={saving}
                style={{ background: '#22c55e', color: '#fff', padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', fontSize: '0.85rem' }}
              >
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <button 
              onClick={() => { setEditingKey(null); setInputValue(''); setMessage(''); }}
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>Settings</h2>
          <p>Manage payment gateway keys and app configuration.</p>
        </div>
      </div>

      {/* Stripe Configuration Card */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        
        {/* Card Header */}
        <div style={{ background: 'linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '10px' }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Stripe Payment Gateway</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem' }}>Configure your Stripe keys to enable payments</p>
          </div>
        </div>

        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Both Key Cards */}
          {STRIPE_KEYS.map(config => renderKeyCard(config))}

          {/* Status Message */}
          {message && (
            <div style={{ padding: '0.8rem 1rem', borderRadius: '8px', background: message.includes('✅') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${message.includes('✅') ? '#86efac' : '#fecaca'}`, fontSize: '0.9rem' }}>
              {message}
            </div>
          )}

          {/* Security Notice */}
          <div style={{ padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
            <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
              <strong>Security:</strong> Keys are stored securely in the database and are never displayed in full. 
              Only the last 4 characters are shown. Keys cannot be copied from this page. 
              You can only add a new key or change the existing one.
            </div>
          </div>
        </div>
      </div>

      {/* Sync Products to Stripe Card */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', marginTop: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '10px' }}>
            <Package size={24} color="#fff" />
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Product Sync</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.85rem' }}>Bulk sync all products from database to Stripe in one click</p>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <p style={{ color: '#555', marginBottom: '1.2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            This will automatically create/update all your products on Stripe with their names, prices, images, and descriptions. No need to add products one by one!
          </p>

          <button
            onClick={async () => {
              setSyncing(true);
              setSyncResult(null);
              try {
                const data = await fetchJson('/api/orders/sync-products-to-stripe', { method: 'POST' });
                setSyncResult(data);
              } catch (err) {
                setSyncResult({ error: 'Failed to connect to server' });
              } finally {
                setSyncing(false);
              }
            }}
            disabled={syncing}
            style={{
              background: syncing ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9, #2563eb)',
              color: '#fff', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none',
              cursor: syncing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <RefreshCw size={18} className={syncing ? 'spin' : ''} style={syncing ? { animation: 'spin 1s linear infinite' } : {}} />
            {syncing ? 'Syncing Products...' : 'Sync All Products to Stripe'}
          </button>

          {syncResult && (
            <div style={{
              marginTop: '1rem', padding: '1rem', borderRadius: '8px',
              background: syncResult.error ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${syncResult.error ? '#fecaca' : '#86efac'}`
            }}>
              {syncResult.error ? (
                <div style={{ color: '#dc3545' }}>❌ {syncResult.error}</div>
              ) : (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#166534' }}>✅ {syncResult.message}</div>
                  <div style={{ fontSize: '0.85rem', color: '#555', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span>📦 Total: <strong>{syncResult.total}</strong></span>
                    <span>🆕 New: <strong>{syncResult.synced}</strong></span>
                    <span>🔄 Updated: <strong>{syncResult.skipped}</strong></span>
                  </div>
                  {syncResult.errors && syncResult.errors.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#dc3545' }}>
                      {syncResult.errors.map((e: any, i: number) => <div key={i}>⚠ {e.product}: {e.error}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
