import React, { useState } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { WeekData } from '../types';

interface Props {
  weeks: WeekData[];
  onToggleWeek: (week: number) => Promise<boolean>;
  isFullPage?: boolean;
}

/**
 * Gestión de contenido, versión honesta:
 * - El interruptor Activa/Inactiva SÍ se guarda en Supabase y lo ven los alumnos.
 * - El contenido (vocabulario, preguntas) se edita en el código fuente — el
 *   editor anterior guardaba solo en el navegador del docente y nunca llegaba
 *   a los alumnos, así que se eliminó.
 */
export const TeacherPanel: React.FC<Props> = ({ weeks, onToggleWeek, isFullPage }) => {
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (weekNumber: number) => {
    if (saving !== null) return;
    setSaving(weekNumber);
    setError(null);
    const ok = await onToggleWeek(weekNumber);
    if (!ok) {
      setError(`No se pudo guardar el cambio de la semana ${weekNumber}. Revisa tu conexión e intenta de nuevo.`);
    }
    setSaving(null);
  };

  return (
    <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${isFullPage ? '' : 'max-h-[70vh]'}`}>
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-start">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          El interruptor controla qué semanas ven los alumnos y se guarda para todo el curso.
          El <strong>contenido</strong> (vocabulario, preguntas, audios) se edita en el código
          fuente de la aplicación, no desde este panel.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm font-bold text-red-700">
          ⚠ {error}
        </div>
      )}

      {weeks.map(week => (
        <div key={week.week} className="border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="p-4 bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 bg-zinc-200 rounded-lg flex items-center justify-center font-bold text-zinc-600">
                {week.week}
              </span>
              <div>
                <h3 className="font-bold text-zinc-900">{week.title}</h3>
                <p className="text-xs text-zinc-500">
                  {week.vocabulary.length} palabras | {week.evaluation.length} preguntas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saving === week.week && <Loader2 size={14} className="animate-spin text-zinc-400" />}
              <span className={`text-[10px] font-bold uppercase tracking-wider ${week.active ? 'text-emerald-500' : 'text-zinc-400'}`}>
                {week.active ? 'Activa' : 'Inactiva'}
              </span>
              <button
                onClick={() => handleToggle(week.week)}
                disabled={saving !== null}
                className={`
                  relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50
                  ${week.active ? 'bg-emerald-500' : 'bg-zinc-300'}
                `}
              >
                <div className={`
                  absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform duration-200
                  ${week.active ? 'translate-x-5' : 'translate-x-0'}
                `} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
