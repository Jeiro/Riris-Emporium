import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { SearchModal } from './SearchModal';
import { NotificationContainer } from './NotificationContainer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      <Navbar />
      
      <main className="flex-1 pt-16 lg:pt-20">
        {children}
      </main>
      
      <Footer />
      
      {/* Global Components */}
      <CartDrawer />
      <SearchModal />
      <NotificationContainer />
    </div>
  );
};
