import React from 'react';
import styles from './Testimonials.module.css';

const reviews = [
  {
    name: "Aman Ahmed",
    text: "The comfort levels are unmatched. Nikill shoes have become my daily driver for both work and the gym.",
    rating: 5,
    role: "Marathon Runner"
  },
  {
    name: "Sarah Khan",
    text: "Design aesthetics are 10/10. I get compliments every time I wear my pair. Best purchase this year!",
    rating: 5,
    role: "Fashion Blogger"
  },
  {
    name: "Bilal Sheikh",
    text: "Exceeded my expectations. The quality of materials used is premium and the glassmorphism design on the site is a vibe.",
    rating: 4,
    role: "Sneakerhead"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className={styles.testimonialsSection}>
      <h2 className={styles.sectionTitle}>What Our Community Says</h2>
      
      <div className={styles.container}>
        {reviews.map((review, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <span key={i} className={styles.star}>
                  {i < review.rating ? '★' : '☆'}
                </span>
              ))}
            </div>
            
            <p className={styles.reviewText}>"{review.text}"</p>
            
            <div className={styles.userInfo}>
              <div>
                <p className={styles.userName}>{review.name}</p>
                <p className={styles.userRole}>{review.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
