import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Turtle, Loader2 } from 'lucide-react';
import { speakEnglish, stopSpeaking, isTTSAvailable } from '../utils/tts';
import { sentenceAudioUrl } from '../utils/audioUrls';

interface Props {
  example: string;
  word: string;   // palabra objetivo de la semana — se resalta en la oración
  week?: number;  // si se indica, intenta el mp3 pregrabado (kokoro) de Supabase
}

/**
 * Oración de ejemplo interactiva:
 * - La palabra objetivo aparece resaltada.
 * - Cada palabra es clicable y se pronuncia individualmente (práctica palabra por palabra).
 * - Botones para escuchar la oración completa a velocidad normal o lenta.
 */
export const ExampleSentence: React.FC<Props> = ({ example, word, week }) => {
  const [playing, setPlaying] = useState<'sentence' | 'slow' | string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // true = el mp3 de Supabase no existe o falló → usar la voz del navegador
  const fileFailedRef = useRef(false);

  useEffect(() => {
    return () => {
      stopSpeaking();
      audioRef.current?.pause();
    };
  }, []);

  const tokens = example.split(/(\s+)/);
  const normalize = (t: string) => t.replace(/[^a-zA-Z0-9'-]/g, '').toLowerCase();
  const target = word.toLowerCase();

  const speakWord = (token: string) => {
    const clean = normalize(token);
    if (!clean) return;
    setPlaying(clean);
    speakEnglish(clean, { rate: 0.75, onEnd: () => setPlaying(null) });
  };

  const modeRef = useRef<'sentence' | 'slow'>('sentence');

  const speakWithTTS = (mode: 'sentence' | 'slow') => {
    setPlaying(mode);
    speakEnglish(example, { rate: mode === 'slow' ? 0.55 : 0.9, onEnd: () => setPlaying(null) });
  };

  const speakSentence = (slow: boolean) => {
    const mode = slow ? 'slow' : 'sentence';
    if (playing === mode) {
      stopSpeaking();
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    modeRef.current = mode;

    const url = week ? sentenceAudioUrl(week, word) : null;

    // Preferir el mp3 pregrabado (kokoro); si no existe, voz del navegador
    if (url && !fileFailedRef.current) {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.addEventListener('ended', () => setPlaying(null));
        audioRef.current.addEventListener('error', () => {
          fileFailedRef.current = true;
          speakWithTTS(modeRef.current);
        });
      }
      const audio = audioRef.current;
      audio.pause();
      audio.currentTime = 0;
      audio.playbackRate = slow ? 0.7 : 1.0;
      setPlaying(mode);
      audio.play().catch(() => {
        if (!fileFailedRef.current) {
          fileFailedRef.current = true;
          speakWithTTS(modeRef.current);
        }
      });
      return;
    }

    speakWithTTS(mode);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-zinc-100">
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
        Example — toca cada palabra para escucharla
      </p>

      <p className="text-lg leading-relaxed mb-3">
        {tokens.map((token, i) => {
          if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
          const clean = normalize(token);
          const isTarget = clean === target;
          const isPlaying = playing === clean;
          return (
            <button
              key={i}
              onClick={() => speakWord(token)}
              title={`Escuchar "${clean}"`}
              className={`
                inline rounded-md px-0.5 transition-colors cursor-pointer align-baseline
                ${isTarget
                  ? 'font-bold text-[#F57C00] bg-orange-50 border-b-2 border-[#F57C00]'
                  : 'font-medium text-zinc-700 border-b-2 border-transparent hover:border-zinc-300'}
                ${isPlaying ? 'bg-orange-100 border-b-2 border-[#F57C00]' : ''}
              `}
            >
              {token}
            </button>
          );
        })}
      </p>

      {(isTTSAvailable() || week) && (
        <div className="flex gap-2">
          <button
            onClick={() => speakSentence(false)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
              ${playing === 'sentence'
                ? 'bg-[#F57C00] border-[#F57C00] text-white'
                : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-[#F57C00] hover:text-[#F57C00]'}
            `}
          >
            {playing === 'sentence' ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
            Oración completa
          </button>
          <button
            onClick={() => speakSentence(true)}
            title="Velocidad lenta para practicar"
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
              ${playing === 'slow'
                ? 'bg-[#F57C00] border-[#F57C00] text-white'
                : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-[#F57C00] hover:text-[#F57C00]'}
            `}
          >
            {playing === 'slow' ? <Loader2 size={14} className="animate-spin" /> : <Turtle size={14} />}
            Lenta
          </button>
        </div>
      )}
    </div>
  );
};
