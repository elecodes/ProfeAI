import React from 'react';
import { GrammarReport as IGrammarReport } from '../types/grammar';

/**
 * Props for the GrammarReport component.
 */
interface GrammarReportProps {
  /** The specific report object containing score, feedback, and corrections. */
  report: IGrammarReport | null;
}

/**
 * Displays a detailed analysis of the user's grammar usage.
 * 
 * Features:
 * - Overall score display with color coding.
 * - General AI feedback summary.
 * - Itemized list of corrections (diff view showing Original vs Corrected).
 * 
 * @param props - {@link GrammarReportProps}
 */
const GrammarReport: React.FC<GrammarReportProps> = ({ report }) => {
  if (!report) return null;

  const { score, corrections, generalFeedback } = report;

  const getScoreColor = (s: number): string => {
    if (s >= 90) return 'text-green-600';
    if (s >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="glass-panel rounded-[var(--radius-card)] p-8 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-[var(--color-primary)] mb-2">Reporte de Gramática</h2>
        <div className={`text-6xl font-display font-black mt-6 ${getScoreColor(score)} transition-colors`}>
          {score}
          <span className="text-xl text-[var(--color-secondary)] font-normal ml-1 opacity-50">/100</span>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)] mb-4 border-b border-gray-100 pb-2">Feedback General</h3>
        <p className="text-[var(--color-primary)] text-lg leading-relaxed font-serif italic bg-[var(--color-background)]/50 p-6 rounded-[var(--radius-btn)] border border-white/40">
          "{generalFeedback}"
        </p>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)] mb-6 border-b border-gray-100 pb-2">Correcciones ({corrections.length})</h3>
        {corrections.length === 0 ? (
          <div className="text-[var(--color-success)] bg-[var(--color-success)]/10 p-6 rounded-[var(--radius-card)] text-center font-medium text-lg border border-[var(--color-success)]/20">
            🎉 ¡Perfecto! No se encontraron errores.
          </div>
        ) : (
          <div className="space-y-6">
            {corrections.map((item, idx) => (
              <div key={idx} className="bg-white/60 border border-gray-100 rounded-[var(--radius-btn)] p-6 hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-[var(--color-secondary)] px-2 py-1 rounded-full">
                        {item.type}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-red-50/80 p-4 rounded-[var(--radius-btn)] text-red-700 line-through decoration-red-400 font-medium">
                        {item.original}
                      </div>
                      <div className="bg-green-50/80 p-4 rounded-[var(--radius-btn)] text-green-700 font-bold flex items-center gap-2">
                        <span>✅</span> {item.corrected}
                      </div>
                    </div>
                    <p className="mt-4 text-[var(--color-primary)] leading-relaxed">
                      <span className="font-bold text-[var(--color-accent)] text-sm uppercase tracking-wide mr-2">Explicación:</span> 
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarReport;
