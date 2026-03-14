import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { generateHybridPractice } from '../services/activityGenerator';

interface Props {
  word: string;
  context: string;
  initialPractice?: {
    question: string;
    options: string[];
    answer: string;
  };
}

export const PracticeCard: React.FC<Props> = ({ word, context, initialPractice }) => {
  const [currentPractice, setCurrentPractice] = useState(initialPractice);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isGenerating, setIsGenerating] = useState(!initialPractice);

  useEffect(() => {
    if (!initialPractice) {
      const load = async () => {
        setIsGenerating(true);
        const newPractice = await generateHybridPractice(word, context);
        setCurrentPractice(newPractice);
        setIsGenerating(false);
      };
      load();
    } else {
      setCurrentPractice(initialPractice);
      setIsGenerating(false);
    }
  }, [word, initialPractice]);

  const handleSelect = async (option: string) => {
    if (selected || isGenerating || !currentPractice) return;
    
    const correct = option === currentPractice.answer;
    setSelected(option);
    setIsCorrect(correct);
    setAttempts(prev => prev + 1);

    if (!correct) {
      // If incorrect, wait a bit then generate a new question
      setTimeout(async () => {
        setIsGenerating(true);
        const newPractice = await generateHybridPractice(word, context);
        if (newPractice) {
          setCurrentPractice(newPractice);
          setSelected(null);
          setIsCorrect(null);
        }
        setIsGenerating(false);
      }, 2000);
    }
  };

  const handleReset = async () => {
    setIsGenerating(true);
    const newPractice = await generateHybridPractice(word, context);
    if (newPractice) {
      setCurrentPractice(newPractice);
      setSelected(null);
      setIsCorrect(null);
    }
    setIsGenerating(false);
  };

  if (isGenerating && !currentPractice) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="animate-spin text-[#F57C00]" size={32} />
        <p className="text-sm font-bold text-zinc-600 animate-pulse">Generando práctica...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden relative h-full">
      {isGenerating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-[#F57C00]" size={32} />
          <p className="text-sm font-bold text-zinc-600 animate-pulse">Reformulando pregunta...</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-blue-500">
          <BookOpen size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">Practice: {word}</span>
        </div>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          Intentos: {attempts}
        </div>
      </div>

      {currentPractice && (
        <>
          <p className="text-lg font-bold mb-6 text-zinc-900">{currentPractice.question}</p>

          <div className="grid grid-cols-1 gap-3">
            {currentPractice.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(option)}
                disabled={selected !== null || isGenerating}
                className={`
                  w-full p-4 rounded-xl text-left font-bold transition-all duration-200 border
                  ${selected === option 
                    ? (isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700')
                    : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-200'}
                  ${selected !== null && option === currentPractice.answer && !isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : ''}
                `}
              >
                <div className="flex justify-between items-center">
                  <span>{option}</span>
                  {selected === option && (
                    isCorrect ? <CheckCircle2 size={20} className="text-emerald-500" /> : <XCircle size={20} className="text-red-500" />
                  )}
                  {selected !== null && option === currentPractice.answer && !isCorrect && (
                    <CheckCircle2 size={20} className="text-emerald-300" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300 ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              <div className="flex justify-between items-center">
                <span>
                  {isCorrect 
                    ? '¡Correcto! Has comprendido el uso técnico de la palabra.' 
                    : 'Respuesta incorrecta, intentemos otra vez.'}
                </span>
                {isCorrect && (
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    <RotateCcw size={14} />
                    <span>Nueva</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
