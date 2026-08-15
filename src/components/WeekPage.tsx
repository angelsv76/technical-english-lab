import React, { useState, useEffect } from 'react';
import { ChevronLeft, Book, PlayCircle, ClipboardList, Download, AlertCircle, CheckCircle2, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { WeekData, Student, WeekProgress, VocabularyEntry, Question } from '../types';
import { SimulationRenderer } from './SimulationRenderer';
import { getSimulationById } from '../data/simulations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { shuffleArray } from '../utils/helpers';
import { generateActivities, GeneratedActivities } from '../services/aiActivityGenerator';
import { SimulationCard } from './SimulationCard';
import { PracticeCard } from './PracticeCard';
import { ReinforcementCard } from './ReinforcementCard';
import { generateReinforcementActivity, ReinforcementActivity } from '../services/reinforcementService';
import { VocabularyAudio } from './VocabularyAudio';
import { ExampleSentence } from './ExampleSentence';

interface Props {
  weekData: WeekData;
  student: Student;
  progress: WeekProgress | undefined;
  glossary: VocabularyEntry[];
  onBack: () => void;
  onComplete: (
    score: number,
    answers?: { question: string; answer: string }[]
  ) => Promise<{ ok: boolean; score: number; verificationCode: string | null }> | void;
  onWordCorrect: (word: string) => void;
  onWordIncorrect: (word: string) => void;
}

import { generatePDFReport } from '../utils/report';

export const WeekPage: React.FC<Props> = ({
  weekData,
  student,
  progress,
  glossary,
  onBack,
  onComplete,
  onWordCorrect,
  onWordIncorrect
}) => {
  const [activeTab, setActiveTab] = useState<'study' | 'simulation' | 'practice' | 'evaluation'>('study');
  const [evalStep, setEvalStep] = useState<'start' | 'quiz' | 'result'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [aiActivities, setAiActivities] = useState<Record<string, GeneratedActivities>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [reinforcementQueue, setReinforcementQueue] = useState<ReinforcementActivity[]>([]);
  const [isGeneratingReinforcement, setIsGeneratingReinforcement] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(weekData.evaluation);
  const simulation = getSimulationById(weekData.simulation.simulationId);

  useEffect(() => {
    const loadActivities = async () => {
      // Check if we already have activities for this week in localStorage
      // v2: schema includes `explanation` — old cache entries lack it, so use a new key
      const cacheKey = `ai_activities_week_${weekData.week}_v2`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        setAiActivities(JSON.parse(cached));
        return;
      }

      setIsGenerating(true);
      try {
        const generated = await generateActivities(weekData.vocabulary);
        setAiActivities(generated);
        localStorage.setItem(cacheKey, JSON.stringify(generated));
      } catch (error) {
        console.error("Failed to generate AI activities:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    loadActivities();
  }, [weekData.week, weekData.vocabulary]);

  const handleStartEval = () => {
    const shuffled = shuffleArray(weekData.evaluation).map((q: Question) => ({
      ...q,
      options: shuffleArray(q.options)
    }));
    setShuffledQuestions(shuffled);
    setEvalStep('quiz');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionIndex: number, answer: string) => {
    const questionId = `q_${questionIndex}`;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Check if correct to update glossary mastery
    const question = shuffledQuestions[questionIndex];
    if (question) {
      const vocabWord = weekData.vocabulary.find(v => 
        question.question.toLowerCase().includes(v.word.toLowerCase()) || 
        v.meaning === answer ||
        v.meaning === question.answer
      );

      if (answer === question.answer) {
        if (vocabWord) {
          onWordCorrect(vocabWord.word);
        }
      } else {
        if (vocabWord) {
          onWordIncorrect(vocabWord.word);
          handleReinforcement(vocabWord.word);
        }
      }
    }

    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleReinforcement = async (word: string) => {
    const entry = glossary.find(e => e.word === word);
    if (!entry || entry.mastered) return;

    setIsGeneratingReinforcement(true);
    try {
      const activity = await generateReinforcementActivity(entry);
      if (activity) {
        setReinforcementQueue(prev => [...prev, activity]);
      }
    } catch (error) {
      console.error("Error generating reinforcement:", error);
    } finally {
      setIsGeneratingReinforcement(false);
    }
  };

  const handleGeneratePDF = () => {
    generatePDFReport(
      student,
      weekData.week,
      score,
      Math.max(score, progress?.bestScore || 0),
      score >= 70 ? 'Passed' : 'Not Passed',
      verificationCode
    );
  };

  const saveScore = async (finalScore: number) => {
    setSaveStatus('saving');
    try {
      // Enviar las respuestas: el servidor recalcula la nota (fuente autoritativa)
      const answered = shuffledQuestions.map((q, idx) => ({
        question: q.question,
        answer: answers[`q_${idx}`] ?? ''
      }));
      const result = await onComplete(finalScore, answered);
      if (result && typeof result === 'object') {
        if (!result.ok) {
          setSaveStatus('error');
          return;
        }
        // La nota oficial es la del servidor
        if (typeof result.score === 'number') setScore(result.score);
        setVerificationCode(result.verificationCode);
        setSaveStatus('saved');
      } else {
        setSaveStatus('saved');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  // Fix for the last question score calculation
  useEffect(() => {
    if (evalStep === 'quiz' && Object.keys(answers).length === shuffledQuestions.length) {
      let correctCount = 0;
      shuffledQuestions.forEach((q, idx) => {
        if (answers[`q_${idx}`] === q.answer) {
          correctCount++;
        }
      });
      const finalScore = Math.round((correctCount / shuffledQuestions.length) * 100);
      setScore(finalScore);
      setEvalStep('result');
      saveScore(finalScore);
    }
  }, [answers, evalStep, shuffledQuestions]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Semana {weekData.week}: {weekData.title}</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Módulo de Aprendizaje</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-zinc-200 mb-8 shadow-sm">
          <TabButton 
            active={activeTab === 'study'} 
            onClick={() => setActiveTab('study')}
            icon={<Book size={18} />}
            label="Estudio"
          />
          <TabButton 
            active={activeTab === 'simulation'} 
            onClick={() => setActiveTab('simulation')}
            icon={<PlayCircle size={18} />}
            label="Simulación"
          />
          <TabButton 
            active={activeTab === 'practice'} 
            onClick={() => setActiveTab('practice')}
            icon={<CheckCircle2 size={18} />}
            label="Práctica"
          />
          <TabButton 
            active={activeTab === 'evaluation'} 
            onClick={() => setActiveTab('evaluation')}
            icon={<ClipboardList size={18} />}
            label="Evaluación"
          />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'study' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm mb-8">
                <h2 className="text-xl font-bold text-zinc-900 mb-4">Objetivo</h2>
                <p className="text-zinc-600 leading-relaxed">{weekData.objective}</p>
                
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">Introducción</h2>
                  <p className="text-zinc-600 leading-relaxed">{weekData.introText}</p>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-bold text-zinc-900 mb-4">Keywords</h2>
                  <div className="flex flex-wrap gap-2">
                    {weekData.keywords.map(kw => (
                      <span key={kw} className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-lg font-mono text-sm border border-zinc-200">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 mb-6">Vocabulario de la semana</h2>

                <div className="space-y-8">
                  {weekData.vocabulary.map(item => (
                    <div key={item.word} className="p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-[#F57C00] font-mono">{item.word}</span>
                            <span className="text-[10px] uppercase tracking-widest bg-zinc-200 px-2 py-1 rounded-lg text-zinc-600 font-bold">{item.context}</span>
                          </div>
                          <VocabularyAudio 
                            word={item.word}
                            phonetic={item.phonetic}
                            audioUrl={item.audioUrl}
                          />
                        </div>
                      </div>
                      <p className="text-lg font-medium text-zinc-800 mb-2">{item.meaning}</p>
                      <ExampleSentence example={item.example} word={item.word} week={weekData.week} />
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 items-center">
                  <AlertCircle className="text-[#F57C00]" size={20} />
                  <p className="text-sm text-orange-800">
                    Estas palabras se han agregado automáticamente a tu <strong>Glosario Personal</strong>.
                  </p>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'simulation' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900">Laboratorio de Simulación</h2>
                <p className="text-zinc-500">Explora simulaciones interactivas para cada término técnico.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {weekData.vocabulary.map(item => (
                  <SimulationCard 
                    key={item.word} 
                    word={item.word}
                    meaning={item.meaning}
                    example={item.example}
                    context={item.context}
                    initialSimulation={aiActivities[item.word]?.simulation} 
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900">Práctica Interactiva</h2>
                  <p className="text-zinc-500">Ejercicios dinámicos con reformulación inteligente.</p>
                </div>
                {isGeneratingReinforcement && (
                  <div className="flex items-center gap-2 text-orange-600 animate-pulse mb-1">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-bold uppercase">Generando Refuerzo...</span>
                  </div>
                )}
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {weekData.vocabulary.map(item => (
                    <PracticeCard 
                      key={item.word} 
                      word={item.word}
                      context={item.context}
                      initialPractice={aiActivities[item.word]?.practice} 
                    />
                  ))}
                </div>

                {reinforcementQueue.length > 0 && (
                  <div className="pt-8 border-t border-zinc-200">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="text-orange-500" size={24} />
                      <h3 className="text-xl font-bold text-zinc-900">Actividades de Refuerzo Personalizadas</h3>
                    </div>
                    <div className="space-y-6">
                      {reinforcementQueue.map((activity, idx) => (
                        <ReinforcementCard 
                          key={`${activity.word}-${idx}`} 
                          activity={activity} 
                          onCorrect={() => onWordCorrect(activity.word)}
                          onIncorrect={() => onWordIncorrect(activity.word)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {evalStep === 'start' && (
                <div className="bg-white p-12 rounded-3xl border border-zinc-200 shadow-xl text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClipboardList className="text-[#F57C00]" size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-zinc-900 mb-4">Evaluación Semanal</h2>
                  <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                    Responde las {shuffledQuestions.length} preguntas para medir tu progreso. 
                    Necesitas al menos 70 puntos para aprobar.
                  </p>
                  
                  {progress && (
                    <div className="mb-8 p-4 bg-zinc-50 rounded-2xl inline-flex gap-8 text-sm">
                      <div>
                        <p className="text-zinc-400 uppercase text-[10px] font-bold">Mejor Nota</p>
                        <p className="text-xl font-bold text-zinc-900">{progress.bestScore}%</p>
                      </div>
                      <div className="border-l border-zinc-200 pl-8">
                        <p className="text-zinc-400 uppercase text-[10px] font-bold">Intentos</p>
                        <p className="text-xl font-bold text-zinc-900">{progress.attempts}</p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleStartEval}
                    className="w-full max-w-xs bg-[#F57C00] hover:bg-[#E65100] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200"
                  >
                    Comenzar Evaluación
                  </button>
                </div>
              )}

              {evalStep === 'quiz' && (
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                      Pregunta {currentQuestion + 1} de {shuffledQuestions.length}
                    </span>
                    <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#F57C00] h-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 mb-8">
                    {shuffledQuestions[currentQuestion].question}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {shuffledQuestions[currentQuestion].options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleAnswer(currentQuestion, option)}
                        className="p-5 text-left rounded-2xl border-2 border-zinc-100 hover:border-[#F57C00] hover:bg-orange-50 transition-all font-medium text-zinc-700"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {evalStep === 'result' && (
                <div className="bg-white p-12 rounded-3xl border border-zinc-200 shadow-xl text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${score >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {score >= 70 ? <CheckCircle2 size={56} /> : <AlertCircle size={56} />}
                  </div>
                  
                  <h2 className="text-4xl font-black text-zinc-900 mb-2">{score}%</h2>
                  <p className={`text-xl font-bold mb-4 ${score >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {score >= 70 ? '¡APROBADO!' : 'NO APROBADO'}
                  </p>

                  {/* Estado del guardado — un fallo silencioso ya costó 2 meses de datos */}
                  <div className="mb-8">
                    {saveStatus === 'saving' && (
                      <p className="text-sm text-zinc-400 flex items-center justify-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Guardando tu nota...
                      </p>
                    )}
                    {saveStatus === 'saved' && (
                      <p className="text-sm text-emerald-600 font-bold">✓ Nota guardada correctamente</p>
                    )}
                    {saveStatus === 'error' && (
                      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
                        <p className="text-sm font-bold text-red-700 mb-3">
                          ⚠ TU NOTA NO SE GUARDÓ. Revisa tu conexión a internet y vuelve a intentarlo.
                          Si el problema continúa, avísale a tu profesor.
                        </p>
                        <button
                          onClick={() => saveScore(score)}
                          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
                        >
                          Reintentar guardado
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-zinc-50 rounded-2xl">
                      <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Intento Actual</p>
                      <p className="text-2xl font-bold text-zinc-900">{score}</p>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl">
                      <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Mejor Nota</p>
                      <p className="text-2xl font-bold text-zinc-900">{progress?.bestScore || score}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleStartEval}
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all"
                    >
                      <RotateCcw size={20} />
                      Repetir Evaluación
                    </button>
                    <button 
                      onClick={handleGeneratePDF}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#F57C00] hover:bg-[#E65100] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-200"
                    >
                      <Download size={20} />
                      Descargar Reporte
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`
      flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold transition-all
      ${active ? 'bg-[#F57C00] text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}
    `}
  >
    {icon}
    <span>{label}</span>
  </button>
);
