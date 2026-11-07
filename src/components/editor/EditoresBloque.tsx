import React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { SubirArchivo } from './SubirArchivo';

/** Los bloques se editan como objetos sueltos; el servidor es quien valida su forma. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BloqueEditable = { id: string; type: string; titulo?: string } & Record<string, any>;

interface Props { bloque: BloqueEditable; cambiar: (parche: Record<string, unknown>) => void }

const campo = 'w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#F57C00]';
const etiqueta = 'block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1';

const Texto: React.FC<{ nombre: string; valor?: string; onChange: (v: string) => void; max?: number; placeholder?: string }> =
  ({ nombre, valor, onChange, max = 300, placeholder }) => (
    <label className="block">
      <span className={etiqueta}>{nombre}</span>
      <input className={campo} value={valor ?? ''} maxLength={max} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </label>
  );

const mover = <T,>(lista: T[], i: number, d: -1 | 1): T[] => {
  const j = i + d;
  if (j < 0 || j >= lista.length) return lista;
  const copia = [...lista];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
};

const BotonIcono: React.FC<{ onClick: () => void; titulo: string; deshabilitado?: boolean; peligro?: boolean; children: React.ReactNode }> =
  ({ onClick, titulo, deshabilitado, peligro, children }) => (
    <button type="button" onClick={onClick} disabled={deshabilitado} aria-label={titulo} title={titulo}
      className={`p-1.5 rounded-lg border border-zinc-200 bg-white disabled:opacity-30 ${peligro ? 'text-red-600 hover:bg-red-50' : 'text-zinc-600 hover:bg-zinc-50'}`}>
      {children}
    </button>
  );

/** Vista corta del archivo ya subido con opción de quitarlo. */
const Archivo: React.FC<{ tipo: 'imagen' | 'audio' | 'pdf' | 'video'; src?: string; onSubido: (s: string) => void; onQuitar: () => void; etiquetaBoton?: string }> =
  ({ tipo, src, onSubido, onQuitar, etiquetaBoton }) => (
    <div className="space-y-2">
      {src && tipo === 'imagen' && <img src={src} alt="" className="max-h-40 rounded-lg border border-zinc-200" />}
      {src && tipo === 'audio' && <audio src={src} controls className="w-full max-w-sm" />}
      {src && tipo === 'video' && <video src={src} controls preload="metadata" className="max-h-48 rounded-lg bg-black" />}
      {src && tipo === 'pdf' && <a href={src} target="_blank" rel="noopener noreferrer" className="text-sm text-[#F57C00] underline">Abrir el PDF subido</a>}
      <div className="flex flex-wrap items-center gap-2">
        <SubirArchivo tipo={tipo} etiqueta={etiquetaBoton ?? (src ? 'Cambiar archivo' : 'Subir archivo')} onSubido={onSubido} />
        {src && <button type="button" onClick={onQuitar} className="text-xs font-bold text-red-700 hover:underline">Quitar</button>}
        {src && <span className="text-xs text-zinc-400 font-mono truncate max-w-xs">{src}</span>}
      </div>
    </div>
  );

// ---------------------------------------------------------------------------

const Preguntas: React.FC<{ preguntas: any[]; cambiar: (p: any[]) => void; conExplicacion: boolean }> = ({ preguntas, cambiar, conExplicacion }) => {
  const grupo = React.useId();
  const editar = (i: number, parche: Record<string, unknown>) => cambiar(preguntas.map((p, k) => (k === i ? { ...p, ...parche } : p)));
  return (
    <div className="space-y-4">
      {preguntas.map((p, i) => (
        <div key={i} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
          <div className="flex items-start gap-2">
            <span className="mt-2 text-sm font-bold text-zinc-400">{i + 1}.</span>
            <div className="flex-1"><Texto nombre="Pregunta" valor={p.question} max={500} onChange={v => editar(i, { question: v })} /></div>
            <div className="flex gap-1 mt-5">
              <BotonIcono titulo="Subir pregunta" deshabilitado={i === 0} onClick={() => cambiar(mover(preguntas, i, -1))}><ArrowUp size={14} /></BotonIcono>
              <BotonIcono titulo="Bajar pregunta" deshabilitado={i === preguntas.length - 1} onClick={() => cambiar(mover(preguntas, i, 1))}><ArrowDown size={14} /></BotonIcono>
              <BotonIcono titulo="Quitar pregunta" peligro onClick={() => cambiar(preguntas.filter((_, k) => k !== i))}><Trash2 size={14} /></BotonIcono>
            </div>
          </div>
          <fieldset>
            <legend className={etiqueta}>Opciones (marca la correcta)</legend>
            <div className="space-y-2">
              {p.options.map((op: string, j: number) => (
                <div key={j} className="flex items-center gap-2">
                  <input type="radio" name={`${grupo}-${i}`} aria-label={`Opción ${j + 1} es la correcta`}
                    checked={op !== '' && op === p.answer} onChange={() => editar(i, { answer: op })} disabled={op === ''} />
                  <input className={campo} value={op} maxLength={200} placeholder={`Opción ${j + 1}`} aria-label={`Opción ${j + 1}`}
                    onChange={e => {
                      const options = p.options.map((o: string, k: number) => (k === j ? e.target.value : o));
                      editar(i, { options, answer: p.answer === op ? e.target.value : p.answer });
                    }} />
                  <BotonIcono titulo="Quitar opción" peligro deshabilitado={p.options.length <= 2}
                    onClick={() => editar(i, { options: p.options.filter((_: string, k: number) => k !== j), answer: p.answer === op ? '' : p.answer })}>
                    <X size={14} />
                  </BotonIcono>
                </div>
              ))}
            </div>
            {p.options.length < 6 && (
              <button type="button" className="mt-2 text-xs font-bold text-[#F57C00] hover:underline"
                onClick={() => editar(i, { options: [...p.options, ''] })}>+ Agregar opción</button>
            )}
          </fieldset>
          {conExplicacion && (
            <Texto nombre="Explicación (se muestra después de responder)" valor={p.explanation} max={1000} onChange={v => editar(i, { explanation: v })} />
          )}
        </div>
      ))}
      <button type="button" disabled={preguntas.length >= 60}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-zinc-300 text-sm font-bold text-zinc-600 hover:border-[#F57C00] hover:text-[#F57C00]"
        onClick={() => cambiar([...preguntas, { question: '', options: ['', ''], answer: '' }])}>
        <Plus size={14} /> Agregar pregunta
      </button>
    </div>
  );
};

const Vocabulario: React.FC<{ items: any[]; cambiar: (p: any[]) => void }> = ({ items, cambiar }) => {
  const editar = (i: number, parche: Record<string, unknown>) => cambiar(items.map((p, k) => (k === i ? { ...p, ...parche } : p)));
  return (
    <div className="space-y-4">
      {items.map((it, i) => (
        <div key={i} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 grid sm:grid-cols-2 gap-3">
              <Texto nombre="Palabra" valor={it.word} max={80} onChange={v => editar(i, { word: v })} />
              <Texto nombre="Significado" valor={it.meaning} onChange={v => editar(i, { meaning: v })} />
              <Texto nombre="Oración de ejemplo" valor={it.example} onChange={v => editar(i, { example: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Texto nombre="Contexto" valor={it.context} max={80} onChange={v => editar(i, { context: v })} />
                <Texto nombre="Fonética" valor={it.phonetic} max={80} placeholder="/sɜːrtʃ/" onChange={v => editar(i, { phonetic: v })} />
              </div>
            </div>
            <div className="flex gap-1">
              <BotonIcono titulo="Subir palabra" deshabilitado={i === 0} onClick={() => cambiar(mover(items, i, -1))}><ArrowUp size={14} /></BotonIcono>
              <BotonIcono titulo="Bajar palabra" deshabilitado={i === items.length - 1} onClick={() => cambiar(mover(items, i, 1))}><ArrowDown size={14} /></BotonIcono>
              <BotonIcono titulo="Quitar palabra" peligro onClick={() => cambiar(items.filter((_, k) => k !== i))}><Trash2 size={14} /></BotonIcono>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><span className={etiqueta}>Audio de la palabra (mp3)</span>
              <Archivo tipo="audio" src={it.audio} onSubido={s => editar(i, { audio: s })} onQuitar={() => editar(i, { audio: '' })} /></div>
            <div><span className={etiqueta}>Audio de la oración (mp3)</span>
              <Archivo tipo="audio" src={it.audioEjemplo} onSubido={s => editar(i, { audioEjemplo: s })} onQuitar={() => editar(i, { audioEjemplo: '' })} /></div>
          </div>
        </div>
      ))}
      <button type="button" disabled={items.length >= 60}
        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-zinc-300 text-sm font-bold text-zinc-600 hover:border-[#F57C00] hover:text-[#F57C00]"
        onClick={() => cambiar([...items, { word: '', meaning: '', example: '', context: '' }])}>
        <Plus size={14} /> Agregar palabra
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------

export const EditorBloque: React.FC<Props> = ({ bloque: b, cambiar }) => {
  const titulo = <Texto nombre="Título del bloque (opcional)" valor={b.titulo} max={120} onChange={v => cambiar({ titulo: v })} />;
  switch (b.type) {
    case 'texto':
      return (
        <div className="space-y-3">
          {titulo}
          <label className="block">
            <span className={etiqueta}>Texto</span>
            <textarea className={`${campo} min-h-[8rem]`} value={b.texto ?? ''} maxLength={20000} onChange={e => cambiar({ texto: e.target.value })} />
            <span className="text-xs text-zinc-400">Texto sin formato. Los saltos de línea se respetan.</span>
          </label>
        </div>
      );
    case 'imagen':
      return (
        <div className="space-y-3">
          {titulo}
          <Archivo tipo="imagen" src={b.src} onSubido={s => cambiar({ src: s })} onQuitar={() => cambiar({ src: '' })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Texto nombre="Descripción de la imagen (para lectores de pantalla)" valor={b.alt} onChange={v => cambiar({ alt: v })} />
            <Texto nombre="Pie de imagen" valor={b.pie} onChange={v => cambiar({ pie: v })} />
          </div>
        </div>
      );
    case 'video':
      return (
        <div className="space-y-3">
          {titulo}
          <Texto nombre="Enlace de YouTube" valor={b.youtube} max={200} placeholder="https://www.youtube.com/watch?v=..."
            onChange={v => cambiar({ youtube: v, ...(v ? { src: '' } : {}) })} />
          <p className="text-xs text-zinc-500">o sube un video (MP4 o WebM, hasta 200 MB):</p>
          <Archivo tipo="video" src={b.src} onSubido={s => cambiar({ src: s, youtube: '' })} onQuitar={() => cambiar({ src: '' })} />
        </div>
      );
    case 'audio':
      return <div className="space-y-3">{titulo}<Archivo tipo="audio" src={b.src} onSubido={s => cambiar({ src: s })} onQuitar={() => cambiar({ src: '' })} /></div>;
    case 'pdf':
      return <div className="space-y-3">{titulo}<Archivo tipo="pdf" src={b.src} onSubido={s => cambiar({ src: s })} onQuitar={() => cambiar({ src: '' })} /></div>;
    case 'vocabulario':
      return <div className="space-y-3">{titulo}<Vocabulario items={b.items ?? []} cambiar={items => cambiar({ items })} /></div>;
    case 'practica':
      return <div className="space-y-3">{titulo}<Preguntas preguntas={b.preguntas ?? []} conExplicacion cambiar={preguntas => cambiar({ preguntas })} /></div>;
    case 'evaluacion':
      return (
        <div className="space-y-3">
          {titulo}
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
            Este bloque es el que lleva nota. Las respuestas correctas se quedan en el servidor y el alumno nunca las recibe.
          </p>
          <Preguntas preguntas={b.preguntas ?? []} conExplicacion={false} cambiar={preguntas => cambiar({ preguntas })} />
        </div>
      );
    case 'simulacion':
      return (
        <div className="space-y-3">
          <Texto nombre="Código de la simulación" valor={b.simulationId} max={12} placeholder="SIM-011" onChange={v => cambiar({ simulationId: v.toUpperCase() })} />
        </div>
      );
    default:
      return <p className="text-sm text-red-700">Tipo de bloque desconocido.</p>;
  }
};
