import { useState, useEffect } from 'react';
import { WeekData } from '../types';
import { weeks as defaultWeeks } from '../data/weeks/index';
import { courseConfigService } from '../services/courseConfigService';

/**
 * El contenido de las semanas vive en el código (src/data/weeks) — fuente única
 * de verdad para docente y alumnos. Lo único configurable en runtime es qué
 * semanas están activas, y eso se comparte vía Supabase (course_config).
 *
 * Nota: antes existía un sistema de overrides en localStorage que hacía creer
 * al docente que editaba contenido, pero los alumnos nunca lo veían. Eliminado.
 */
export const useWeeks = () => {
  const [weeks, setWeeks] = useState<WeekData[]>(
    defaultWeeks.map(w => ({ ...w, active: w.active ?? true }))
  );

  useEffect(() => {
    let cancelled = false;
    courseConfigService.fetchConfigs().then(configs => {
      if (cancelled) return;
      setWeeks(defaultWeeks.map(w => ({
        ...w,
        active: configs[w.week] ?? w.active ?? true
      })));
    });
    return () => { cancelled = true; };
  }, []);

  /** Devuelve true si el cambio quedó guardado en Supabase. */
  const toggleWeek = async (weekNumber: number): Promise<boolean> => {
    const target = weeks.find(w => w.week === weekNumber);
    if (!target) return false;
    const newActive = !target.active;

    // Optimista: aplicar ya, revertir si Supabase falla
    setWeeks(prev => prev.map(w => w.week === weekNumber ? { ...w, active: newActive } : w));
    const ok = await courseConfigService.setWeekActive(weekNumber, newActive);
    if (!ok) {
      setWeeks(prev => prev.map(w => w.week === weekNumber ? { ...w, active: !newActive } : w));
    }
    return ok;
  };

  return { weeks, toggleWeek };
};
