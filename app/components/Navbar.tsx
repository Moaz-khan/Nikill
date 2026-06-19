'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Zap,
  LayoutDashboard,
  Settings,
  LogOut
} from 'lucide-react';
import styles from './Navbar.module.css';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useAuthStore } from '../store/authStore';
import Image from 'next/image';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const [isUserHovered, setIsUserHovered] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { items, isAdding } = useCart();
  const { favorites, isAddingFav } = useFavorites();
  const { user, isLoggedIn, logout } = useAuthStore();
  
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const isNoNavbarPage = pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Men', href: '/men' },
    { name: 'Women', href: '/women' },
    { name: 'Kids', href: '/kids' },
    { name: 'Sale', href: '/sale' },
    { name: 'New Arrivals', href: '/new-arrivals' },
  ];

  if (isNoNavbarPage) return null;

  return (
    <>
      <div className={`${styles.navbarWrapper} ${isScrolled ? styles.scrolled : ''}`}>
        <nav className={styles.navbar}>
          {/* Left Section: Logo */}
          <Link href="/" className={styles.logo}>
            <Zap size={28} fill="currentColor" className={styles.logoIcon} />
            <span>NIKILL</span>
          </Link>

          {/* Center Section: Navigation */}
          <ul className={styles.navLinks}>
            {navLinks.map((link) => (
              <li key={link.name} className={styles.navItem}>
                <Link href={link.href} className={styles.navLink}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Section: Actions */}
          <div className={styles.actions}>
            <div className={`${styles.searchContainer} ${isSearchOpen ? styles.searchOpen : ''} ${styles.hideMobile}`}>
              <input 
                type="text" 
                placeholder="Search premium shoes..." 
                className={styles.searchInput}
              />
              <button 
                className={styles.iconBtn} 
                aria-label="Search"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                onMouseEnter={() => setIsSearchHovered(true)}
                onMouseLeave={() => setIsSearchHovered(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {/* @ts-ignore */}
                <lord-icon
                    src="https://cdn.lordicon.com/swqyihda.json"
                    trigger="hover"
                    state="hover-dates"
                    stroke="bold"
                    colors={isSearchHovered ? "primary:#FF6B00,secondary:#FF6B00" : "primary:#1a1a1a,secondary:#1a1a1a"}
                    style={{ width: "24px", height: "24px", display: "block" }}>
                </lord-icon>
              </button>
            </div>
            <Link 
              href="/favorites"
              className={`${styles.iconBtn} ${styles.hideMobile} ${isAddingFav ? styles.jump : ''}`} 
              aria-label="Wishlist"
              onMouseEnter={() => setIsWishlistHovered(true)}
              onMouseLeave={() => setIsWishlistHovered(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {/* @ts-ignore */}
              <lord-icon
                  src="https://cdn.lordicon.com/nvsfzbop.json"
                  trigger="hover"
                  state="morph-glitter"
                  stroke="bold"
                  colors={isWishlistHovered ? "primary:#FF6B00,secondary:#FF6B00" : "primary:#1a1a1a,secondary:#1a1a1a"}
                  style={{ width: "24px", height: "24px", display: "block" }}>
              </lord-icon>
              {favorites.length > 0 && <span className={styles.badge}>{favorites.length}</span>}
            </Link>
            <Link 
              href="/cart" 
              className={`${styles.iconBtn} ${isAdding ? styles.jump : ''}`} 
              aria-label="Cart"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={() => setIsCartHovered(true)}
              onMouseLeave={() => setIsCartHovered(false)}
            >
              {/* @ts-ignore */}
              <lord-icon
                  src="https://cdn.lordicon.com/uisoczqi.json"
                  trigger="hover"
                  stroke="bold"
                  colors={isCartHovered ? "primary:#FF6B00,secondary:#FF6B00" : "primary:#1a1a1a,secondary:#1a1a1a"}
                  style={{ width: "28px", height: "28px", display: "block" }}>
              </lord-icon>
              {cartItemCount > 0 && <span className={styles.badge}>{cartItemCount}</span>}
            </Link>
            {isLoggedIn ? (
              <div className={styles.userMenuContainer}>
                <div 
                  className={styles.userAvatar} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Image 
                    src={user?.avatar || '/assets/avatar-placeholder.png'} 
                    alt={user?.name || 'User'} 
                    width={40} 
                    height={40} 
                  />
                </div>
                
                {isDropdownOpen && (
                  <div className={styles.dropdown} onMouseLeave={() => setIsDropdownOpen(false)}>
                    <div className={styles.dropdownHeader} style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1a1a' }}>{user?.name}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{user?.email}</div>
                    </div>
                    <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link href="/settings" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                      <Settings size={18} /> Settings
                    </Link>
                    <button className={`${styles.dropdownItem} ${styles.logoutBtn}`} onClick={() => { logout(); setIsDropdownOpen(false); }}>
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={styles.iconBtn} 
                  aria-label="Account"
                  onMouseEnter={() => setIsUserHovered(true)}
                  onMouseLeave={() => setIsUserHovered(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {/* @ts-ignore */}
                  <lord-icon
                      src="https://cdn.lordicon.com/kdduutaw.json"
                      trigger="hover"
                      state="hover-looking-around"
                      colors={isUserHovered ? "primary:#FF6B00,secondary:#FF6B00" : "primary:#1a1a1a,secondary:#1a1a1a"}
                      style={{ width: "24px", height: "24px", display: "block" }}>
                  </lord-icon>
                </Link>

                <Link href="/signup" className={styles.signUpBtn}>
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Toggle */}
            <button
              className={`${styles.iconBtn} ${styles.menuToggle}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${isMobileMenuOpen ? styles.drawerOpen : ''}`}>
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={styles.drawerLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <Link href="/signup" className={styles.signUpBtn} style={{ display: 'block', width: '100%', margin: '12px 0 0 0', textAlign: 'center' }}>
          Sign Up
        </Link>
      </div>
    </>
  );
};

export default Navbar;
