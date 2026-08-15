import { WeekData } from '../../types';

export const week23: WeekData = {
  week: 23,
  title: "Sequential Processes III",
  objective: "Entender instrucciones de navegación temporal",
  introText: "Navegar por los pasos de un asistente (Wizard) requiere entender comandos de dirección temporal.",
  keywords: ["Next", "Previous", "Back", "Forward", "Skip"],
  vocabulary: [
    {
      word: "Next",
      meaning: "Siguiente paso",
      example: "Click Next to continue",
      context: "Navigation",
      phonetic: "/nɛkst/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week23/next.mp3"
    },
    {
      word: "Previous",
      meaning: "Paso anterior",
      example: "Go to the previous page",
      context: "Navigation",
      phonetic: "/ˈpriːviəs/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week23/previous.mp3"
    },
    {
      word: "Back",
      meaning: "Atrás",
      example: "Go back to the menu",
      context: "Navigation",
      phonetic: "/bæk/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week23/back.mp3"
    },
    {
      word: "Forward",
      meaning: "Adelante",
      example: "Move forward in the process",
      context: "Navigation",
      phonetic: "/ˈfɔːrwərd/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week23/forward.mp3"
    },
    {
      word: "Skip",
      meaning: "Omitir o saltar",
      example: "Skip the tutorial",
      context: "Action",
      phonetic: "/skɪp/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week23/skip.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-007"
  },
  practice: [
    {
      question: "¿Qué significa Next?",
      options: ["Atrás", "Siguiente", "Cerrar", "Borrar"],
      answer: "Siguiente"
    },
    {
      question: "Para volver al paso anterior usas:",
      options: ["Next", "Previous", "Skip", "Forward"],
      answer: "Previous"
    },
    {
      question: "Si no quieres ver el tutorial, eliges:",
      options: ["Next", "Back", "Skip", "Forward"],
      answer: "Skip"
    }
  ],
  evaluation: [
    {
      question: "Next significa:",
      options: ["Siguiente", "Anterior", "Primero", "Último"],
      answer: "Siguiente"
    },
    {
      question: "Previous significa:",
      options: ["Siguiente", "Anterior", "Primero", "Último"],
      answer: "Anterior"
    },
    {
      question: "Back significa:",
      options: ["Atrás", "Adelante", "Arriba", "Abajo"],
      answer: "Atrás"
    },
    {
      question: "Forward significa:",
      options: ["Atrás", "Adelante", "Arriba", "Abajo"],
      answer: "Adelante"
    },
    {
      question: "Skip significa:",
      options: ["Omitir / Saltar", "Guardar", "Cerrar", "Abrir"],
      answer: "Omitir / Saltar"
    },
    {
      question: "Identify the action: 'Click Next to proceed'",
      options: ["Click", "Next", "Proceed", "Back"],
      answer: "Next"
    },
    {
      question: "Identify the direction: 'Go Back to the previous step'",
      options: ["Go", "Back", "Previous", "Step"],
      answer: "Back"
    },
    {
      question: "¿Qué significa 'Step-by-step'?",
      options: ["Paso a paso", "Rápido", "Sin pasos", "Lento"],
      answer: "Paso a paso"
    },
    {
      question: "The 'Back button' in a browser goes to the:",
      options: ["Last page", "Next page", "Home page", "Error page"],
      answer: "Last page"
    },
    {
      question: "To 'Skip the intro' means:",
      options: ["Saltar la introducción", "Ver la introducción", "Borrar la introducción", "Cerrar la app"],
      answer: "Saltar la introducción"
    }
  ],
  active: true
};
