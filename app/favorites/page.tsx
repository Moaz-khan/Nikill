import { Metadata } from 'next';
import FavoritesContent from './FavoritesContent';

export const metadata: Metadata = {
  title: 'Your Favorites | NIKILL',
  description: 'View and manage your favorite NIKILL products.'
};

export default function FavoritesPage() {
  return <FavoritesContent />;
}
