import Hero from "./components/Hero";
import LogoBar from "./components/LogoBar";
import CategorySection from "./components/CategorySection";
import FeaturedSection from "./components/FeaturedSection";
import BrandStory from "./components/BrandStory";
import PromoBanner from "./components/PromoBanner";
import Testimonials from "./components/Testimonials";
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Hero />
        <LogoBar />
        <CategorySection />
        <FeaturedSection />
        <BrandStory />
        <PromoBanner />
        <Testimonials />
      </main>
    </div>
  );
}
