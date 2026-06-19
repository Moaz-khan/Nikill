import { Metadata } from 'next';
import CategoryContent from '../[category]/CategoryContent';

export const metadata: Metadata = {
  title: 'Shop All Products | NIKILL',
  description: 'Explore the complete NIKILL collection. Shop our full range of premium footwear and apparel across all categories.',
};

export default function ShopPage() {
  return (
    <>
      <CategoryContent category="shop" />
    </>
  );
}
