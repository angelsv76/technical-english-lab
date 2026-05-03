import React, { useState, useRef } from 'react';
import { Volume2, Loader2 } from 'lucide-react';

interface VocabularyAudioProps {
  word: string;
  phonetic?: string;
  audioUrl?: string;
}

export const VocabularyAudio: React.FC<VocabularyAudioProps> = ({ 
  word, 
  phonetic, 
  audioUrl 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async () => {
    if (!audioUrl) return;

    try {
      setIsLoading(true);

      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });

        audioRef.current.addEventListener('canplay', () => {
          setIsLoading(false);
        });

        audioRef.current.addEventListener('error', () => {
          setIsLoading(false);
          setIsPlaying(false);
          console.error(`Error loading audio for "${word}"`);
        });
      }

      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(`Error playing audio for "${word}":`, error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  if (!phonetic && !audioUrl) return null;

  return (
    <div className="flex items-center gap-3 mt-2">
      {phonetic && (
        <span className="text-sm text-zinc-500 font-mono bg-white px-3 py-1.5 rounded-lg border border-zinc-200">
          {phonetic}
        </span>
      )}
      
      {audioUrl && (
        <button
          onClick={playAudio}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg border
            transition-all duration-200
            ${isPlaying 
              ? 'bg-[#F57C00] border-[#F57C00] text-white' 
              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-[#F57C00] hover:text-[#F57C00]'
            }
            ${isLoading ? 'opacity-50 cursor-wait' : ''}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`Play pronunciation of ${word}`}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Volume2 size={16} />
          )}
          <span className="text-xs font-medium">
            {isPlaying ? 'Playing...' : 'Listen'}
          </span>
        </button>
      )}
    </div>
  );
};
