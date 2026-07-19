import { WeekData } from '../../types';

export const week25: WeekData = {
  week: 25,
  title: "Sequential Processes V",
  objective: "Entender instrucciones de guardado y salida",
  introText: "Asegurar que el trabajo esté guardado antes de salir es una de las reglas de oro en informática.",
  keywords: ["Save", "Exit", "Quit", "Discard", "Apply"],
  vocabulary: [
    {
      word: "Save",
      meaning: "Guardar los cambios",
      example: "Save your work",
      context: "Action",
      phonetic: "/seɪv/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week25/save.mp3"
    },
    {
      word: "Exit",
      meaning: "Salir de un programa o ventana",
      example: "Exit the application",
      context: "Action",
      phonetic: "/ˈɛɡzɪt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week25/exit.mp3"
    },
    {
      word: "Quit",
      meaning: "Cerrar o abandonar (fuerza el cierre)",
      example: "Quit the editor",
      context: "Action",
      phonetic: "/kwɪt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week25/quit.mp3"
    },
    {
      word: "Discard",
      meaning: "Descartar o no guardar cambios",
      example: "Discard changes",
      context: "Action",
      phonetic: "/dɪsˈkɑːrd/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week25/discard.mp3"
    },
    {
      word: "Apply",
      meaning: "Aplicar cambios sin cerrar",
      example: "Apply the settings",
      context: "Action",
      phonetic: "/əˈplaɪ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week25/apply.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-003"
  },
  practice: [
    {
      question: "¿Qué significa Save?",
      options: ["Borrar", "Guardar", "Cerrar", "Abrir"],
      answer: "Guardar"
    },
    {
      question: "Si no quieres guardar lo que hiciste, eliges:",
      options: ["Save", "Apply", "Discard", "Exit"],
      answer: "Discard"
    },
    {
      question: "Para cerrar definitivamente un programa usas:",
      options: ["Save", "Apply", "Quit", "Discard"],
      answer: "Quit"
    }
  ],
  evaluation: [
    {
      question: "Save significa:",
      options: ["Guardar", "Borrar", "Mover", "Copiar"],
      answer: "Guardar"
    },
    {
      question: "Exit significa:",
      options: ["Salir", "Entrar", "Subir", "Bajar"],
      answer: "Salir"
    },
    {
      question: "Quit significa:",
      options: ["Cerrar / Abandonar", "Continuar", "Esperar", "Aumentar"],
      answer: "Cerrar / Abandonar"
    },
    {
      question: "Discard significa:",
      options: ["Descartar", "Guardar", "Unir", "Dividir"],
      answer: "Descartar"
    },
    {
      question: "Apply significa:",
      options: ["Aplicar", "Borrar", "Ignorar", "Ocultar"],
      answer: "Aplicar"
    },
    {
      question: "Identify the action: 'Save the changes before Exit'",
      options: ["Save", "Changes", "Before", "Exit"],
      answer: "Save"
    },
    {
      question: "Identify the choice: 'Discard the draft'",
      options: ["Discard", "The", "Draft", "Save"],
      answer: "Discard"
    },
    {
      question: "¿Qué significa 'Auto-save'?",
      options: ["Guardado automático", "Guardado manual", "No guardar", "Borrado automático"],
      answer: "Guardado automático"
    },
    {
      question: "To 'Quit without saving' means:",
      options: ["Cerrar sin guardar", "Guardar y cerrar", "Guardar sin cerrar", "No cerrar"],
      answer: "Cerrar sin guardar"
    },
    {
      question: "The 'Apply button' usually:",
      options: ["Saves changes but keeps the window open", "Closes the window", "Deletes everything", "Restarts the computer"],
      answer: "Saves changes but keeps the window open"
    }
  ],
  active: true
};
