import React, { useState } from 'react';
import { Brain, CheckCircle2, XCircle, ChevronRight, Trophy } from 'lucide-react';
import { VocabularyEntry } from '../types';
import { buildReviewQuestions, ReviewQuestion } from '../utils/srs';

interface Props {
  glossary: VocabularyEntry[];
  onWordCorrect: (word: string) => void;
  onWordIncorrect: (word: string) => void;
}

/**
 * Repaso espaciado del día: preguntas generadas localmente desde el glosario
 * del alumno (sin IA, sin red). Las palabras vencidas vuelven a la rotación.
 */
export const DailyReview: React.FC<Props> = ({ glossary, onWordCorrect, onWordIncorrect }) => {
  const [questions] = useState<ReviewQuestion[]>(() => buildReviewQuestions(glossary));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return null;

  const current = questions[index];
  const isCorrect = selected !== null && selected === current.answer;

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === current.answer) {
      setCorrectCount(prev => prev + 1);
      onWordCorrect(current.word);
    } else {
      onWordIncorrect(current.word);
    }
  };

  const handleNext = () => {
    if (index < questions.length - 1) {
      setIndex(prev => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm mb-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="text-emerald-600" size={32} />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Repaso completado</h2>
        <p className="text-zinc-500">
          Acertaste <strong className="text-zinc-900">{correctCount}</strong> de {questions.length} palabras.
          {correctCount < questions.length && ' Las que fallaste volverán a aparecer pronto.'}
        </p>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="bg-gradient-to-r from-orange-50 to-white p-6 rounded-2xl border-2 border-orange-200 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F57C00] rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <Brain size={26} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Repaso del día</h2>
              <p className="text-sm text-zinc-500">
                Tienes <strong className="text-[#F57C00]">{questions.length}</strong> palabra{questions.length !== 1 ? 's' : ''} de semanas anteriores pendiente{questions.length !== 1 ? 's' : ''} de repasar.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#F57C00] hover:bg-[#E65100] text-white font-bold rounded-xl transition-all shadow-md shadow-orange-200 whitespace-nowrap"
          >
            Comenzar
            <ChevronRight size={18} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-2xl border-2 border-orange-200 shadow-sm mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-[#F57C00]">
          <Brain size={20} />
          <span className="text-xs font-bold uppercase tracking-widest">Repaso del día</span>
        </div>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          {index + 1} / {questions.length}
        </span>
      </div>

      <p className="text-lg font-bold mb-6 text-zinc-900">{current.question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            disabled={selected !== null}
            className={`
              w-full p-4 rounded-xl text-left font-bold transition-all duration-200 border
              ${selected === option
                ? (isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700')
                : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100 hover:border-zinc-200'}
              ${selected !== null && option === current.answer && !isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : ''}
            `}
          >
            <div className="flex justify-between items-center">
              <span>{option}</span>
              {selected === option && (
                isCorrect ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className={`mt-6 p-4 rounded-xl text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <p className="font-bold">
            {isCorrect
              ? '¡Correcto!'
              : <>Incorrecto. La respuesta era: <span className="underline">{current.answer}</span></>}
          </p>
          <p className={`mt-2 font-medium p-3 rounded-lg bg-white/70 border ${isCorrect ? 'border-emerald-100 text-emerald-800' : 'border-red-100 text-red-800'}`}>
            <span className="font-mono font-bold">{current.word}</span> = {current.meaning}.
            <span className="italic"> Example: "{current.example}"</span>
          </p>
          <button
            onClick={handleNext}
            className={`mt-3 w-full py-3 text-white font-bold rounded-xl transition-colors ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {index < questions.length - 1 ? 'Siguiente' : 'Finalizar repaso'}
          </button>
        </div>
      )}
    </section>
  );
};
