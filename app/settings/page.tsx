'use client';

import React from 'react';
import styles from './settings.module.css';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Shield, 
  Trash2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Image from 'next/image';

const SettingsPage = () => {
  const { user } = useAuthStore();

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1>Account Settings</h1>
        <p>Update your personal information and manage account security.</p>
      </div>

      <div className={styles.grid}>
        {/* Profile Section */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <User size={20} />
            <h3>Public Profile</h3>
          </div>
          
          <div className={styles.profileEdit}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatarWrapper}>
                <Image src={user?.avatar || '/assets/avatar-placeholder.png'} alt="Profile" width={100} height={100} />
              </div>
              <button className={styles.changeAvatar}>
                <Camera size={16} />
              </button>
            </div>
            
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.inputRow}>
                <div className={styles.inputGroup}>
                  <label>Full Name</label>
                  <input type="text" defaultValue={user?.name} placeholder="Your Name" />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={styles.inputWithIcon}>
                  <Mail size={18} />
                  <input type="email" defaultValue={user?.email} placeholder="your@email.com" />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Phone Number</label>
                <div className={styles.inputWithIcon}>
                  <Phone size={18} />
                  <input type="tel" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <button type="submit" className={styles.saveBtn}>Save Changes</button>
            </form>
          </div>
        </div>

        {/* Security & Danger Zone */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <Shield size={20} />
              <h3>Security</h3>
            </div>
            <div className={styles.securityItem}>
              <div>
                <h4>Password</h4>
                <p>Last changed 3 months ago</p>
              </div>
              <button className={styles.secondaryBtn}>Change</button>
            </div>
            <div className={styles.securityItem}>
              <div>
                <h4>Two-Factor Auth</h4>
                <p>Add an extra layer of security</p>
              </div>
              <button className={styles.secondaryBtn}>Enable</button>
            </div>
          </div>

          <div className={`${styles.card} ${styles.dangerCard}`}>
            <div className={styles.cardHeader}>
              <AlertTriangle size={20} color="#ff4d4f" />
              <h3 style={{ color: '#ff4d4f' }}>Danger Zone</h3>
            </div>
            <p className={styles.dangerText}>Once you delete your account, there is no going back. Please be certain.</p>
            <button className={styles.deleteBtn}>
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
