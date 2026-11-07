import React, { useState } from 'react';
import { CheckCircle2, FileText, XCircle } from 'lucide-react';
import type { BloqueLeccion, PreguntaLeccion } from '../types';

type Bloque<T extends BloqueLeccion['type']> = Extract<BloqueLeccion, { type: T }>;

const tarjeta = 'bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm mb-8';

/** Texto, imagen, video, audio y PDF de una lección. Todo se muestra como texto plano o con etiquetas del navegador. */
export const BloqueMedia: React.FC<{ bloque: BloqueLeccion }> = ({ bloque }) => {
  switch (bloque.type) {
    case 'texto':
      return (
        <section className={tarjeta}>
          {bloque.titulo && <h2 className="text-xl font-bold text-zinc-900 mb-4">{bloque.titulo}</h2>}
          <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{bloque.texto}</p>
        </section>
      );
    case 'imagen':
      return (
        <section className={tarjeta}>
          {bloque.titulo && <h2 className="text-xl font-bold text-zinc-900 mb-4">{bloque.titulo}</h2>}
          <figure>
            <img src={bloque.src} alt={bloque.alt ?? ''} className="max-w-full rounded-xl border border-zinc-100 mx-auto" loading="lazy" />
            {bloque.pie && <figcaption className="text-sm text-zinc-500 text-center mt-3">{bloque.pie}</figcaption>}
          </figure>
        </section>
      );
    case 'video':
      return (
        <section className={tarjeta}>
          {bloque.titulo && <h2 className="text-xl font-bold text-zinc-900 mb-4">{bloque.titulo}</h2>}
          {bloque.youtube ? (
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-xl"
                src={`https://www.youtube-nocookie.com/embed/${bloque.youtube}`}
                title={bloque.titulo || 'Video'}
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <video src={bloque.src} controls preload="metadata" className="w-full rounded-xl bg-black" />
          )}
        </section>
      );
    case 'audio':
      return (
        <section className={tarjeta}>
          {bloque.titulo && <h2 className="text-xl font-bold text-zinc-900 mb-4">{bloque.titulo}</h2>}
          <audio src={bloque.src} controls preload="metadata" className="w-full" />
        </section>
      );
    case 'pdf':
      return (
        <section className={tarjeta}>
          <a href={bloque.src} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 hover:border-[#F57C00] hover:bg-orange-50 transition-colors">
            <FileText className="text-[#F57C00]" size={28} />
            <span className="font-bold text-zinc-800">{bloque.titulo || 'Abrir documento (PDF)'}</span>
          </a>
        </section>
      );
    default:
      return null;
  }
};

/** Preguntas de práctica escritas por el docente: dan retroalimentación al instante y no llevan nota. */
export const BloquePractica: React.FC<{ bloque: Bloque<'practica'> }> = ({ bloque }) => (
  <section className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm">
    <h3 className="text-xl font-bold text-zinc-900 mb-6">{bloque.titulo || 'Práctica de la lección'}</h3>
    <div className="space-y-6">
      {bloque.preguntas.map((p, i) => <PreguntaPractica key={i} numero={i + 1} pregunta={p} />)}
    </div>
  </section>
);

const PreguntaPractica: React.FC<{ numero: number; pregunta: PreguntaLeccion }> = ({ numero, pregunta }) => {
  const [elegida, setElegida] = useState<string | null>(null);
  const acierto = elegida === pregunta.answer;
  return (
    <div>
      <p className="font-bold text-zinc-900 mb-3">{numero}. {pregunta.question}</p>
      <div className="grid gap-2">
        {pregunta.options.map(op => {
          const estilo = elegida === null
            ? 'border-zinc-100 hover:border-[#F57C00] hover:bg-orange-50'
            : op === pregunta.answer ? 'border-emerald-400 bg-emerald-50'
              : op === elegida ? 'border-red-300 bg-red-50' : 'border-zinc-100 opacity-60';
          return (
            <button key={op} type="button" disabled={elegida !== null} onClick={() => setElegida(op)}
              className={`p-3 text-left rounded-xl border-2 font-medium text-zinc-700 transition-all ${estilo}`}>
              {op}
            </button>
          );
        })}
      </div>
      {elegida !== null && (
        <div role="status" className={`mt-3 p-3 rounded-xl text-sm flex gap-2 ${acierto ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
          {acierto ? <CheckCircle2 size={18} className="flex-shrink-0" /> : <XCircle size={18} className="flex-shrink-0" />}
          <span>
            {acierto ? '¡Correcto!' : `Respuesta correcta: ${pregunta.answer}.`}
            {pregunta.explanation ? ` ${pregunta.explanation}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};
