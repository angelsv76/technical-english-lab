import { WeekData } from '../../types';

export const week29: WeekData = {
  week: 29,
  title: "System Messages II",
  objective: "Identificar errores y fallos críticos",
  introText: "Entender los mensajes de error es el primer paso para solucionar problemas técnicos.",
  keywords: ["Error", "Failure", "Fault", "Bug", "Crash"],
  vocabulary: [
    {
      word: "Error",
      meaning: "Error o equivocación",
      example: "Syntax error",
      context: "System",
      phonetic: "/ˈɛrər/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week29/error.mp3"
    },
    {
      word: "Failure",
      meaning: "Fallo o fracaso de un proceso",
      example: "System failure",
      context: "System",
      phonetic: "/ˈfeɪljər/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week29/failure.mp3"
    },
    {
      word: "Fault",
      meaning: "Falla técnica o defecto",
      example: "Hardware fault",
      context: "System",
      phonetic: "/fɔːlt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week29/fault.mp3"
    },
    {
      word: "Bug",
      meaning: "Error de programación (bicho)",
      example: "Fix the bug",
      context: "Development",
      phonetic: "/bʌɡ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week29/bug.mp3"
    },
    {
      word: "Crash",
      meaning: "Cierre inesperado o colapso",
      example: "The app crashed",
      context: "System",
      phonetic: "/kræʃ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week29/crash.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-010"
  },
  practice: [
    {
      question: "¿Qué significa Bug?",
      options: ["Mejora", "Error de código", "Imagen", "Virus"],
      answer: "Error de código"
    },
    {
      question: "Si la aplicación se cierra de repente, hubo un:",
      options: ["Crash", "Success", "Update", "Save"],
      answer: "Crash"
    },
    {
      question: "Un fallo total del sistema es un:",
      options: ["Error", "Failure", "Bug", "Notice"],
      answer: "Failure"
    }
  ],
  evaluation: [
    {
      question: "Error significa:",
      options: ["Error", "Acierto", "Ayuda", "Guía"],
      answer: "Error"
    },
    {
      question: "Failure significa:",
      options: ["Fallo / Fracaso", "Éxito", "Inicio", "Avance"],
      answer: "Fallo / Fracaso"
    },
    {
      question: "Fault significa:",
      options: ["Falla / Defecto", "Virtud", "Mejora", "Cambio"],
      answer: "Falla / Defecto"
    },
    {
      question: "Bug se refiere a:",
      options: ["Un error en el código", "Un virus externo", "Un usuario nuevo", "Un teclado roto"],
      answer: "Un error en el código"
    },
    {
      question: "Crash significa:",
      options: ["Colapso / Cierre inesperado", "Apertura rápida", "Guardado lento", "Borrado seguro"],
      answer: "Colapso / Cierre inesperado"
    },
    {
      question: "Identify the problem: 'The system experienced a critical Failure'",
      options: ["System", "Critical", "Failure", "Experienced"],
      answer: "Failure"
    },
    {
      question: "Identify the action: 'Debug the code to find the Bug'",
      options: ["Debug", "Code", "Find", "Bug"],
      answer: "Bug"
    },
    {
      question: "¿Qué significa 'Error code'?",
      options: ["Código de error (ej. 404)", "Código de barras", "Código secreto", "Código fuente"],
      answer: "Código de error (ej. 404)"
    },
    {
      question: "A 'Fatal error' is an error that:",
      options: ["Stops the program", "Is very small", "Is funny", "Is blue"],
      answer: "Stops the program"
    },
    {
      question: "To 'Report a bug' means:",
      options: ["Reportar un error", "Crear un error", "Ignorar un error", "Borrar un error"],
      answer: "Reportar un error"
    }
  ],
  active: true
};
