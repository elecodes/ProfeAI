import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import UserService from '../services/UserService';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage = () => {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="p-8 text-center">
                <p>Please log in to view your profile.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Link 
                to="/" 
                className="mb-6 inline-block text-gray-600 hover:text-blue-600"
            >
                ← Back to Dashboard
            </Link>
            
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        👤
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{user.displayName || 'User'}</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="font-semibold mb-2">Current Level</h3>
                        <p className="text-lg capitalize text-blue-600 font-bold">
                            {(userProfile as any)?.level || 'Beginner'}
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <h3 className="font-semibold mb-2">Member Since</h3>
                        <p className="text-gray-700">
                            {new Date((userProfile as any)?.createdAt?.seconds * 1000).toLocaleDateString() || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">Learned Phrases</h2>
                {((userProfile as any)?.learnedPhrases || []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(userProfile as any).learnedPhrases.map((phrase: any, i: number) => (
                            <div key={i} className="p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-800">{phrase.text}</p>
                                <p className="text-sm text-gray-600">{phrase.translation}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No learned phrases yet. Go study!</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
