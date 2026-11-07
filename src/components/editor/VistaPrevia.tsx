import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Leccion } from '../../types';
import { BloqueMedia, BloquePractica } from '../BloquesLeccion';

/** Cómo verá el alumno la pestaña de estudio y la práctica. La evaluación se muestra con la respuesta correcta marcada (solo para el docente). */
export const VistaPrevia: React.FC<{ leccion: Leccion }> = ({ leccion }) => (
  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 space-y-6">
    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Vista previa · así lo ve el alumno</p>
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Semana {leccion.week}: {leccion.title}</h1>
      {leccion.objective && <p className="text-zinc-600 mt-2">{leccion.objective}</p>}
      {leccion.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {leccion.keywords.map(k => <span key={k} className="px-3 py-1 bg-white text-zinc-700 rounded-lg font-mono text-sm border border-zinc-200">{k}</span>)}
        </div>
      )}
    </div>

    {leccion.blocks.length === 0 && <p className="text-sm text-zinc-500">La lección no tiene bloques.</p>}

    {leccion.blocks.map(b => {
      if (b.type === 'vocabulario') {
        return (
          <section key={b.id} className="bg-white p-6 rounded-2xl border border-zinc-200">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">{b.titulo || 'Vocabulario de la semana'}</h2>
            <div className="space-y-4">
              {b.items.map((v, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/60">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-bold text-[#F57C00] font-mono">{v.word || '(sin palabra)'}</span>
                    {v.context && <span className="text-[10px] uppercase tracking-widest bg-zinc-200 px-2 py-1 rounded-lg font-bold text-zinc-600">{v.context}</span>}
                    {v.phonetic && <span className="text-sm text-zinc-500">{v.phonetic}</span>}
                  </div>
                  <p className="font-medium text-zinc-800 mt-1">{v.meaning}</p>
                  <p className="text-sm text-zinc-500 italic">{v.example}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {v.audio && <audio src={v.audio} controls className="h-8" />}
                    {v.audioEjemplo && <audio src={v.audioEjemplo} controls className="h-8" />}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      }
      if (b.type === 'practica') return <BloquePractica key={b.id} bloque={b} />;
      if (b.type === 'evaluacion') {
        return (
          <section key={b.id} className="bg-white p-6 rounded-2xl border-2 border-amber-200">
            <h2 className="text-xl font-bold text-zinc-900 mb-1">{b.titulo || 'Evaluación'} <span className="text-xs font-bold text-amber-700">(lleva nota)</span></h2>
            <p className="text-xs text-zinc-500 mb-4">El alumno verá las preguntas de una en una y en orden aleatorio. Aquí se marca la respuesta correcta.</p>
            <ol className="space-y-3 list-decimal pl-5">
              {b.preguntas.map((p, i) => (
                <li key={i}><p className="font-bold text-zinc-900">{p.question}</p>
                  <ul className="mt-1 space-y-1">
                    {p.options.map(o => (
                      <li key={o} className={`text-sm flex items-center gap-1 ${o === p.answer ? 'text-emerald-700 font-bold' : 'text-zinc-600'}`}>
                        {o === p.answer && <CheckCircle2 size={14} />}{o}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        );
      }
      if (b.type === 'simulacion') {
        return <p key={b.id} className="text-sm text-zinc-500">Simulación {b.simulationId || '(sin código)'}</p>;
      }
      return <BloqueMedia key={b.id} bloque={b} />;
    })}
  </div>
);
