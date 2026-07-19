/**
 * Configuración del curso (semanas activas/inactivas) persistida en Supabase,
 * compartida entre el docente y todos los alumnos.
 * Antes vivía en localStorage: cada navegador tenía su propia copia y los
 * cambios del docente jamás llegaban a los alumnos.
 */
import { supabase } from '../lib/supabase';

export const courseConfigService = {
  /** Mapa week_number → active. Vacío si la tabla no existe aún (todo activo). */
  async fetchConfigs(): Promise<Record<number, boolean>> {
    const { data, error } = await supabase
      .from('course_config')
      .select('week_number, active');
    if (error || !data) {
      if (error) console.warn('course_config no disponible:', error.message);
      return {};
    }
    return Object.fromEntries(data.map(r => [r.week_number, r.active]));
  },

  /** Devuelve true si se guardó correctamente. */
  async setWeekActive(weekNumber: number, active: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('course_config')
      .upsert(
        { week_number: weekNumber, active, updated_at: new Date().toISOString() },
        { onConflict: 'week_number' }
      );
    if (error) console.error('Error guardando course_config:', error.message);
    return !error;
  }
};
