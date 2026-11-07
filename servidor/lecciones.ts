// Lecciones por bloques: validación, copia inicial de las semanas del código,
// lectura (con claves de evaluación ocultas para el alumno) y versiones.
//
// Lo que llega del editor es texto sin formato: nunca se guarda HTML, así que
// no hay forma de inyectar código en la pantalla del alumno.
import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { enTransaccion } from './db.ts';

export const SEMANA_MIN = 1;
export const SEMANA_MAX = 40;
const MAX_VERSIONES = 20;

export interface Pregunta { question: string; options: string[]; answer: string; explanation?: string }
export interface ItemVocabulario {
  word: string; meaning: string; example: string; context?: string;
  phonetic?: string; audio?: string; audioEjemplo?: string;
}
export type Bloque = { id: string; titulo?: string } & (
  | { type: 'texto'; texto: string }
  | { type: 'imagen'; src: string; alt?: string; pie?: string }
  | { type: 'video'; src?: string; youtube?: string }
  | { type: 'audio'; src: string }
  | { type: 'pdf'; src: string }
  | { type: 'vocabulario'; items: ItemVocabulario[] }
  | { type: 'practica'; preguntas: Pregunta[] }
  | { type: 'evaluacion'; preguntas: Pregunta[] }
  | { type: 'simulacion'; simulationId: string }
);
export interface Leccion {
  week: number; title: string; objective: string; keywords: string[];
  status: 'draft' | 'published'; blocks: Bloque[]; updated_at?: string;
}

class Invalido extends Error {}
const falla = (mensaje: string): never => { throw new Invalido(mensaje); };

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function texto(v: unknown, campo: string, max: number, obligatorio = false): string {
  if (v === undefined || v === null || v === '') {
    if (obligatorio) falla(`${campo} es obligatorio.`);
    return '';
  }
  if (typeof v !== 'string') falla(`${campo} debe ser texto.`);
  const limpio = (v as string).replace(/\r\n/g, '\n').replace(CONTROL, '').trim();
  if (obligatorio && !limpio) falla(`${campo} es obligatorio.`);
  if (limpio.length > max) falla(`${campo} es demasiado largo (máximo ${max} caracteres).`);
  return limpio;
}

/** Ruta de un archivo ya subido (/medios) o de los audios del curso (/audio). */
function ruta(v: unknown, campo: string, obligatorio = false): string {
  const t = texto(v, campo, 220, obligatorio);
  if (!t) return '';
  if (!/^\/(medios|audio)\/[A-Za-z0-9._\-/]+$/.test(t) || t.includes('..') || t.includes('//')) {
    falla(`${campo} no es una ruta de archivo válida.`);
  }
  return t;
}

function idYoutube(v: unknown): string {
  const t = texto(v, 'El enlace de YouTube', 200);
  if (!t) return '';
  const m = t.match(/^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/)
    ?? t.match(/^([A-Za-z0-9_-]{11})$/);
  if (!m) falla('El enlace de YouTube no es válido.');
  return m![1];
}

function lista(v: unknown, campo: string, min: number, max: number): unknown[] {
  if (!Array.isArray(v)) falla(`${campo} debe ser una lista.`);
  const a = v as unknown[];
  if (a.length < min) falla(min === 1 ? `${campo}: agrega al menos uno.` : `${campo}: faltan elementos.`);
  if (a.length > max) falla(`${campo}: máximo ${max}.`);
  return a;
}

function objeto(v: unknown, campo: string): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) falla(`${campo} no es válido.`);
  return v as Record<string, unknown>;
}

function preguntas(v: unknown, campo: string): Pregunta[] {
  return lista(v, campo, 1, 60).map((p, i) => {
    const q = objeto(p, `${campo} ${i + 1}`);
    const etiqueta = `${campo}, pregunta ${i + 1}`;
    const options = lista(q.options, `${etiqueta}: opciones`, 2, 6).map((o, j) => texto(o, `${etiqueta}: opción ${j + 1}`, 200, true));
    if (new Set(options).size !== options.length) falla(`${etiqueta}: hay opciones repetidas.`);
    const answer = texto(q.answer, `${etiqueta}: respuesta correcta`, 200, true);
    if (!options.includes(answer)) falla(`${etiqueta}: la respuesta correcta debe ser una de las opciones.`);
    const explanation = texto(q.explanation, `${etiqueta}: explicación`, 1000);
    return { question: texto(q.question, `${etiqueta}: enunciado`, 500, true), options, answer, ...(explanation ? { explanation } : {}) };
  });
}

function bloque(v: unknown, i: number): Bloque {
  const b = objeto(v, `Bloque ${i + 1}`);
  const id = typeof b.id === 'string' && /^[A-Za-z0-9-]{1,40}$/.test(b.id) ? b.id : randomUUID();
  const titulo = texto(b.titulo, `Bloque ${i + 1}: título`, 120);
  const base = { id, ...(titulo ? { titulo } : {}) };
  const et = `Bloque ${i + 1}`;
  switch (b.type) {
    case 'texto': return { ...base, type: 'texto', texto: texto(b.texto, `${et}: texto`, 20000, true) };
    case 'imagen': {
      const alt = texto(b.alt, `${et}: descripción de la imagen`, 300);
      const pie = texto(b.pie, `${et}: pie de imagen`, 300);
      return { ...base, type: 'imagen', src: ruta(b.src, `${et}: imagen`, true), ...(alt ? { alt } : {}), ...(pie ? { pie } : {}) };
    }
    case 'video': {
      const src = ruta(b.src, `${et}: video`);
      const youtube = idYoutube(b.youtube);
      if (!src && !youtube) falla(`${et}: sube un video o pega un enlace de YouTube.`);
      return { ...base, type: 'video', ...(src ? { src } : {}), ...(youtube ? { youtube } : {}) };
    }
    case 'audio': return { ...base, type: 'audio', src: ruta(b.src, `${et}: audio`, true) };
    case 'pdf': return { ...base, type: 'pdf', src: ruta(b.src, `${et}: documento`, true) };
    case 'vocabulario': {
      const items = lista(b.items, `${et}: vocabulario`, 1, 60).map((it, j) => {
        const x = objeto(it, `${et}: palabra ${j + 1}`);
        const e = `${et}, palabra ${j + 1}`;
        const salida: ItemVocabulario = {
          word: texto(x.word, `${e}: palabra`, 80, true),
          meaning: texto(x.meaning, `${e}: significado`, 300, true),
          example: texto(x.example, `${e}: ejemplo`, 300, true)
        };
        const contexto = texto(x.context, `${e}: contexto`, 80);
        const fonetica = texto(x.phonetic, `${e}: fonética`, 80);
        const audio = ruta(x.audio, `${e}: audio`);
        const audioEjemplo = ruta(x.audioEjemplo, `${e}: audio del ejemplo`);
        if (contexto) salida.context = contexto;
        if (fonetica) salida.phonetic = fonetica;
        if (audio) salida.audio = audio;
        if (audioEjemplo) salida.audioEjemplo = audioEjemplo;
        return salida;
      });
      return { ...base, type: 'vocabulario', items };
    }
    case 'practica': return { ...base, type: 'practica', preguntas: preguntas(b.preguntas, `${et}: práctica`) };
    case 'evaluacion': return { ...base, type: 'evaluacion', preguntas: preguntas(b.preguntas, `${et}: evaluación`) };
    case 'simulacion': {
      const sim = texto(b.simulationId, `${et}: simulación`, 12, true);
      if (!/^SIM-\d{1,4}$/.test(sim)) falla(`${et}: el código de la simulación debe verse como SIM-011.`);
      return { ...base, type: 'simulacion', simulationId: sim };
    }
    default: return falla(`${et}: tipo de bloque desconocido.`);
  }
}

export function validarLeccion(entrada: unknown, week: number): { ok: boolean; valor?: Leccion; error?: string } {
  try {
    if (!Number.isInteger(week) || week < SEMANA_MIN || week > SEMANA_MAX) falla('Semana no válida.');
    const e = objeto(entrada, 'La lección');
    const status = e.status === 'draft' ? 'draft' : e.status === 'published' ? 'published' : falla('El estado debe ser borrador o publicada.');
    const blocks = lista(e.blocks, 'Bloques', 0, 80).map(bloque);
    if (blocks.filter(b => b.type === 'evaluacion').length > 1) falla('Una lección solo puede tener un bloque de evaluación.');
    const ids = blocks.map(b => b.id);
    if (new Set(ids).size !== ids.length) falla('Hay bloques con el mismo identificador.');
    const keywords = (e.keywords === undefined ? [] : lista(e.keywords, 'Palabras clave', 0, 12)).map((k, i) => texto(k, `Palabra clave ${i + 1}`, 60, true));
    return {
      ok: true,
      valor: {
        week, status: status as Leccion['status'], blocks, keywords,
        title: texto(e.title, 'El título', 200, true),
        objective: texto(e.objective, 'El objetivo', 500)
      }
    };
  } catch (error) {
    if (error instanceof Invalido) return { ok: false, error: error.message };
    throw error;
  }
}

// ---------------------------------------------------------------------------

interface Fila { week_number: number; title: string; objective: string; keywords: string; status: string; blocks: string; updated_at: string }

const aLeccion = (f: Fila): Leccion => ({
  week: f.week_number, title: f.title, objective: f.objective, keywords: JSON.parse(f.keywords),
  status: f.status as Leccion['status'], blocks: JSON.parse(f.blocks), updated_at: f.updated_at
});

/** Al alumno no se le envían las respuestas correctas de la evaluación. */
function paraAlumno(l: Leccion): Leccion {
  return {
    ...l,
    blocks: l.blocks.map(b => b.type === 'evaluacion'
      ? { ...b, preguntas: b.preguntas.map(({ question, options }) => ({ question, options, answer: '' })) }
      : b)
  };
}

export function listarLecciones(db: DatabaseSync, comoDocente: boolean) {
  const filas = db.prepare(
    `SELECT week_number, title, objective, status, updated_at FROM lessons ${comoDocente ? '' : "WHERE status = 'published'"} ORDER BY week_number`
  ).all() as unknown as Omit<Fila, 'keywords' | 'blocks'>[];
  return filas.map(f => ({ week: f.week_number, title: f.title, objective: f.objective, status: f.status, updated_at: f.updated_at }));
}

export function leerLeccion(db: DatabaseSync, week: number, comoDocente: boolean): Leccion | null {
  const f = db.prepare('SELECT * FROM lessons WHERE week_number = ?').get(week) as unknown as Fila | undefined;
  if (!f) return null;
  if (!comoDocente && f.status !== 'published') return null;
  const l = aLeccion(f);
  return comoDocente ? l : paraAlumno(l);
}

/** Preguntas con su respuesta correcta, solo para calificar en el servidor. */
export function clavesEvaluacion(db: DatabaseSync, week: number): { question: string; answer: string }[] {
  const f = db.prepare('SELECT blocks FROM lessons WHERE week_number = ?').get(week) as { blocks: string } | undefined;
  if (!f) return [];
  const bloques = JSON.parse(f.blocks) as Bloque[];
  const ev = bloques.find(b => b.type === 'evaluacion');
  return ev && ev.type === 'evaluacion' ? ev.preguntas.map(p => ({ question: p.question, answer: p.answer })) : [];
}

export function guardarLeccion(db: DatabaseSync, l: Leccion, ahora: Date): void {
  enTransaccion(db, () => {
    const previa = db.prepare('SELECT * FROM lessons WHERE week_number = ?').get(l.week) as unknown as Fila | undefined;
    if (previa) {
      db.prepare(
        'INSERT INTO lesson_versions (week_number, title, objective, keywords, status, blocks, saved_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(previa.week_number, previa.title, previa.objective, previa.keywords, previa.status, previa.blocks, previa.updated_at);
      db.prepare(
        `DELETE FROM lesson_versions WHERE week_number = ? AND id NOT IN
           (SELECT id FROM lesson_versions WHERE week_number = ? ORDER BY id DESC LIMIT ?)`
      ).run(l.week, l.week, MAX_VERSIONES);
    }
    db.prepare(
      `INSERT INTO lessons (week_number, title, objective, keywords, status, blocks, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (week_number) DO UPDATE SET title = excluded.title, objective = excluded.objective, keywords = excluded.keywords,
         status = excluded.status, blocks = excluded.blocks, updated_at = excluded.updated_at`
    ).run(l.week, l.title, l.objective, JSON.stringify(l.keywords), l.status, JSON.stringify(l.blocks), ahora.toISOString());
  });
}

export function listarVersiones(db: DatabaseSync, week: number) {
  return db.prepare(
    'SELECT id, title, status, saved_at FROM lesson_versions WHERE week_number = ? ORDER BY id DESC'
  ).all(week) as { id: number; title: string; status: string; saved_at: string }[];
}

export function leerVersion(db: DatabaseSync, week: number, id: number): Leccion | null {
  const f = db.prepare('SELECT * FROM lesson_versions WHERE week_number = ? AND id = ?').get(week, id) as unknown as
    (Omit<Fila, 'updated_at'> & { saved_at: string }) | undefined;
  return f ? aLeccion({ ...f, updated_at: f.saved_at }) : null;
}

// ---------------------------------------------------------------------------
// Copia inicial: las semanas que hoy viven en el código pasan a la base, una sola vez.

interface SemanaCodigo {
  week: number; title: string; objective: string; introText: string; keywords: string[];
  vocabulary: { word: string; meaning: string; example: string; context?: string; phonetic?: string; audioUrl?: string }[];
  simulation?: { simulationId: string };
  practice: Pregunta[]; evaluation: Pregunta[];
}

const slug = (palabra: string) => palabra.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function sembrarLecciones(db: DatabaseSync, semanas: SemanaCodigo[], dirAudio: string, ahora: Date): number {
  let nuevas = 0;
  for (const s of semanas) {
    if (db.prepare('SELECT 1 FROM lessons WHERE week_number = ?').get(s.week)) continue;
    const carpeta = `week${String(s.week).padStart(2, '0')}`;
    const audioDe = (url: string | undefined, palabra: string) => {
      const m = url?.match(/vocabulary-audio\/(week\d\d\/[A-Za-z0-9._-]+)$/);
      const archivo = m ? m[1] : null;
      return archivo && existsSync(join(dirAudio, archivo)) ? `/audio/${archivo}` : undefined;
    };
    const bloques: Bloque[] = [];
    if (s.introText?.trim()) bloques.push({ id: randomUUID(), type: 'texto', titulo: 'Introducción', texto: s.introText.trim() });
    if (s.vocabulary?.length) {
      bloques.push({
        id: randomUUID(), type: 'vocabulario', titulo: 'Vocabulario',
        items: s.vocabulary.map(v => {
          const ejemplo = `${carpeta}/${slug(v.word)}_example.mp3`;
          const item: ItemVocabulario = { word: v.word, meaning: v.meaning, example: v.example };
          if (v.context) item.context = v.context;
          if (v.phonetic) item.phonetic = v.phonetic;
          const audio = audioDe(v.audioUrl, v.word);
          if (audio) item.audio = audio;
          if (existsSync(join(dirAudio, ejemplo))) item.audioEjemplo = `/audio/${ejemplo}`;
          return item;
        })
      });
    }
    if (s.simulation?.simulationId) bloques.push({ id: randomUUID(), type: 'simulacion', titulo: 'Simulación', simulationId: s.simulation.simulationId });
    if (s.practice?.length) bloques.push({ id: randomUUID(), type: 'practica', titulo: 'Práctica', preguntas: s.practice });
    if (s.evaluation?.length) bloques.push({ id: randomUUID(), type: 'evaluacion', titulo: 'Evaluación', preguntas: s.evaluation });

    db.prepare(
      `INSERT INTO lessons (week_number, title, objective, keywords, status, blocks, updated_at) VALUES (?, ?, ?, ?, 'published', ?, ?)`
    ).run(s.week, s.title, s.objective ?? '', JSON.stringify(s.keywords ?? []), JSON.stringify(bloques), ahora.toISOString());
    nuevas++;
  }
  return nuevas;
}
