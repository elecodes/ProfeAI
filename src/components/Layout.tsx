import React from 'react';
import Sidebar from './Sidebar';

/**
 * Props for the Layout component.
 */
interface LayoutProps {
  /** The main content to render inside the layout shell. */
  children: React.ReactNode;
}

/**
 * Core application layout shell.
 * 
 * Structure:
 * - Fixed left sidebar (`Sidebar` component).
 * - Scrollable main content area (pushed right).
 * 
 * @param props - {@link LayoutProps}
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans text-[var(--color-primary)]">
      <Sidebar />
      {/* Main Content Area - pushed right by sidebar width */}
      <main className="ml-64 p-8 min-h-screen transition-all duration-300">
        <div className="max-w-[1200px] mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
