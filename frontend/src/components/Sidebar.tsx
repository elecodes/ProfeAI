import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /** Whether the sidebar is open on mobile. */
  isOpen: boolean;
  /** Callback to close the sidebar. */
  onClose: () => void;
}

/**
 * The main side navigation menu.
 * 
 * Features:
 * - Dynamic active state handling (supports both URL paths and query params like `?mode=study`).
 * - Responsive layout adaptation (supports mobile via overlay).
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { 
      path: "/?mode=study", 
      label: "Frases", 
      icon: "📚",
      ident: "study"
    },
    { 
      path: "/?mode=dialogues", 
      label: "Diálogos", 
      icon: "🗣️",
      ident: "dialogues"
    },
    { 
      path: "/?mode=quiz", 
      label: "Quiz", 
      icon: "🎯",
      ident: "quiz"
    },
    { 
      path: "/?mode=chat", 
      label: "¿Charlamos?", 
      icon: "💬",
      ident: "chat"
    },
    { 
      path: "/profile", 
      label: "Perfil", 
      icon: "👤",
      ident: "profile"
    },
  ];

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-white md:bg-transparent border-r border-[#E2E8F0] flex flex-col py-8 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo Area */}
        <div className="px-8 mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[var(--color-primary)] tracking-tight">
              Profe AI
            </h1>
            <p className="text-xs text-[var(--color-secondary)] uppercase tracking-widest mt-1">
              Tutor Personal
            </p>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              onClick={() => onClose()} // Close on click for mobile
              className={({ isActive: routerActive }) => {
                  // Custom check for query params
                  const search = window.location.search;
                  const mode = new URLSearchParams(search).get('mode');
                  
                  let isActive = false;
                  if (item.path.startsWith('/?mode=')) {
                      const targetMode = item.path.split('=')[1];
                      isActive = mode === targetMode;
                      // Default to study if no mode and looking at study
                      if (!mode && item.ident === 'study' && window.location.pathname === '/') {
                          isActive = true;
                      }
                  } else {
                      isActive = routerActive;
                  }

                  return `group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 relative ${
                    isActive
                      ? 'text-[var(--color-primary)] font-semibold bg-white/40' 
                      : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-white/20'
                  }`;
              }}
            >
              {({ isActive: routerActive }) => {
                  const search = window.location.search;
                  const mode = new URLSearchParams(search).get('mode');
                  
                  let isActive = false;
                  if (item.path.startsWith('/?mode=')) {
                      const targetMode = item.path.split('=')[1];
                      isActive = mode === targetMode;
                       if (!mode && item.ident === 'study' && window.location.pathname === '/') {
                          isActive = true;
                      }
                  } else {
                      isActive = routerActive;
                  }

                  return (
                    <>
                      {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--color-accent)] rounded-r-full" />
                      )}
                      
                      <span className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.icon}
                      </span>
                      <span className="tracking-wide">{item.label}</span>
                    </>
                  );
              }}
            </NavLink>
          ))}
        </nav>

        {/* Footer / User Info could go here */}
        <div className="px-8 mt-auto">
          <div className="text-xs text-[var(--color-secondary)]">
            &copy; 2026 Elecodes
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
