import React from 'react';
import { Simulation } from '../types';

interface Props {
  simulation: Simulation;
  onAnswer: (correct: boolean) => void;
}

export const SimulationRenderer: React.FC<Props> = ({ simulation, onAnswer }) => {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);

  const handleSelect = (option: string) => {
    if (showFeedback) return;
    setSelected(option);
    setShowFeedback(true);
    onAnswer(option === simulation.answer);
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-8 text-white">
      <div className="mb-8 text-center">
        <div className="inline-block px-4 py-2 bg-zinc-800 rounded-lg font-mono text-emerald-400 text-xl border border-zinc-700 shadow-inner">
          {simulation.visual}
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <p className="text-xs font-bold text-[#F57C00] uppercase tracking-widest mb-1">{simulation.type}</p>
          <p className="text-sm text-zinc-400">{simulation.instruction}</p>
        </div>

        <h4 className="text-lg font-medium text-zinc-300 text-center">
          {simulation.question}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {simulation.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`
                p-4 rounded-xl border-2 transition-all text-lg font-bold
                ${!showFeedback 
                  ? 'border-zinc-700 bg-zinc-800 hover:border-[#F57C00] hover:bg-zinc-700' 
                  : option === simulation.answer
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : option === selected
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-zinc-700 bg-zinc-800 opacity-50'}
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {showFeedback && (
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <p className={`text-xl font-bold ${selected === simulation.answer ? 'text-emerald-400' : 'text-red-400'}`}>
            {selected === simulation.answer ? '¡Correcto! Well done.' : 'Incorrecto. Intenta de nuevo.'}
          </p>
          <button 
            onClick={() => {
              setSelected(null);
              setShowFeedback(false);
            }}
            className="mt-4 text-sm text-zinc-400 underline hover:text-white"
          >
            Reiniciar simulación
          </button>
        </div>
      )}
    </div>
  );
};
