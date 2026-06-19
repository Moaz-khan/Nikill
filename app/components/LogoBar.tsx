'use client';

import React from 'react';
import { 
  Zap, 
  Wind, 
  Activity, 
  Target, 
  Trophy, 
  Flame,
  Globe
} from 'lucide-react';
import styles from './LogoBar.module.css';

const logos = [
  { name: 'NIKE', icon: <Zap size={20} /> },
  { name: 'ADIDAS', icon: <Globe size={20} /> },
  { name: 'PUMA', icon: <Flame size={20} /> },
  { name: 'REEBOK', icon: <Activity size={20} /> },
  { name: 'ASICS', icon: <Target size={20} /> },
  { name: 'JORDAN', icon: <Trophy size={20} /> },
  { name: 'NEW BALANCE', icon: <Wind size={20} /> },
];

const LogoBar = () => {
  // Duplicate the list to create infinite effect
  const displayLogos = [...logos, ...logos, ...logos];

  return (
    <div className={styles.logoBar}>
      <div className={styles.marquee}>
        {displayLogos.map((logo, index) => (
          <div key={index} className={styles.logoItem}>
            {logo.icon}
            <span>{logo.name}</span>
            <div className={styles.dot} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoBar;
