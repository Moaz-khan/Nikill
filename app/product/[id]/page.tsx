import { Metadata } from 'next';
import ProductContent from './ProductContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Premium Footwear | NIKILL`,
    description: `Shop the latest premium footwear and apparel at NIKILL.`
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductContent productId={id} />;
}
