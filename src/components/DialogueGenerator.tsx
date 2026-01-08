import React, { useState } from 'react';
import { Dialogue } from '../types/dialogue';

interface Props {
  onGenerate: (dialogue: Dialogue) => void;
  level: string;
}

const DialogueGenerator: React.FC<Props> = ({ onGenerate, level }) => {
  const [topic, setTopic] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-dialogue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, level }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate dialogue');
      }

      const data: Dialogue = await response.json();
      onGenerate(data);
      setTopic(''); // Clear input on success
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-purple-100 mb-6">
      <h3 className="text-lg font-semibold text-purple-700 mb-3 flex items-center gap-2">
        ✨ Generador Mágico de Diálogos
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ej: Comprando zapatos, En el dentista..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className={`px-6 py-2 rounded-lg font-medium text-white transition-all transform active:scale-95 ${
            loading || !topic.trim()
              ? 'bg-purple-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando...
            </span>
          ) : (
            'Generar 🪄'
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">
          ❌ {error}
        </p>
      )}
      
      <p className="text-xs text-gray-500 mt-2 italic">
        * Usa IA para crear una lección única al instante.
      </p>
    </div>
  );
};

export default DialogueGenerator;
