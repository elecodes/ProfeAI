import React, { useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans text-[var(--color-primary)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area - pushed right by sidebar width on desktop */}
      <main className="md:ml-64 min-h-screen transition-all duration-300 flex flex-col">
        {/* Header / Top Bar */}
        <header className="sticky top-0 z-40 w-full bg-[var(--color-background)]/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-4 flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Toggle */}
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open sidebar"
                >
                  <span className="text-2xl">☰</span>
                </button>
                
                <div className="text-sm font-medium text-[var(--color-secondary)]">
                    {/* Could add breadcrumbs or page title here */}
                </div>
            </div>
            
            {/* Right Side: ElevenLabs Widget & Profile Actions */}
            <div className="flex items-center gap-4">
               {/* Widget removed from here, it is in HomePage */}
            </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full flex-1">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
