import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStats } from '../hooks/useUserStats';

const ProfilePage = () => {
    const { stats, updateProfile, resetStats } = useUserStats();
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(stats.username || 'Estudiante');

    const handleSave = () => {
        updateProfile(tempName);
        setIsEditing(false);
    };

    // Progress Calculation
    const xpGoal = stats.xp < 100 ? 100 : 500;
    const progressPercent = Math.min(100, Math.max(0, (stats.xp / xpGoal) * 100));

    return (

        <div className="max-w-4xl mx-auto p-6 flex flex-col items-center">
            <div className="w-full glass-panel rounded-[var(--radius-card)] p-10 shadow-lg">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-6 mb-4 md:mb-0 w-full">
                        <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center text-3xl text-white shadow-md">
                            👤
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="border-b-2 border-[var(--color-accent)] bg-transparent focus:outline-none text-3xl font-serif font-bold text-[var(--color-primary)] py-1 w-full max-w-xs"
                                        autoFocus
                                    />
                                    <button onClick={handleSave} className="text-sm bg-slate-700 text-white px-4 py-2 rounded-[var(--radius-btn)] hover:bg-slate-800 transition">Guardar</button>
                                    <button onClick={() => setIsEditing(false)} className="text-sm text-[var(--color-secondary)] hover:text-slate-700">Cancelar</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group">
                                    <h1 className="text-3xl font-serif font-bold text-slate-800">{stats.username || 'Estudiante'}</h1>
                                    <button 
                                        onClick={() => {
                                            setTempName(stats.username || 'Estudiante');
                                            setIsEditing(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-secondary)] hover:text-[var(--color-accent)]"
                                        title="Editar nombre"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                            <p className="text-[var(--color-accent)] text-sm font-bold uppercase tracking-widest mt-1">{stats.level}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Section (Main Focus) */}
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-3">
                        <span className="text-sm font-semibold text-[var(--color-secondary)] uppercase tracking-wider">Tu Progreso</span>
                        <div className="text-right">
                             <span className="text-3xl font-display font-bold text-[var(--color-accent)]">{stats.xp}</span>
                             <span className="text-[var(--color-secondary)] text-sm font-medium"> / {xpGoal} XP</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden inner-shadow">
                        <div 
                            className="bg-[var(--color-accent)] h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(197,160,89,0.4)]"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-[var(--color-secondary)] mt-3 text-right font-medium">Sigue practicando para alcanzar el siguiente nivel.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="bg-white/50 p-8 rounded-[var(--radius-card)] border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="text-5xl font-display font-bold text-slate-800 mb-2">{stats.xp}</div>
                        <div className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em]">Total XP</div>
                    </div>
                    
                    <div className="bg-white/50 p-8 rounded-[var(--radius-card)] border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                        <div className="text-5xl font-display font-bold text-slate-800 mb-2">{stats.streak}</div>
                        <div className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-[0.2em]">Racha Días</div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
                    <Link 
                        to="/" 
                        className="block w-full text-center py-4 bg-slate-700 text-white font-medium hover:bg-slate-800 rounded-[var(--radius-btn)] transition shadow-lg tracking-wide"
                    >
                        ← VOLVER AL INICIO
                    </Link>
                    
                    <button 
                        onClick={() => {
                            if (window.confirm("¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.")) {
                                resetStats();
                            }
                        }}
                        className="w-full text-center py-2 text-red-400 text-sm hover:text-red-600 transition"
                    >
                        Reiniciar progreso
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
