import { useState, useEffect } from 'react';
import { WeekData } from '../types';
import { weeks as defaultWeeks } from '../data/weeks/index';
import { courseConfigService } from '../services/courseConfigService';
import { cargarSemanas } from '../services/leccionesService';
import { MODO_LOCAL } from '../lib/supabase';

/**
 * Versión nube: el contenido de las semanas vive en el código (src/data/weeks).
 * Versión local: viene de las lecciones por bloques que edita el docente (servidor SQLite).
 * En ambas, lo único que cambia en runtime es qué semanas están activas (course_config).
 *
 * `usuario` identifica la sesión: en la versión local las lecciones se piden al servidor,
 * así que hay que volver a cargarlas cuando alguien inicia sesión. `null` = nadie todavía.
 */
export const useWeeks = (usuario: string | null = 'sesion') => {
  const [weeks, setWeeks] = useState<WeekData[]>(
    MODO_LOCAL ? [] : defaultWeeks.map(w => ({ ...w, active: w.active ?? true }))
  );
  const [cargando, setCargando] = useState(MODO_LOCAL && usuario !== null);

  useEffect(() => {
    if (MODO_LOCAL && usuario === null) { setWeeks([]); setCargando(false); return; }
    let cancelled = false;
    setCargando(MODO_LOCAL);
    (async () => {
      let base: WeekData[];
      try { base = await cargarSemanas(); }
      catch (error) {
        console.error('No se pudieron cargar las lecciones:', error);
        base = MODO_LOCAL ? [] : defaultWeeks;
      }
      const configs = await courseConfigService.fetchConfigs();
      if (cancelled) return;
      setWeeks(base.map(w => ({ ...w, active: configs[w.week] ?? w.active ?? true })));
      setCargando(false);
    })();
    return () => { cancelled = true; };
  }, [usuario]);

  /** Devuelve true si el cambio quedó guardado. */
  const toggleWeek = async (weekNumber: number): Promise<boolean> => {
    const target = weeks.find(w => w.week === weekNumber);
    if (!target) return false;
    const newActive = !target.active;

    // Optimista: aplicar ya, revertir si falla
    setWeeks(prev => prev.map(w => w.week === weekNumber ? { ...w, active: newActive } : w));
    const ok = await courseConfigService.setWeekActive(weekNumber, newActive);
    if (!ok) {
      setWeeks(prev => prev.map(w => w.week === weekNumber ? { ...w, active: !newActive } : w));
    }
    return ok;
  };

  return { weeks, toggleWeek, cargando };
};
