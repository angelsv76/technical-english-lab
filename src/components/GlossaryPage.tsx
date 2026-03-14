import React, { useState } from 'react';
import { ChevronLeft, Search, Filter, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { VocabularyEntry } from '../types';

interface Props {
  glossary: VocabularyEntry[];
  onBack: () => void;
}

export const GlossaryPage: React.FC<Props> = ({ glossary, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');

  const filteredGlossary = glossary.filter(entry => {
    const matchesSearch = entry.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'mastered' && entry.mastered) ||
                         (filter === 'learning' && !entry.mastered);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Glosario Técnico Personal</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Tu diccionario de Software</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Buscar palabra o significado..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-[#F57C00] focus:border-transparent outline-none shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')} 
              label="Todas" 
            />
            <FilterButton 
              active={filter === 'mastered'} 
              onClick={() => setFilter('mastered')} 
              label="Dominadas" 
            />
            <FilterButton 
              active={filter === 'learning'} 
              onClick={() => setFilter('learning')} 
              label="En proceso" 
            />
          </div>
        </div>

        {/* Glossary Grid */}
        {filteredGlossary.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map((entry) => (
              <div 
                key={entry.word}
                className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#F57C00] font-mono">{entry.word}</h3>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-tighter">Semana {entry.weekIntroduced}</p>
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1
                    ${entry.mastered ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-[#F57C00]'}
                  `}>
                    {entry.mastered ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {entry.mastered ? 'DOMINADA' : 'EN PROCESO'}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{entry.meaning}</p>
                    <p className="text-xs text-zinc-500 italic mt-1">"{entry.example}"</p>
                  </div>
                  
                  <div className="pt-3 border-t border-zinc-50 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{entry.context}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div 
                          key={i}
                          className={`w-2 h-2 rounded-full ${i < entry.correctCount ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
            <BookOpen className="mx-auto text-zinc-300 mb-4" size={48} />
            <p className="text-zinc-500">No se encontraron palabras en tu glosario.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, label }: any) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-xl text-sm font-bold transition-all
      ${active ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50'}
    `}
  >
    {label}
  </button>
);
