'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const pathname = usePathname();
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const isNoFooterPage = pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/admin');
  if (isNoFooterPage) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* Column 1: Brand Info */}
        <div className={styles.column}>
          <div className={styles.brandLogo}>NIKILL</div>
          <p className={styles.brandDesc}>
            Premium footwear designed for comfort, performance, and style. Elevate your everyday walk.
          </p>
          <div className={styles.socialIcons}>
            <a href="#"
              className={styles.lordIconWrapper}
              onMouseEnter={() => setHoveredIcon('fb')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
          <lord-icon
                src="https://cdn.lordicon.com/cxauoejw.json"
                trigger="hover"
                state="hover-draw"
                stroke="bold"
                colors={hoveredIcon === 'fb' ? "primary:#FF6B00,secondary:#FF6B00" : "primary:#1a1a1a,secondary:#1a1a1a"}
                style={{ width: "32px", height: "32px", display: "block" }}>
              </lord-icon>
            </a>
            <a href="#"
              className={styles.lordIconWrapper}
              onMouseEnter={() => setHoveredIcon('ig')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
          <lord-icon
                src="https://cdn.lordicon.com/tgyvxauj.json"
                trigger="hover"
                state="hover-rotate"
                stroke="bold"
                colors={hoveredIcon === 'ig' ? "primary:#FF6B00,secondary:#FF6B00" : "primary:#1a1a1a,secondary:#1a1a1a"}
                style={{ width: "32px", height: "32px", display: "block" }}>
              </lord-icon>
            </a>
            <a href="#"
              className={styles.lordIconWrapper}
              onMouseEnter={() => setHoveredIcon('tw')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
          <lord-icon
                src="https://cdn.lordicon.com/yizwahhw.json"
                trigger="hover"
                state="hover-draw"
                stroke="bold"
                colors={hoveredIcon === 'tw' ? "primary:#FF6B00,secondary:#FF6B00" : "primary:#1a1a1a,secondary:#1a1a1a"}
                style={{ width: "32px", height: "32px", display: "block" }}>
              </lord-icon>
            </a>
            <a href="#"
              className={styles.lordIconWrapper}
              onMouseEnter={() => setHoveredIcon('yt')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
          <lord-icon
                src="https://cdn.lordicon.com/japmxdiq.json"
                trigger="hover"
                stroke="bold"
                colors={hoveredIcon === 'yt' ? "primary:#FF6B00,secondary:#FF6B00" : "primary:#1a1a1a,secondary:#1a1a1a"}
                style={{ width: "32px", height: "32px", display: "block" }}>
              </lord-icon>
            </a>
          </div>
        </div>

        {/* Column 2: Shop */}
        <div className={styles.column}>
          <h4 className={styles.colHeading}>Shop</h4>
          <ul className={styles.linkList}>
            <li><a href="#" className={styles.link}>Men</a></li>
            <li><a href="#" className={styles.link}>Women</a></li>
            <li><a href="#" className={styles.link}>Kids</a></li>
            <li><a href="#" className={styles.link}>Sneakers</a></li>
            <li><a href="#" className={styles.link}>Formal Shoes</a></li>
            <li><a href="#" className={styles.link}>Casual Shoes</a></li>
            <li><a href="#" className={styles.link}>Sports / Running</a></li>
            <li><a href="#" className={styles.link}>New Arrivals</a></li>
            <li><a href="#" className={styles.link}>Sale</a></li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div className={styles.column}>
          <h4 className={styles.colHeading}>Company</h4>
          <ul className={styles.linkList}>
            <li><a href="#" className={styles.link}>About Us</a></li>
            <li><a href="#" className={styles.link}>Our Story</a></li>
            <li><a href="#" className={styles.link}>Careers</a></li>
            <li><a href="#" className={styles.link}>Blog</a></li>
            <li><a href="#" className={styles.link}>Contact Us</a></li>
          </ul>
        </div>

        {/* Column 4: Customer Support */}
        <div className={styles.column}>
          <h4 className={styles.colHeading}>Support</h4>
          <ul className={styles.linkList}>
            <li><a href="#" className={styles.link}>Help Center</a></li>
            <li><a href="#" className={styles.link}>FAQs</a></li>
            <li><a href="#" className={styles.link}>Order Tracking</a></li>
            <li><a href="#" className={styles.link}>Shipping & Delivery</a></li>
            <li><a href="#" className={styles.link}>Returns</a></li>
            <li><a href="#" className={styles.link}>Size Guide</a></li>
          </ul>
        </div>

        {/* Column 5: Legal */}
        <div className={styles.column}>
          <h4 className={styles.colHeading}>Legal</h4>
          <ul className={styles.linkList}>
            <li><a href="#" className={styles.link}>Privacy Policy</a></li>
            <li><a href="#" className={styles.link}>Terms & Conditions</a></li>
            <li><a href="#" className={styles.link}>Refund Policy</a></li>
            <li><a href="#" className={styles.link}>Cookie Policy</a></li>
          </ul>
        </div>

        {/* Column 6: Newsletter */}
        <div className={styles.column}>
          <div className={styles.newsletter}>
            <h4 className={styles.newsletterTitle}>Subscribe to our newsletter</h4>
            <p className={styles.newsletterText}>Get updates on new arrivals and exclusive offers.</p>
            <form className={styles.subscribeForm} onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className={styles.emailInput}
                required
              />
              <button type="submit" className={styles.subscribeBtn}>
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <p className={styles.copyright}>
          © 2026 NIKILL. All rights reserved.
        </p>
        <div className={styles.paymentIcons}>
          <span>Visa</span>
          <span>MasterCard</span>
          <span>PayPal</span>
          <span>Apple Pay</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
