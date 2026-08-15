/**
 * Texto-a-voz en inglés usando la Web Speech API del navegador.
 * Gratis, sin llamadas a servidores ni consumo de datos móviles.
 */

export const isTTSAvailable = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

function getEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang === 'en-US' && v.localService) ||
    voices.find(v => v.lang === 'en-US') ||
    voices.find(v => v.lang.startsWith('en')) ||
    null
  );
}

// Algunos navegadores cargan las voces de forma asíncrona
if (isTTSAvailable()) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

export interface SpeakOptions {
  rate?: number;       // 1 = normal, 0.6 = lenta para dictado/práctica
  onEnd?: () => void;
}

/**
 * Pronuncia el texto en inglés. Cancela cualquier lectura anterior.
 */
export function speakEnglish(text: string, { rate = 0.9, onEnd }: SpeakOptions = {}): boolean {
  if (!isTTSAvailable() || !text.trim()) {
    onEnd?.();
    return false;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  const voice = getEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  } else {
    // Sin voz de inglés instalada el sistema usará la voz por defecto (posiblemente
    // en español). En Windows: Configuración > Hora e idioma > Voz > Agregar voces.
    console.warn('TTS: no hay voz de inglés instalada; la pronunciación puede no ser correcta.');
  }
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (isTTSAvailable()) window.speechSynthesis.cancel();
}
