import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Inicio', icon: '🏠' },
    { path: '/library', label: 'Estudiar', icon: '📚' }, // Changed path for now to differentiate
    { path: '/chat-select', label: 'Conversar', icon: '💬' }, // Placeholder for chat select
    { path: '/profile', label: 'Perfil', icon: '👤' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-transparent border-r border-[#E2E8F0] flex flex-col py-8 z-50">
      {/* Logo Area */}
      <div className="px-8 mb-12">
        <h1 className="text-2xl font-serif font-bold text-[var(--color-primary)] tracking-tight">
          Profe AI
        </h1>
        <p className="text-xs text-[var(--color-secondary)] uppercase tracking-widest mt-1">
          Tutor Personal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 relative ${
                isActive
                  ? 'text-[var(--color-primary)] font-semibold bg-white/40' // Active: subtle bg + strong text
                  : 'text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:bg-white/20'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Line on Left (or Right as requested, attempting Left as fits sidebar better usually, but per user request "left or right edge". Let's try Right edge of the item for uniqueness or Left for standard. User said: "3px gold vertical line on the left or right edge". Let's do right edge of the SIDEBAR or local item? "Active states ... 3px gold vertical line on the left or right edge". Let's put it on the LEFT of the text for a clean look). */}
                {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--color-accent)] rounded-r-full" />
                )}
                
                <span className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
                <span className="tracking-wide">{item.label}</span>
              </>
            )}
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
  );
};

export default Sidebar;
