import React from 'react';
import { Link } from 'react-router-dom';
import { useUserStats } from '../hooks/useUserStats';

const Navbar = () => {
    const { stats } = useUserStats();

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                {/* Left: Home Link */}
                <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-2">
                    <span>🏠</span>
                    <span className="hidden sm:inline">Tutor IA</span>
                </Link>

                {/* Right: Stats & Profile */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100" title="Racha de días">
                        <span className="text-lg">🔥</span>
                        <span className="font-bold text-orange-600">{stats.streak}</span>
                    </div>

                    <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition bg-gray-50 px-3 py-1 rounded-full border border-gray-100 hover:border-gray-200">
                        <span className="text-lg">👤</span>
                        <span className="hidden sm:inline font-medium">Perfil</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
