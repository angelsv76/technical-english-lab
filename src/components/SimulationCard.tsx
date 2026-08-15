import React, { useState, useEffect } from 'react';
import { Monitor, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { generateHybridActivities } from '../services/activityGenerator';

interface Props {
  word: string;
  meaning: string;
  example: string;
  context: string;
  initialSimulation?: {
    visual: string;
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  };
}

export const SimulationCard: React.FC<Props> = ({ word, meaning, example, context, initialSimulation }) => {
  const [simulation, setSimulation] = useState(initialSimulation);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(!initialSimulation);

  useEffect(() => {
    if (!initialSimulation) {
      const load = async () => {
        setIsLoading(true);
        const result = await generateHybridActivities(word, meaning, example, context);
        setSimulation(result.simulation);
        setIsLoading(false);
      };
      load();
    } else {
      setSimulation(initialSimulation);
      setIsLoading(false);
    }
  }, [word, initialSimulation]);

  const handleSelect = (option: string) => {
    if (selected || !simulation) return;
    setSelected(option);
    setIsCorrect(option === simulation.answer);
  };

  if (isLoading || !simulation) {
    return (
      <div className="bg-zinc-900 text-white p-8 rounded-2xl border border-zinc-800 shadow-xl flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="animate-spin text-[#F57C00]" size={32} />
        <p className="text-sm font-bold text-zinc-400 animate-pulse">Generando simulación...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden h-full">
      <div className="flex items-center gap-2 mb-4 text-[#F57C00]">
        <Monitor size={20} />
        <span className="text-xs font-bold uppercase tracking-widest">Simulation: {word}</span>
      </div>

      <div className="bg-zinc-800 p-8 rounded-xl mb-6 flex items-center justify-center border border-zinc-700">
        <span className="font-mono text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
          {simulation.visual}
        </span>
      </div>

      <p className="text-lg font-bold mb-6 text-zinc-100">{simulation.question}</p>

      <div className="grid grid-cols-1 gap-3">
        {simulation.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            className={`
              w-full p-4 rounded-xl text-left font-bold transition-all duration-200 border
              ${selected === option 
                ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-400')
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:border-zinc-600'}
              ${selected !== null && option === simulation.answer && !isCorrect ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : ''}
            `}
          >
            <div className="flex justify-between items-center">
              <span>{option}</span>
              {selected === option && (
                isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />
              )}
              {selected !== null && option === simulation.answer && !isCorrect && (
                <CheckCircle2 size={20} className="opacity-50" />
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className={`mt-6 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          <p>{isCorrect ? '¡Correcto! Has identificado el elemento correctamente.' : `Incorrecto. La respuesta correcta era: ${simulation.answer}`}</p>
          {!isCorrect && simulation.explanation && (
            <p className="mt-3 font-medium text-red-300 bg-zinc-800 p-3 rounded-lg border border-red-500/30">
              💡 {simulation.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
