import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowDown, ArrowLeft, ArrowUp, BookOpen, ChevronDown, ChevronRight, ClipboardCheck, Copy, Download, Eye, FileText,
  FlaskConical, History, Image as Imagen, ListChecks, Loader2, Music, PenLine, Plus, Save, Trash2, Video
} from 'lucide-react';
import type { Leccion } from '../../types';
import {
  alumnosConNota, exportarCurso, guardarLeccion, listarVersiones, obtenerLeccion, restaurarVersion, type VersionLeccion
} from '../../services/leccionesAdmin';
import { EditorBloque, type BloqueEditable } from './EditoresBloque';
import { VistaPrevia } from './VistaPrevia';

interface Props { semana: number; onSalir: () => void }

const TIPOS: { tipo: string; nombre: string; ayuda: string; icono: React.ReactNode }[] = [
  { tipo: 'texto', nombre: 'Texto', ayuda: 'Explicaciones, instrucciones', icono: <PenLine size={16} /> },
  { tipo: 'imagen', nombre: 'Imagen', ayuda: 'PNG, JPG, WebP o GIF', icono: <Imagen size={16} /> },
  { tipo: 'video', nombre: 'Video', ayuda: 'YouTube o archivo MP4/WebM', icono: <Video size={16} /> },
  { tipo: 'audio', nombre: 'Audio', ayuda: 'Archivo MP3', icono: <Music size={16} /> },
  { tipo: 'pdf', nombre: 'Documento PDF', ayuda: 'Guía o ficha para descargar', icono: <FileText size={16} /> },
  { tipo: 'vocabulario', nombre: 'Vocabulario', ayuda: 'Palabras con audio y ejemplo', icono: <BookOpen size={16} /> },
  { tipo: 'practica', nombre: 'Práctica', ayuda: 'Preguntas sin nota', icono: <ListChecks size={16} /> },
  { tipo: 'evaluacion', nombre: 'Evaluación', ayuda: 'Preguntas con nota (solo una)', icono: <ClipboardCheck size={16} /> },
  { tipo: 'simulacion', nombre: 'Simulación', ayuda: 'Código SIM-###', icono: <FlaskConical size={16} /> }
];
const NOMBRE = Object.fromEntries(TIPOS.map(t => [t.tipo, t]));

const nuevoId = () => (crypto.randomUUID ? crypto.randomUUID() : `b-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const preguntaVacia = () => ({ question: '', options: ['', ''], answer: '' });

function bloqueNuevo(tipo: string): BloqueEditable {
  const base = { id: nuevoId(), type: tipo };
  switch (tipo) {
    case 'texto': return { ...base, titulo: '', texto: '' };
    case 'vocabulario': return { ...base, titulo: 'Vocabulario de la semana', items: [{ word: '', meaning: '', example: '', context: '' }] };
    case 'practica': return { ...base, titulo: 'Práctica', preguntas: [preguntaVacia()] };
    case 'evaluacion': return { ...base, titulo: 'Evaluación', preguntas: [preguntaVacia()] };
    case 'simulacion': return { ...base, simulationId: '' };
    default: return { ...base, titulo: '' };
  }
}

/** Resumen de una línea para el bloque cerrado. */
function resumen(b: BloqueEditable): string {
  switch (b.type) {
    case 'texto': return (b.texto ?? '').slice(0, 70) || 'Sin texto todavía';
    case 'imagen': case 'audio': case 'pdf': return b.src ? 'Archivo subido' : 'Falta subir el archivo';
    case 'video': return b.youtube ? 'Video de YouTube' : b.src ? 'Video subido' : 'Falta el video';
    case 'vocabulario': return `${(b.items ?? []).length} palabras`;
    case 'practica': case 'evaluacion': return `${(b.preguntas ?? []).length} preguntas`;
    case 'simulacion': return b.simulationId || 'Sin código';
    default: return '';
  }
}

const huellaEvaluacion = (l: Leccion | null) =>
  JSON.stringify(l?.blocks.find(b => b.type === 'evaluacion') ?? null);

export const EditorLeccion: React.FC<Props> = ({ semana, onSalir }) => {
  const [leccion, setLeccion] = useState<Leccion | null>(null);
  const [guardada, setGuardada] = useState('');           // JSON de lo último guardado, para saber si hay cambios
  const [original, setOriginal] = useState<Leccion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState(false);
  const [previa, setPrevia] = useState(false);
  const [versiones, setVersiones] = useState<VersionLeccion[] | null>(null);
  const [notas, setNotas] = useState(0);

  const cargar = useCallback(async () => {
    setCargando(true); setError('');
    try {
      const l = await obtenerLeccion(semana);
      setLeccion(l); setOriginal(l); setGuardada(JSON.stringify(l));
      setNotas(await alumnosConNota(semana));
    } catch (e) { setError((e as Error).message); }
    finally { setCargando(false); }
  }, [semana]);
  useEffect(() => { cargar(); }, [cargar]);

  const hayCambios = useMemo(() => !!leccion && JSON.stringify(leccion) !== guardada, [leccion, guardada]);

  useEffect(() => {
    if (!hayCambios) return;
    const alSalir = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', alSalir);
    return () => window.removeEventListener('beforeunload', alSalir);
  }, [hayCambios]);

  const salir = () => {
    if (hayCambios && !window.confirm('Tienes cambios sin guardar. ¿Salir y perderlos?')) return;
    onSalir();
  };

  const cambiarBloques = (fn: (b: BloqueEditable[]) => BloqueEditable[]) =>
    setLeccion(l => (l ? { ...l, blocks: fn(l.blocks as unknown as BloqueEditable[]) as never } : l));
  const parche = (id: string, p: Record<string, unknown>) => cambiarBloques(bs => bs.map(b => (b.id === id ? { ...b, ...p } : b)));
  const mover = (i: number, d: -1 | 1) => cambiarBloques(bs => {
    const j = i + d; if (j < 0 || j >= bs.length) return bs;
    const c = [...bs]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });
  const duplicar = (i: number) => cambiarBloques(bs => {
    if (bs[i].type === 'evaluacion') return bs;
    const c = [...bs]; c.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(bs[i])), id: nuevoId() }); return c;
  });
  const quitar = (i: number) => {
    const b = (leccion!.blocks as unknown as BloqueEditable[])[i];
    if (!window.confirm(`¿Quitar el bloque "${NOMBRE[b.type]?.nombre ?? b.type}"? Se puede deshacer con una versión anterior mientras no se guarde otra vez demasiadas veces.`)) return;
    cambiarBloques(bs => bs.filter((_, k) => k !== i));
  };
  const agregar = (tipo: string) => {
    const b = bloqueNuevo(tipo);
    cambiarBloques(bs => [...bs, b]);
    setAbiertos(a => ({ ...a, [b.id]: true }));
    setMenu(false);
  };

  const guardar = async (estado?: 'draft' | 'published') => {
    if (!leccion) return;
    const aGuardar: Leccion = estado ? { ...leccion, status: estado } : leccion;
    if (notas > 0 && huellaEvaluacion(aGuardar) !== huellaEvaluacion(original)) {
      const sigue = window.confirm(
        `${notas} registro(s) de notas ya existen para esta semana.\n\nLas notas anteriores se conservan tal como están. ` +
        'Solo los intentos nuevos se calificarán con la evaluación editada.\n\n¿Guardar el cambio?'
      );
      if (!sigue) return;
    }
    setGuardando(true); setError(''); setAviso('');
    try {
      const l = await guardarLeccion(semana, aGuardar);
      setLeccion(l); setOriginal(l); setGuardada(JSON.stringify(l));
      setAviso(l.status === 'published' ? 'Guardado. Los alumnos ya ven esta versión.' : 'Guardado como borrador. Los alumnos no la ven.');
    } catch (e) { setError((e as Error).message); }
    finally { setGuardando(false); }
  };

  const exportar = async () => {
    setError(''); setAviso('');
    try {
      const r = await exportarCurso([semana]);
      setAviso(`Exportada la semana ${semana} (${r.archivos} archivos): ${r.nombre}.`);
    } catch (e) { setError((e as Error).message); }
  };

  const abrirVersiones = async () => {
    setError('');
    try { setVersiones(await listarVersiones(semana)); } catch (e) { setError((e as Error).message); }
  };
  const restaurar = async (v: VersionLeccion) => {
    if (hayCambios && !window.confirm('Tienes cambios sin guardar; se perderán al restaurar. ¿Continuar?')) return;
    if (!window.confirm(`¿Volver a la versión del ${new Date(v.saved_at).toLocaleString('es-SV')}? La versión actual se guarda en el historial.`)) return;
    try {
      const l = await restaurarVersion(semana, v.id);
      setLeccion(l); setOriginal(l); setGuardada(JSON.stringify(l)); setVersiones(null);
      setAviso('Versión restaurada.');
    } catch (e) { setError((e as Error).message); }
  };

  if (cargando) return <div className="p-8 flex items-center gap-2 text-zinc-500"><Loader2 className="animate-spin" size={18} /> Cargando la lección...</div>;
  if (!leccion) return (
    <div className="p-8 space-y-4">
      <p role="alert" className="text-red-700">{error || 'No se pudo cargar la lección.'}</p>
      <button onClick={onSalir} className="px-4 py-2 rounded-lg border border-zinc-300 font-bold text-sm">Volver</button>
    </div>
  );

  const bloques = leccion.blocks as unknown as BloqueEditable[];
  const hayEvaluacion = bloques.some(b => b.type === 'evaluacion');
  const campo = 'w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#F57C00]';
  const etiqueta = 'block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1';

  return (
    <div className="p-6 space-y-6">
      {/* Barra superior */}
      <div className="flex flex-wrap items-center gap-3 sticky top-0 z-10 bg-white/95 backdrop-blur py-3 -mt-3 border-b border-zinc-100">
        <button onClick={salir} className="inline-flex items-center gap-1 text-sm font-bold text-zinc-600 hover:text-zinc-900"><ArrowLeft size={16} /> Semanas</button>
        <h2 className="text-lg font-bold text-zinc-900 mr-auto">Semana {semana}</h2>
        {hayCambios && <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">Cambios sin guardar</span>}
        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500 font-bold">Estado</span>
          <select value={leccion.status} onChange={e => setLeccion({ ...leccion, status: e.target.value as Leccion['status'] })}
            className="px-3 py-2 border border-zinc-300 rounded-lg text-sm font-bold">
            <option value="published">Publicada</option>
            <option value="draft">Borrador</option>
          </select>
        </label>
        <button onClick={() => setPrevia(p => !p)} className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-bold ${previa ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-300 text-zinc-700'}`}>
          <Eye size={14} /> Vista previa
        </button>
        <button onClick={exportar} disabled={hayCambios} title={hayCambios ? 'Guarda los cambios antes de exportar' : 'Descargar esta lección en un .zip'}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-300 text-sm font-bold text-zinc-700 disabled:opacity-50"><Download size={14} /> Exportar</button>
        <button onClick={abrirVersiones} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-zinc-300 text-sm font-bold text-zinc-700"><History size={14} /> Versiones</button>
        <button onClick={() => guardar()} disabled={guardando || !hayCambios}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#F57C00] hover:bg-[#E65100] text-white text-sm font-bold disabled:opacity-50">
          {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
        </button>
      </div>

      {error && <p role="alert" className="flex gap-2 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-800"><AlertCircle size={18} className="flex-shrink-0" />{error}</p>}
      {aviso && !error && <p role="status" className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">{aviso}</p>}
      {leccion.status === 'draft' && <p className="p-3 rounded-xl bg-zinc-100 text-sm text-zinc-700">Esta lección está en <strong>borrador</strong>: los alumnos no la ven aunque la semana esté activa.</p>}
      {notas > 0 && <p className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">{notas} registro(s) de notas ya existen en esta semana. Si cambias la evaluación, esas notas se conservan.</p>}

      {previa ? <VistaPrevia leccion={leccion} /> : (
        <>
          {/* Datos de la lección */}
          <section className="grid gap-4 p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50">
            <label className="block"><span className={etiqueta}>Título</span>
              <input className={campo} value={leccion.title} maxLength={200} onChange={e => setLeccion({ ...leccion, title: e.target.value })} /></label>
            <label className="block"><span className={etiqueta}>Objetivo</span>
              <textarea className={`${campo} min-h-[4rem]`} value={leccion.objective} maxLength={500} onChange={e => setLeccion({ ...leccion, objective: e.target.value })} /></label>
            <label className="block"><span className={etiqueta}>Palabras clave (separadas por coma)</span>
              <input className={campo} defaultValue={leccion.keywords.join(', ')} key={`${semana}-${guardada.length}`}
                onChange={e => setLeccion({ ...leccion, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean).slice(0, 12) })} /></label>
          </section>

          {/* Bloques */}
          <section className="space-y-3" aria-label="Bloques de la lección">
            {bloques.length === 0 && <p className="text-sm text-zinc-500 p-4 border border-dashed border-zinc-300 rounded-xl">Esta lección no tiene bloques todavía. Agrega el primero.</p>}
            {bloques.map((b, i) => {
              const info = NOMBRE[b.type];
              const abierto = !!abiertos[b.id];
              return (
                <div key={b.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 p-3 bg-zinc-50">
                    <button type="button" onClick={() => setAbiertos(a => ({ ...a, [b.id]: !abierto }))} aria-expanded={abierto}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      {abierto ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="text-[#F57C00]">{info?.icono}</span>
                      <span className="font-bold text-zinc-900">{info?.nombre ?? b.type}</span>
                      {b.titulo && <span className="text-sm text-zinc-500 truncate">· {b.titulo}</span>}
                      <span className="text-xs text-zinc-400 truncate ml-auto mr-2">{resumen(b)}</span>
                    </button>
                    <div className="flex gap-1">
                      <button type="button" aria-label="Subir bloque" title="Subir bloque" disabled={i === 0} onClick={() => mover(i, -1)} className="p-1.5 rounded-lg border border-zinc-200 bg-white disabled:opacity-30"><ArrowUp size={14} /></button>
                      <button type="button" aria-label="Bajar bloque" title="Bajar bloque" disabled={i === bloques.length - 1} onClick={() => mover(i, 1)} className="p-1.5 rounded-lg border border-zinc-200 bg-white disabled:opacity-30"><ArrowDown size={14} /></button>
                      <button type="button" aria-label="Duplicar bloque" title="Duplicar bloque" disabled={b.type === 'evaluacion'} onClick={() => duplicar(i)} className="p-1.5 rounded-lg border border-zinc-200 bg-white disabled:opacity-30"><Copy size={14} /></button>
                      <button type="button" aria-label="Quitar bloque" title="Quitar bloque" onClick={() => quitar(i)} className="p-1.5 rounded-lg border border-zinc-200 bg-white text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {abierto && <div className="p-5 border-t border-zinc-100"><EditorBloque bloque={b} cambiar={p => parche(b.id, p)} /></div>}
                </div>
              );
            })}

            <div className="relative">
              <button type="button" onClick={() => setMenu(m => !m)} aria-expanded={menu}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-zinc-300 font-bold text-zinc-600 hover:border-[#F57C00] hover:text-[#F57C00]">
                <Plus size={16} /> Agregar bloque
              </button>
              {menu && (
                <div className="absolute z-20 mt-2 w-80 max-w-full bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 grid">
                  {TIPOS.map(t => {
                    const bloqueado = t.tipo === 'evaluacion' && hayEvaluacion;
                    return (
                      <button key={t.tipo} type="button" disabled={bloqueado} onClick={() => agregar(t.tipo)}
                        className="flex items-center gap-3 p-3 rounded-xl text-left hover:bg-orange-50 disabled:opacity-40 disabled:hover:bg-transparent">
                        <span className="text-[#F57C00]">{t.icono}</span>
                        <span><span className="font-bold text-zinc-900 block">{t.nombre}</span>
                          <span className="text-xs text-zinc-500">{bloqueado ? 'Ya hay una evaluación en esta lección' : t.ayuda}</span></span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Historial */}
      {versiones && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Versiones anteriores">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center mb-4"><h3 className="text-lg font-bold mr-auto">Versiones anteriores</h3>
              <button onClick={() => setVersiones(null)} className="text-sm font-bold text-zinc-500">Cerrar</button></div>
            {versiones.length === 0 ? <p className="text-sm text-zinc-500">Todavía no hay versiones: se guarda una cada vez que guardas un cambio.</p> : (
              <ul className="space-y-2">
                {versiones.map(v => (
                  <li key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200">
                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-zinc-900 truncate">{v.title}</p>
                      <p className="text-xs text-zinc-500">{new Date(v.saved_at).toLocaleString('es-SV')} · {v.status === 'published' ? 'publicada' : 'borrador'}</p></div>
                    <button onClick={() => restaurar(v)} className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-bold">Restaurar</button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-zinc-400 mt-4">Se conservan las últimas 20.</p>
          </div>
        </div>
      )}
    </div>
  );
};
