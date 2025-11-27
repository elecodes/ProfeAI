import React from 'react';

const GrammarReport = ({ report }) => {
  if (!report) return null;

  const { score, corrections, generalFeedback } = report;

  const getScoreColor = (s) => {
    if (s >= 90) return 'text-green-600';
    if (s >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Grammar Report 📝</h2>
        <div className={`text-5xl font-black mt-4 ${getScoreColor(score)}`}>
          {score}
          <span className="text-lg text-gray-400 font-normal">/100</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">General Feedback</h3>
        <p className="text-gray-600 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
          "{generalFeedback}"
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Corrections ({corrections.length})</h3>
        {corrections.length === 0 ? (
          <div className="text-green-600 bg-green-50 p-4 rounded-lg text-center">
            🎉 Perfect! No errors found.
          </div>
        ) : (
          <div className="space-y-4">
            {corrections.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {item.type}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-50 p-3 rounded text-red-700 line-through decoration-red-400">
                        {item.original}
                      </div>
                      <div className="bg-green-50 p-3 rounded text-green-700 font-medium">
                        {item.corrected}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      💡 <span className="font-medium">Explanation:</span> {item.explanation}
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
