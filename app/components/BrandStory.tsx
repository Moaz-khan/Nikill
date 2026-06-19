'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './BrandStory.module.css';

const storyParagraphs = [
  "In the heart of urban exploration, Nikill was born from a simple vision: to redefine the boundary between performance and aesthetic. We believed that every step should be a statement of intent, a fusion of power and grace.",
  "Our journey began in a small workshop where the smell of premium leather met the precision of modern engineering. We didn't just want to build shoes; we wanted to craft companions for those who dare to walk their own path.",
  "Every stitch in a Nikill shoe is a testament to our commitment to excellence. We source the finest materials from across the globe, ensuring that comfort is never sacrificed for the sake of design, but rather enhanced by it.",
  "Innovation is the heartbeat of our brand. From our proprietary cushioning technology to our sustainable manufacturing practices, we are constantly pushing the limits of what a footwear brand can achieve in the modern world.",
  "Today, Nikill stands as a symbol of resilience and style. We invite you to join our story, to lace up and experience the dedication that goes into every pair. This is more than just footwear—it's your legacy in motion."
];

const BrandStory: React.FC = () => {
  const [visibleParagraphs, setVisibleParagraphs] = useState<string[]>(storyParagraphs.map(() => ""));
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting) return;

    if (currentParagraphIndex < storyParagraphs.length) {
      if (currentCharIndex < storyParagraphs[currentParagraphIndex].length) {
        const timeout = setTimeout(() => {
          setVisibleParagraphs(prev => {
            const next = [...prev];
            next[currentParagraphIndex] = storyParagraphs[currentParagraphIndex].substring(0, currentCharIndex + 1);
            return next;
          });
          setCurrentCharIndex(prev => prev + 1);
        }, 30); // Typing speed
        return () => clearTimeout(timeout);
      } else if (currentParagraphIndex < storyParagraphs.length - 1) {
        const timeout = setTimeout(() => {
          setCurrentParagraphIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 1000); // Delay between paragraphs
        return () => clearTimeout(timeout);
      }
    }
  }, [isIntersecting, currentParagraphIndex, currentCharIndex]);

  return (
    <section id="brand-story" className={styles.brandStory} ref={sectionRef}>
      <video
        autoPlay
        muted
        loop
        playsInline
        className={styles.videoBackground}
      >
        <source 
          src="/assets/intro.mp4" 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
      
      <div className={styles.overlay}></div>
      
      <div className={styles.content}>
        <span className={styles.tagline}>Our Brand Story</span>
        {visibleParagraphs.map((text, index) => (
          <p key={index} className={styles.storyParagraph}>
            {text}
            {index === currentParagraphIndex && currentCharIndex < storyParagraphs[index].length && (
              <span className={styles.cursor}></span>
            )}
          </p>
        ))}
      </div>
    </section>
  );
};

export default BrandStory;
