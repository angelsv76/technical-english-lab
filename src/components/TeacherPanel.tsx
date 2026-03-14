import React, { useState } from 'react';
import { Settings, Save, X, ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { WeekData, Question, VocabularyEntry } from '../types';
import { simulations } from '../data/simulations';

interface Props {
  weeks: WeekData[];
  onUpdateWeek: (week: number, data: Partial<WeekData>) => void;
  onToggleWeek: (week: number) => void;
  onClose: () => void;
  isFullPage?: boolean;
}

export const TeacherPanel: React.FC<Props> = ({ weeks, onUpdateWeek, onToggleWeek, onClose, isFullPage }) => {
  const [editingWeek, setEditingWeek] = useState<number | null>(null);

  const content = (
    <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isFullPage ? '' : 'max-h-[70vh]'}`}>
      {weeks.map(week => (
        <div key={week.week} className="border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="p-4 bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 bg-zinc-200 rounded-lg flex items-center justify-center font-bold text-zinc-600">
                {week.week}
              </span>
              <div>
                <h3 className="font-bold text-zinc-900">{week.title}</h3>
                <p className="text-xs text-zinc-500">{week.vocabulary.length} palabras | {week.evaluation.length} preguntas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 mr-4">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${week.active ? 'text-emerald-500' : 'text-zinc-400'}`}>
                  {week.active ? 'Activa' : 'Inactiva'}
                </span>
                <button 
                  onClick={() => onToggleWeek(week.week)}
                  className={`
                    relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none
                    ${week.active ? 'bg-emerald-500' : 'bg-zinc-300'}
                  `}
                >
                  <div className={`
                    absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-200
                    ${week.active ? 'translate-x-5' : 'translate-x-0'}
                  `} />
                </button>
              </div>
              
              <button 
                onClick={() => setEditingWeek(editingWeek === week.week ? null : week.week)}
                className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors"
              >
                {editingWeek === week.week ? 'Cerrar Editor' : 'Editar Contenido'}
              </button>
            </div>
          </div>

          {editingWeek === week.week && (
            <div className="p-6 border-t border-zinc-200 bg-white animate-in slide-in-from-top-2 duration-300">
              <WeekEditor 
                week={week} 
                onSave={(data) => onUpdateWeek(week.week, data)} 
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-[#F57C00] text-white">
          <div className="flex items-center gap-2">
            <Settings size={24} />
            <h2 className="text-xl font-bold">Panel del Docente - Gestión de Contenido</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        {content}
      </div>
    </div>
  );
};

const WeekEditor = ({ week, onSave }: { week: WeekData, onSave: (data: Partial<WeekData>) => void }) => {
  const [formData, setFormData] = useState<WeekData>(week);

  const handleChange = (field: keyof WeekData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVocabChange = (index: number, field: string, value: string) => {
    const newVocab = [...formData.vocabulary];
    newVocab[index] = { ...newVocab[index], [field]: value };
    handleChange('vocabulary', newVocab);
  };

  const handleQuestionChange = (type: 'practice' | 'evaluation', index: number, field: string, value: any) => {
    const newQuestions = [...formData[type]];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    handleChange(type, newQuestions);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Título de la Semana</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={e => handleChange('title', e.target.value)}
            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#F57C00] outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Disponible desde</label>
          <input 
            type="date" 
            value={formData.availableFrom || ''} 
            onChange={e => handleChange('availableFrom', e.target.value)}
            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#F57C00] outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Disponible hasta</label>
          <input 
            type="date" 
            value={formData.availableUntil || ''} 
            onChange={e => handleChange('availableUntil', e.target.value)}
            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#F57C00] outline-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase">Objetivo Pedagógico</label>
        <input 
          type="text" 
          value={formData.objective} 
          onChange={e => handleChange('objective', e.target.value)}
          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#F57C00] outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase">Texto de Introducción</label>
        <textarea 
          value={formData.introText} 
          onChange={e => handleChange('introText', e.target.value)}
          rows={3}
          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#F57C00] outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase">Simulación Asignada</label>
        <select 
          value={formData.simulation.simulationId}
          onChange={e => handleChange('simulation', { simulationId: e.target.value })}
          className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#F57C00] outline-none"
        >
          {simulations.map(sim => (
            <option key={sim.simulationId} value={sim.simulationId}>
              {sim.simulationId} - {sim.type}: {sim.instruction.substring(0, 50)}...
            </option>
          ))}
        </select>
      </div>

      {/* Vocabulary Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-zinc-900">Vocabulario</h4>
          <button 
            onClick={() => handleChange('vocabulary', [...formData.vocabulary, { word: '', meaning: '', example: '', context: '' }])}
            className="flex items-center gap-1 text-sm text-[#F57C00] font-bold hover:underline"
          >
            <Plus size={16} /> Añadir Palabra
          </button>
        </div>
        <div className="space-y-3">
          {formData.vocabulary.map((v, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <input placeholder="Palabra (EN)" value={v.word} onChange={e => handleVocabChange(i, 'word', e.target.value)} className="p-2 text-sm border border-zinc-200 rounded-lg" />
              <input placeholder="Significado (ES)" value={v.meaning} onChange={e => handleVocabChange(i, 'meaning', e.target.value)} className="p-2 text-sm border border-zinc-200 rounded-lg" />
              <input placeholder="Ejemplo" value={v.example} onChange={e => handleVocabChange(i, 'example', e.target.value)} className="p-2 text-sm border border-zinc-200 rounded-lg" />
              <div className="flex gap-2">
                <input placeholder="Contexto" value={v.context} onChange={e => handleVocabChange(i, 'context', e.target.value)} className="flex-1 p-2 text-sm border border-zinc-200 rounded-lg" />
                <button onClick={() => handleChange('vocabulary', formData.vocabulary.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-zinc-900">Evaluación</h4>
          <button 
            onClick={() => handleChange('evaluation', [...formData.evaluation, { question: '', options: ['', '', '', ''], answer: '' }])}
            className="flex items-center gap-1 text-sm text-[#F57C00] font-bold hover:underline"
          >
            <Plus size={16} /> Añadir Pregunta
          </button>
        </div>
        <div className="space-y-4">
          {formData.evaluation.map((q, i) => (
            <div key={i} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 space-y-3">
              <div className="flex gap-2">
                <input 
                  placeholder="Pregunta" 
                  value={q.question} 
                  onChange={e => handleQuestionChange('evaluation', i, 'question', e.target.value)} 
                  className="flex-1 p-2 text-sm border border-zinc-200 rounded-lg" 
                />
                <button onClick={() => handleChange('evaluation', formData.evaluation.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, optIdx) => (
                  <input 
                    key={optIdx}
                    placeholder={`Opción ${optIdx + 1}`} 
                    value={opt} 
                    onChange={e => {
                      const newOpts = [...q.options];
                      newOpts[optIdx] = e.target.value;
                      handleQuestionChange('evaluation', i, 'options', newOpts);
                    }} 
                    className="p-2 text-sm border border-zinc-200 rounded-lg" 
                  />
                ))}
              </div>
              <input 
                placeholder="Respuesta Correcta (debe coincidir con una opción)" 
                value={q.answer} 
                onChange={e => handleQuestionChange('evaluation', i, 'answer', e.target.value)} 
                className="w-full p-2 text-sm border border-zinc-200 rounded-lg bg-emerald-50" 
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
        <button 
          onClick={() => onSave(formData)}
          className="flex items-center gap-2 px-6 py-3 bg-[#F57C00] text-white font-bold rounded-xl hover:bg-[#E65100] transition-colors"
        >
          <Save size={20} /> Guardar Cambios
        </button>
      </div>
    </div>
  );
};
