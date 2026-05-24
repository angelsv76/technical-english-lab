import React from 'react';
import { BookOpen, CheckCircle, Trophy, List, LogOut, ChevronRight, Code, Lock, Clock, Home } from 'lucide-react';
import { Student, WeekProgress, VocabularyEntry, WeekData } from '../types';
import { courseScheduleService } from '../services/courseScheduleService';
import { useNavigate } from 'react-router-dom';

interface Props {
  student: Student;
  progress: WeekProgress[];
  glossary: VocabularyEntry[];
  weeks: WeekData[];
  onSelectWeek: (week: number) => void;
  onOpenGlossary: () => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<Props> = ({
  student,
  progress,
  glossary,
  weeks,
  onSelectWeek,
  onOpenGlossary,
  onLogout
}) => {
  const navigate = useNavigate();
  const completedWeeks = progress.filter(p => p.completed).length;
  const bestOverall = progress.length > 0 ? Math.max(...progress.map(p => p.bestScore)) : 0;
  const masteredCount = glossary.filter(g => g.mastered).length;

  // Filter inactive weeks - Problem 1
  const visibleWeeks = weeks.filter(w => w.active !== false);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F57C00] rounded-lg flex items-center justify-center text-white">
              <Code size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Inglés Técnico</h1>
              <p className="text-xs text-zinc-500 font-mono">SOFTWARE DEVELOPMENT - INTI</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all"
            >
              <Home size={18} />
              <span className="hidden sm:inline">Panel Principal</span>
            </button>

            <div className="flex items-center gap-3 border-l border-zinc-200 pl-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#F57C00] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {student.photo_url
                  ? <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                  : student.name?.charAt(0)
                }
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-zinc-900">{student.name}</p>
                <p className="text-xs text-zinc-500">NIE: {student.nie} | Grupo: {student.code}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<BookOpen className="text-blue-500" />}
            label="Semanas completadas"
            value={completedWeeks}
            total={40}
          />
          <StatCard 
            icon={<Trophy className="text-yellow-500" />}
            label="Mejor puntaje general"
            value={bestOverall}
            suffix="%"
          />
          <StatCard 
            icon={<List className="text-[#F57C00]" />}
            label="Glosario total"
            value={glossary.length}
            suffix=" palabras"
            onClick={onOpenGlossary}
          />
          <StatCard 
            icon={<CheckCircle className="text-emerald-500" />}
            label="Palabras dominadas"
            value={masteredCount}
            subValue={`${glossary.length - masteredCount} en proceso`}
          />
        </div>

        {/* Weeks Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <ChevronRight className="text-[#F57C00]" />
            Contenido del Curso
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleWeeks.map((weekData) => {
              const weekNum = weekData.week;
              const weekProgress = progress.find(p => p.week === weekNum);
              
              const { available, status } = courseScheduleService.isWeekAvailable(weekData);
              const statusMessage = courseScheduleService.getStatusMessage(status);

              return (
                <div 
                  key={weekNum}
                  onClick={() => available && onSelectWeek(weekNum)}
                  className={`
                    relative p-6 rounded-2xl border transition-all duration-300
                    ${available 
                      ? 'bg-white border-zinc-200 cursor-pointer hover:shadow-xl hover:-translate-y-1' 
                      : 'bg-zinc-100 border-zinc-200 opacity-60 cursor-not-allowed'}
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-bold font-mono
                      ${available ? 'bg-orange-100 text-[#F57C00]' : 'bg-zinc-200 text-zinc-500'}
                    `}>
                      WEEK {weekNum.toString().padStart(2, '0')}
                    </span>
                    {weekProgress?.completed ? (
                      <CheckCircle className="text-emerald-500" size={20} />
                    ) : !available && (
                      status === 'expired' ? <Lock className="text-red-400" size={18} /> : <Clock className="text-zinc-400" size={18} />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">
                    {weekData.title}
                  </h3>
                  
                  {statusMessage && (
                    <p className={`text-xs font-bold uppercase tracking-tighter ${status === 'expired' ? 'text-red-500' : 'text-zinc-400'}`}>
                      {statusMessage}
                    </p>
                  )}
                  
                  {available && (
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>Mejor nota:</span>
                        <span className="font-bold text-zinc-900">{weekProgress?.bestScore || 0}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#F57C00] h-full transition-all duration-500"
                          style={{ width: `${weekProgress?.bestScore || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 text-center">
        <p className="text-zinc-500 italic">
          “Interpretar el inglés técnico es una habilidad esencial para cualquier estudiante de Desarrollo de Software.”
        </p>
      </footer>
    </div>
  );
};

const StatCard = ({ icon, label, value, total, suffix = '', subValue, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-zinc-900">{value}</span>
          {total && <span className="text-zinc-400">/ {total}</span>}
          {suffix && <span className="text-sm font-medium text-zinc-500">{suffix}</span>}
        </div>
        {subValue && <p className="text-xs text-zinc-400 mt-1">{subValue}</p>}
      </div>
    </div>
  </div>
);
