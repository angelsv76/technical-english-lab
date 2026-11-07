/**
 * Lecciones por bloques (versión local): se leen del servidor y se convierten a la forma
 * `WeekData` que ya usa el resto de la app, así Dashboard, glosario y repaso no cambian.
 * En la versión nube las semanas siguen saliendo del código.
 */
import { supabase, MODO_LOCAL } from '../lib/supabase';
import { weeks as semanasDelCodigo } from '../data/weeks/index';
import type { Leccion, WeekData } from '../types';

let cache: WeekData[] | null = null;

/** Semanas ya cargadas (o las del código si todavía no se cargó nada). */
export const semanasActuales = (): WeekData[] => cache ?? semanasDelCodigo;

export function leccionAWeek(l: Leccion): WeekData {
  // La introducción es el primer bloque si es de texto; los demás textos se muestran como bloques.
  const intro = l.blocks[0]?.type === 'texto' ? l.blocks[0] : undefined;
  const vocabulario = l.blocks.flatMap(b => (b.type === 'vocabulario' ? b.items : []));
  const simulacion = l.blocks.find(b => b.type === 'simulacion');
  const practica = l.blocks.flatMap(b => (b.type === 'practica' ? b.preguntas : []));
  const evaluacion = l.blocks.flatMap(b => (b.type === 'evaluacion' ? b.preguntas : []));
  return {
    week: l.week,
    title: l.title,
    objective: l.objective,
    introText: intro && intro.type === 'texto' ? intro.texto : '',
    keywords: l.keywords,
    vocabulary: vocabulario.map(v => ({
      word: v.word, meaning: v.meaning, example: v.example, context: v.context ?? '',
      phonetic: v.phonetic, audioUrl: v.audio, audioEjemplo: v.audioEjemplo
    })),
    simulation: { simulationId: simulacion && simulacion.type === 'simulacion' ? simulacion.simulationId : '' },
    practice: practica,
    evaluation: evaluacion,
    active: true,
    blocks: l.blocks,
    servidorCalifica: evaluacion.length > 0 && evaluacion.every(q => !q.answer)
  };
}

/** Carga las lecciones que el usuario actual puede ver (alumno: publicadas; docente: todas). */
export async function cargarSemanas(): Promise<WeekData[]> {
  if (!MODO_LOCAL) return semanasDelCodigo;
  const sesion = (await supabase.auth.getSession()).data.session;
  const r = await fetch('/api/lecciones?completo=1', {
    headers: { Authorization: `Bearer ${sesion?.access_token ?? ''}` }
  });
  if (!r.ok) throw new Error(`No se pudieron cargar las lecciones (${r.status})`);
  const cuerpo = await r.json() as { lessons: Leccion[] };
  cache = cuerpo.lessons.map(leccionAWeek);
  return cache;
}
