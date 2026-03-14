import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { ReinforcementActivity } from '../services/reinforcementService';

interface Props {
  activity: ReinforcementActivity;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export const ReinforcementCard: React.FC<Props> = ({ activity, onCorrect, onIncorrect }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === activity.answer;
    setIsCorrect(correct);
    
    if (correct) {
      onCorrect?.();
    } else {
      onIncorrect?.();
    }
  };

  return (
    <div className="bg-orange-50 p-6 rounded-2xl border-2 border-orange-200 shadow-md animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-orange-600">
          <AlertCircle size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">Práctica de refuerzo</span>
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <Sparkles size={14} />
          <span className="text-[10px] font-bold uppercase">AI Generated</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl mb-6 border border-orange-100 shadow-sm">
        <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Contexto / Instrucción</p>
        <p className="text-lg font-mono font-bold text-zinc-800">{activity.instruction}</p>
      </div>

      <p className="text-lg font-bold mb-6 text-zinc-900">{activity.question}</p>

      <div className="grid grid-cols-1 gap-3">
        {activity.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            className={`
              w-full p-4 rounded-xl text-left font-bold transition-all duration-200 border
              ${selected === option 
                ? (isCorrect ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-red-500 text-white border-red-600')
                : 'bg-white border-orange-100 text-zinc-600 hover:bg-orange-100/50 hover:border-orange-300'}
              ${selected !== null && option === activity.answer && !isCorrect ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : ''}
            `}
          >
            <div className="flex justify-between items-center">
              <span>{option}</span>
              {selected === option && (
                isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />
              )}
              {selected !== null && option === activity.answer && !isCorrect && (
                <CheckCircle2 size={20} className="text-emerald-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className={`mt-6 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${isCorrect ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>
          {isCorrect ? '¡Excelente! Refuerzo completado con éxito.' : `Sigue intentándolo. La respuesta correcta era: ${activity.answer}`}
        </div>
      )}
    </div>
  );
};
