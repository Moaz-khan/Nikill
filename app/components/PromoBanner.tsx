import React from 'react';
import Link from 'next/link';
import styles from './PromoBanner.module.css';
import Image from 'next/image';

const PromoBanner: React.FC = () => {
  return (
    <section className={styles.promoSection}>
      <div className={styles.promoCard}>
        <div className={styles.imageSide}>
          <Image
            src="/assets/banner.png"
            alt="Promotion Banner"
            fill
            className={styles.bannerImage}
            priority
          />
        </div>

        <div className={styles.textSide}>
          <span className={styles.title}>Limited Time Offer</span>
          <h2 className={styles.discount}>30% OFF</h2>
          <p className={styles.description}>
            Upgrade your stride with our premium collection. Grab your favorite
            pair now and enjoy exclusive savings on all new arrivals.
          </p>
          <Link href="/shop" className={styles.cta}>
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
