'use client';
import { fetchJson } from '../utils/fetchApi';

import React from 'react';
import styles from './signup.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Chrome } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
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
    const full_name = formData.get('name') as string;
    const password = formData.get('password') as string;
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, full_name, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Supabase signup might not return a session immediately depending on config,
      // but we will optimistically log the user in here or redirect to login.
      // Assuming auto-login on signup if email confirmation is off:
      const token = data.session?.access_token || 'dummy-token-for-now';
      login({ 
        id: data.user?.id || 'temp-id', 
        email, 
        name: full_name 
      }, token);

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // For now simulate google signup
    login({ id: 'google-id', email: 'google_user@gmail.com', name: 'Google User' }, 'google-token');
    router.push('/');
  };

  return (
    <div className={styles.signupContainer}>
      {/* Left Side: Image Section */}
      <div className={styles.imageSection}>
        <Link href="/" className={styles.backHome}>
          <ArrowLeft size={20} /> Back to Home
        </Link>
        <div className={styles.imageWrapper}>
          <Image 
            src="/assets/hero7.png" 
            alt="Premium Shoes" 
            width={600} 
            height={600} 
            className={styles.heroImage}
            priority
          />
        </div>
        <div className={styles.imageContent}>
          <h2>Join the NIKILL Elite</h2>
          <p>Sign up now to experience premium comfort and exclusive member-only collections.</p>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h1>Create Account</h1>
            <p>Fill in your details to get started with NIKILL.</p>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input type="text" name="name" placeholder="John Doe" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <input type="email" name="email" placeholder="john@example.com" required />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <input type="password" name="password" placeholder="••••••••" required />
            </div>

            <div className={styles.checkboxGroup}>
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">I agree to the <span>Terms & Conditions</span></label>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <button type="button" className={styles.googleBtn} onClick={handleGoogleSignup}>
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} />
              Continue with Google
            </button>
          </form>

          <div className={styles.formFooter}>
            <p>Already have an account? <Link href="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
