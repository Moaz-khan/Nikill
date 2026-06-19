import { Metadata } from 'next';
import CategoryContent from './CategoryContent';

// Types for Next.js 15+ App Router Params
interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: `${capitalizedCategory}'s Premium Shoes & Apparel | NIKILL`,
    description: `Discover the latest ${category}'s collection at NIKILL. Shop premium sneakers, running shoes, and lifestyle apparel designed for performance and style.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  
  return (
    <>
      {/* 
        This is a dynamic page generated for category routes 
        (e.g., /men, /women, /kids)
      */}
      <CategoryContent category={category} />
    </>
  );
}
