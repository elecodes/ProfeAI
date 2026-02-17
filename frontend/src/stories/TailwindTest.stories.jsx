
import React from 'react';

const TailwindTest = () => {
    return (
        <div className="p-10 space-y-4">
            <h1 className="text-3xl font-bold text-blue-700">Tailwind CSS Verification</h1>
            <p className="text-gray-700">
                If this text is <span className="text-red-500 font-bold">red and bold</span>, and the background below is <span className="bg-green-200 px-2 rounded">green</span>, then Tailwind is working!
            </p>
            <div className="bg-green-200 p-4 rounded-lg shadow-md border border-green-400">
                <p className="text-green-800">Card Component Test</p>
            </div>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                Hover Me!
            </button>
        </div>
    );
};

export default {
    title: 'Verification/TailwindTest',
    component: TailwindTest,
};

export const Default = {};
