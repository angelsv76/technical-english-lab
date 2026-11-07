import React, { useMemo, useRef, useState } from 'react';
import { AlertCircle, Download, Loader2, Upload } from 'lucide-react';
import {
  aplicarImportacion, exportarCurso, subirImportacion, type ResultadoImportacion, type VistaPreviaImportacion
} from '../../services/leccionesAdmin';

interface Props { onImportado: () => void }

type Estado = 'draft' | 'published' | 'conservar';

/** Exportar el curso completo o importar un .zip (respaldo, otra instalación u otra materia). */
export const IntercambioLecciones: React.FC<Props> = ({ onImportado }) => {
  const entrada = useRef<HTMLInputElement>(null);
  const [exportando, setExportando] = useState(false);
  const [subiendo, setSubiendo] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [previa, setPrevia] = useState<VistaPreviaImportacion | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);

  const exportar = async () => {
    setError(''); setAviso(''); setExportando(true);
    try {
      const r = await exportarCurso('todas');
      setAviso(`Exportado: ${r.lecciones} lecciones y ${r.archivos} archivos (${r.nombre}).` +
        (r.faltantes > 0 ? ` Atención: ${r.faltantes} archivo(s) no existían en el disco y no se incluyeron.` : ''));
    } catch (e) { setError((e as Error).message); }
    finally { setExportando(false); }
  };

  const elegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    setError(''); setAviso(''); setResultado(null);
    setSubiendo(0);
    try { setPrevia(await subirImportacion(archivo, setSubiendo)); }
    catch (err) { setError((err as Error).message); }
    finally { setSubiendo(null); }
  };

  return (
    <div className="p-6 pb-0 space-y-3">
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60">
        <div className="mr-auto">
          <p className="font-bold text-zinc-900 text-sm">Respaldo y plantillas</p>
          <p className="text-xs text-zinc-500">Un archivo .zip con las lecciones y sus imágenes, audios, videos y PDF.</p>
        </div>
        <button onClick={exportar} disabled={exportando}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 bg-white text-sm font-bold text-zinc-700 hover:border-[#F57C00] hover:text-[#F57C00] disabled:opacity-60">
          {exportando ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Exportar curso completo
        </button>
        <button onClick={() => entrada.current?.click()} disabled={subiendo !== null}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-sm font-bold disabled:opacity-60">
          {subiendo !== null ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {subiendo !== null ? `Subiendo ${subiendo}%` : 'Importar curso o lección'}
        </button>
        <input ref={entrada} type="file" accept=".zip,application/zip" className="hidden" onChange={elegir} />
      </div>
      {error && <p role="alert" className="flex gap-2 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-800"><AlertCircle size={16} className="flex-shrink-0 mt-0.5" />{error}</p>}
      {aviso && !error && <p role="status" className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">{aviso}</p>}
      {resultado && (
        <div role="status" className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 space-y-1">
          <p className="font-bold">Importadas {resultado.importadas.length} lección(es) y {resultado.archivos} archivo(s):
            {' '}{resultado.importadas.map(i => `semana ${i.week}${i.status === 'draft' ? ' (borrador)' : ''}`).join(', ')}.</p>
          {resultado.advertencias.map(a => <p key={a} className="text-amber-800">⚠ {a}</p>)}
        </div>
      )}
      {previa && <DialogoImportar previa={previa} onCerrar={() => setPrevia(null)}
        onListo={r => { setPrevia(null); setResultado(r); onImportado(); }} />}
    </div>
  );
};

const DialogoImportar: React.FC<{ previa: VistaPreviaImportacion; onCerrar: () => void; onListo: (r: ResultadoImportacion) => void }> =
  ({ previa, onCerrar, onListo }) => {
    const unica = previa.lecciones.length === 1;
    const [elegidas, setElegidas] = useState<Record<number, boolean>>(() => Object.fromEntries(previa.lecciones.map(l => [l.week, true])));
    const [destino, setDestino] = useState<Record<number, number>>(() => Object.fromEntries(previa.lecciones.map(l => [l.week, l.week])));
    const [estado, setEstado] = useState<Estado>('draft');
    const [aplicando, setAplicando] = useState(false);
    const [error, setError] = useState('');

    const seleccion = previa.lecciones.filter(l => elegidas[l.week]);
    const semana = (n: number) => previa.semanas.find(s => s.week === n)!;
    const repetidos = useMemo(() => {
      const vistos = new Set<number>(); const rep = new Set<number>();
      for (const l of seleccion) { const d = destino[l.week]; if (vistos.has(d)) rep.add(d); vistos.add(d); }
      return rep;
    }, [seleccion, destino]);
    const reemplazos = seleccion.filter(l => semana(destino[l.week]).title !== null);
    const conNotas = seleccion.filter(l => semana(destino[l.week]).notas > 0 && l.preguntasEvaluacion > 0);

    const aplicar = async () => {
      setAplicando(true); setError('');
      try {
        onListo(await aplicarImportacion(previa.id, seleccion.map(l => ({ origen: l.week, destino: destino[l.week] })), estado));
      } catch (e) { setError((e as Error).message); setAplicando(false); }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Importar lecciones">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Importar {unica ? 'una lección' : `${previa.lecciones.length} lecciones`}</h3>
            <p className="text-sm text-zinc-500">
              {previa.archivos} archivo(s) adjuntos · {(previa.bytes / 1024 / 1024).toFixed(1)} MB
              {previa.creado && ` · exportado el ${new Date(previa.creado).toLocaleDateString('es-SV')}`}.
              Todavía no se cambió nada: revisa y confirma.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs uppercase tracking-wider text-zinc-400">
                <th className="py-2 pr-2"></th><th className="pr-3">En el archivo</th><th className="pr-3">Contenido</th><th>Va a la semana</th></tr></thead>
              <tbody>
                {previa.lecciones.map(l => {
                  const dest = semana(destino[l.week]);
                  return (
                    <tr key={l.week} className="border-t border-zinc-100 align-top">
                      <td className="py-2 pr-2"><input type="checkbox" aria-label={`Importar la semana ${l.week}`} checked={!!elegidas[l.week]}
                        onChange={e => setElegidas({ ...elegidas, [l.week]: e.target.checked })} /></td>
                      <td className="pr-3 py-2"><span className="font-bold">Semana {l.week}</span><br /><span className="text-zinc-600">{l.title}</span></td>
                      <td className="pr-3 py-2 text-zinc-500">{l.bloques} bloques{l.preguntasEvaluacion > 0 && ` · ${l.preguntasEvaluacion} preguntas con nota`}{l.archivos > 0 && ` · ${l.archivos} archivos`}</td>
                      <td className="py-2">
                        <select aria-label={`Destino de la semana ${l.week}`} value={destino[l.week]} disabled={!elegidas[l.week]}
                          onChange={e => setDestino({ ...destino, [l.week]: Number(e.target.value) })}
                          className={`px-2 py-1.5 border rounded-lg text-sm max-w-[16rem] ${repetidos.has(destino[l.week]) && elegidas[l.week] ? 'border-red-400' : 'border-zinc-300'}`}>
                          {previa.semanas.map(s => <option key={s.week} value={s.week}>
                            {s.week}{s.title ? ` · ${s.title.slice(0, 28)}` : ' · (vacía)'}{s.notas > 0 ? ` · ${s.notas} notas` : ''}
                          </option>)}
                        </select>
                        {dest.title && elegidas[l.week] && <p className="text-xs text-amber-700 mt-1">Reemplaza: {dest.title}</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <fieldset className="space-y-1">
            <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Cómo entran</legend>
            {([['draft', 'Como borrador (recomendado): los revisas y luego los publicas'],
               ['published', 'Publicadas: los alumnos las ven de inmediato'],
               ['conservar', 'Con el estado que traían en el archivo']] as [Estado, string][]).map(([v, t]) => (
              <label key={v} className="flex items-center gap-2 text-sm"><input type="radio" name="estado-importacion" checked={estado === v} onChange={() => setEstado(v)} /> {t}</label>
            ))}
          </fieldset>

          {repetidos.size > 0 && <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">Dos lecciones van a la misma semana ({[...repetidos].join(', ')}). Cambia un destino.</p>}
          {reemplazos.length > 0 && <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            Se reemplazará el contenido de {reemplazos.length} semana(s). Lo anterior queda en su historial de versiones.</p>}
          {conNotas.length > 0 && <p className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
            {conNotas.length} semana(s) de destino ya tienen notas. Las notas se conservan; los intentos nuevos se calificarán con la evaluación importada.</p>}
          {error && <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{error}</p>}

          <div className="flex justify-end gap-3">
            <button onClick={onCerrar} disabled={aplicando} className="px-4 py-2 rounded-lg border border-zinc-300 text-sm font-bold">Cancelar</button>
            <button onClick={aplicar} disabled={aplicando || seleccion.length === 0 || repetidos.size > 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F57C00] hover:bg-[#E65100] text-white text-sm font-bold disabled:opacity-50">
              {aplicando && <Loader2 size={14} className="animate-spin" />} Importar {seleccion.length} lección(es)
            </button>
          </div>
        </div>
      </div>
    );
  };
