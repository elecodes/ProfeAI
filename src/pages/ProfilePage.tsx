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
        <div className="max-w-3xl mx-auto p-6 min-h-screen bg-gray-50 flex flex-col items-center pt-16">
            <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-4 mb-4 md:mb-0 w-full">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl text-gray-500">
                            👤
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="border-b-2 border-blue-500 focus:outline-none text-2xl font-bold text-gray-900 py-1"
                                        autoFocus
                                    />
                                    <button onClick={handleSave} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition">Guardar</button>
                                    <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 group">
                                    <h1 className="text-2xl font-bold text-gray-900">{stats.username || 'Estudiante'}</h1>
                                    <button 
                                        onClick={() => {
                                            setTempName(stats.username || 'Estudiante');
                                            setIsEditing(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
                                        title="Editar nombre"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                            <p className="text-gray-500 text-sm font-medium">{stats.level}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Section (Main Focus) */}
                <div className="mb-10">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Tu Progreso</span>
                        <div className="text-right">
                             <span className="text-2xl font-bold text-blue-600">{stats.xp}</span>
                             <span className="text-gray-400 text-sm"> / {xpGoal} XP</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">Sigue practicando para alcanzar el siguiente nivel.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 flex flex-col items-center">
                        <div className="text-4xl font-bold text-gray-800 mb-1">{stats.xp}</div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total XP</div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 flex flex-col items-center">
                        <div className="text-4xl font-bold text-gray-800 mb-1">{stats.streak}</div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Racha Días</div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <button 
                        onClick={() => {
                            if (window.confirm("¿Estás seguro de que quieres reiniciar tu progreso? Esta acción no se puede deshacer.")) {
                                resetStats();
                            }
                        }}
                        className="w-full text-center py-2 text-red-500 text-sm hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                        Reiniciar progreso
                    </button>
                    <Link 
                        to="/" 
                        className="block w-full text-center py-4 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                    >
                        ← Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
