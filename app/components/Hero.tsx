'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Hero.module.css';

const slides = [
  {
    image: '/assets/hero1.png',
    word: 'RUN',
    headline: 'ENGINEERED FOR THE <span>SPEED</span>',
    description: 'Experience unparalleled responsiveness with the new Air-Elite series. Designed for athletes who never settle for second place.'
  },
  {
    image: '/assets/hero2.png',
    word: 'STYLE',
    headline: 'DEFINING THE <span>MODERN</span> STREET',
    description: 'Blend performance with urban aesthetics. Our latest street collection brings premium comfort to your daily grind.'
  },
  {
    image: '/assets/hero3.png',
    word: 'MOVE',
    headline: 'FREEDOM IN EVERY <span>STRIDE</span>',
    description: 'Ultra-lightweight materials meet ergonomic design. Feel the ground without the impact with our Flex-Form technology.'
  },
  {
    image: '/assets/hero4.png',
    word: 'POWER',
    headline: 'UNLEASH YOUR <span>POTENTIAL</span>',
    description: 'Maximum stability for high-intensity training. The Power-Lock series ensures you stay grounded while you push limits.'
  }
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroGrid}>
        {/* Left Side: Content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 
                className={styles.headline}
                dangerouslySetInnerHTML={{ __html: slides[current].headline }}
              />
              <p className={styles.description}>
                {slides[current].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className={styles.ctaGroup}>
            <Link href="/shop">
              <button className={styles.primaryBtn}>Shop Now</button>
            </Link>
            <Link href="/shop">
              <button className={styles.secondaryBtn}>Explore Collection</button>
            </Link>
          </div>
        </div>

        {/* Right Side: Visual Slider */}
        <div className={styles.visualArea}>
          <AnimatePresence mode="wait">
            <div key={`bg-${current}`} className={styles.watermarkContainer}>
              <motion.span 
                className={styles.watermark}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
              >
                {slides[current].word}
              </motion.span>
            </div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className={styles.imageWrapper}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotate: 10 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Floating Shoe Image */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Image
                  src={slides[current].image}
                  alt={slides[current].word}
                  width={800}
                  height={600}
                  className={styles.shoeImage}
                  priority
                />
              </motion.div>
              
              <div className={styles.glow} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Hero;
