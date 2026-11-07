import React, { useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { subirMedio, type MedioSubido } from '../../services/leccionesAdmin';

type Tipo = MedioSubido['tipo'];

const ACEPTA: Record<Tipo, string> = {
  imagen: 'image/png,image/jpeg,image/webp,image/gif',
  audio: 'audio/mpeg,.mp3',
  pdf: 'application/pdf',
  video: 'video/mp4,video/webm'
};
const LIMITE_MB: Record<Tipo, number> = { imagen: 5, audio: 10, pdf: 20, video: 200 };

interface Props {
  tipo: Tipo;
  etiqueta?: string;
  onSubido: (src: string) => void;
}

/** Botón que sube un archivo al servidor y devuelve su ruta. */
export const SubirArchivo: React.FC<Props> = ({ tipo, etiqueta, onSubido }) => {
  const entrada = useRef<HTMLInputElement>(null);
  const [progreso, setProgreso] = useState<number | null>(null);
  const [error, setError] = useState('');

  const elegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo) return;
    setError('');
    if (archivo.size > LIMITE_MB[tipo] * 1024 * 1024) {
      setError(`Pesa demasiado: el máximo para ${tipo} es ${LIMITE_MB[tipo]} MB.`);
      return;
    }
    setProgreso(0);
    try {
      const subido = await subirMedio(archivo, setProgreso);
      if (subido.tipo !== tipo) { setError(`El archivo es ${subido.tipo}, y aquí se esperaba ${tipo}.`); return; }
      onSubido(subido.src);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProgreso(null);
    }
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <button type="button" onClick={() => entrada.current?.click()} disabled={progreso !== null}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 bg-white text-sm font-bold text-zinc-700 hover:border-[#F57C00] hover:text-[#F57C00] disabled:opacity-60">
        {progreso !== null ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
        {progreso !== null ? `Subiendo ${progreso}%` : (etiqueta ?? 'Subir archivo')}
      </button>
      <input ref={entrada} type="file" accept={ACEPTA[tipo]} className="hidden" onChange={elegir} />
      {error && <span role="alert" className="text-xs text-red-700">{error}</span>}
    </div>
  );
};
