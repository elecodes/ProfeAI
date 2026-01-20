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
    <div className="glass-panel rounded-[var(--radius-card)] p-8 mb-8">
      <h3 className="text-xl font-display font-bold text-[var(--color-primary)] mb-6 flex items-center gap-3">
        <span className="text-2xl">✨</span> Generador Mágico de Diálogos
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ej: Comprando zapatos, En el dentista..."
          className="flex-1 px-5 py-3 rounded-[var(--radius-btn)] border border-gray-200 focus:outline-none focus:border-[var(--color-primary)] bg-white/50"
          disabled={loading}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className={`px-8 py-3 rounded-[var(--radius-btn)] font-bold tracking-wide text-white transition-all transform active:scale-95 shadow-lg ${
            loading || !topic.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[var(--color-primary)] hover:bg-black text-[var(--color-accent)]'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2 text-white">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando...
            </span>
          ) : (
            'GENERAR'
          )}
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-4 font-medium px-2">
          ❌ {error}
        </p>
      )}
      
      <p className="text-xs text-[var(--color-secondary)] mt-4 px-2 tracking-wide uppercase font-medium">
        * Crea una lección única al instante con IA
      </p>
    </div>
  );
};

export default DialogueGenerator;
