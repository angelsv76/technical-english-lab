import { WeekData } from '../../types';

export const week15: WeekData = {
  week: 15,
  title: "Technical Instructions V",
  objective: "Entender instrucciones de búsqueda y filtrado",
  introText: "Encontrar información en grandes volúmenes de datos requiere el uso de filtros y búsquedas.",
  keywords: ["Find", "Filter", "Replace", "Match", "Query"],
  vocabulary: [
    {
      word: "Find",
      meaning: "Encontrar un término o archivo",
      example: "Find the error",
      context: "Action",
      phonetic: "/faɪnd/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week15/find.mp3"
    },
    {
      word: "Filter",
      meaning: "Filtrar resultados por criterios",
      example: "Filter by category",
      context: "Action",
      phonetic: "/ˈfɪltər/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week15/filter.mp3"
    },
    {
      word: "Replace",
      meaning: "Reemplazar un texto por otro",
      example: "Find and replace",
      context: "Action",
      phonetic: "/rɪˈpleɪs/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week15/replace.mp3"
    },
    {
      word: "Match",
      meaning: "Coincidir o encontrar una coincidencia",
      example: "Case sensitive match",
      context: "Action",
      phonetic: "/mætʃ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week15/match.mp3"
    },
    {
      word: "Query",
      meaning: "Consulta a una base de datos",
      example: "Run the SQL query",
      context: "Data",
      phonetic: "/ˈkwɪri/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week15/query.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-011"
  },
  practice: [
    {
      question: "¿Qué significa Find?",
      options: ["Perder", "Encontrar", "Borrar", "Mover"],
      answer: "Encontrar"
    },
    {
      question: "Para cambiar todas las palabras 'error' por 'warning' usas:",
      options: ["Find", "Replace", "Filter", "Match"],
      answer: "Replace"
    },
    {
      question: "Una búsqueda en una base de datos es una:",
      options: ["Query", "Filter", "Match", "Find"],
      answer: "Query"
    }
  ],
  evaluation: [
    {
      question: "Find significa:",
      options: ["Encontrar", "Perder", "Cerrar", "Abrir"],
      answer: "Encontrar"
    },
    {
      question: "Filter significa:",
      options: ["Filtrar", "Mezclar", "Borrar", "Guardar"],
      answer: "Filtrar"
    },
    {
      question: "Replace significa:",
      options: ["Reemplazar", "Repetir", "Regresar", "Revisar"],
      answer: "Reemplazar"
    },
    {
      question: "Match significa:",
      options: ["Coincidir", "Diferir", "Ignorar", "Ocultar"],
      answer: "Coincidir"
    },
    {
      question: "Query significa:",
      options: ["Consulta", "Respuesta", "Error", "Aviso"],
      answer: "Consulta"
    },
    {
      question: "Identify the action: 'Find the specific line'",
      options: ["Find", "The", "Specific", "Line"],
      answer: "Find"
    },
    {
      question: "Identify the object: 'Run the database query'",
      options: ["Run", "Database", "Query", "Filter"],
      answer: "Query"
    },
    {
      question: "¿Qué significa 'Case sensitive'?",
      options: ["Sensible a mayúsculas", "Sensible al mouse", "Sensible al teclado", "Sensible al brillo"],
      answer: "Sensible a mayúsculas"
    },
    {
      question: "To 'Filter the results' means:",
      options: ["Filtrar los resultados", "Borrar los resultados", "Mostrar todo", "Cerrar la app"],
      answer: "Filtrar los resultados"
    },
    {
      question: "The shortcut Ctrl+F is for:",
      options: ["Find", "Filter", "Finish", "File"],
      answer: "Find"
    }
  ],
  active: true
};
