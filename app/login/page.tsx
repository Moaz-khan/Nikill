'use client';
import { fetchJson } from '../utils/fetchApi';

import React from 'react';
import styles from './login.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { login } = useAuthStore();
  const router = useRouter();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // The full_name could be in user_metadata if stored there, or we fetch from profile.
      // For now, if full_name is missing, fallback to 'User'
      const name = data.user?.user_metadata?.full_name || 'User';

      login({ 
        id: data.user.id, 
        email: data.user.email, 
        name 
      }, data.session.access_token);

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* Left Side: Image Section */}
      <div className={styles.imageSection}>
        <Link href="/" className={styles.backHome}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <div className={styles.imageWrapper}>
          <Image 
            src="/assets/hero1.png" 
            alt="Premium Shoes" 
            width={600} 
            height={600} 
            className={styles.heroImage}
            priority
          />
        </div>
        <div className={styles.imageContent}>
          <h2>Welcome Back!</h2>
          <p>Lace up and continue your journey with the world's most comfortable performance footwear.</p>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1>Login</h1>
            <p>Enter your credentials to access your NIKILL account.</p>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input type="email" name="email" placeholder="john@example.com" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input type="password" name="password" placeholder="••••••••" required style={{ width: '100%' }} />
                <Link href="/forgot-password" style={{ position: 'absolute', right: '0', top: '-25px', fontSize: '0.8rem', color: '#FF6B00', fontWeight: '600' }}>
                  Forgot?
                </Link>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className={styles.formFooter}>
            <p>Don't have an account? <Link href="/signup">Sign up now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
