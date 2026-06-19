import { Metadata } from 'next';
import CartContent from './CartContent';

export const metadata: Metadata = {
  title: 'Shopping Cart | NIKILL',
  description: 'Review the items in your shopping cart before checkout.'
};

export default function CartPage() {
  return <CartContent />;
}
