import { WeekData } from '../../types';

export const week01: WeekData = {
  week: 1,
  title: "Technical words on the computer",
  objective: "Reconocer palabras técnicas en la computadora",
  introText: "Las interfaces del software utilizan muchas palabras en inglés que son fundamentales para navegar y operar cualquier sistema.",
  keywords: ["Search", "Settings", "Download", "File", "Error"],
  vocabulary: [
    {
      word: "Search",
      meaning: "Buscar información en el sistema",
      example: "Search the file",
      context: "Interface",
      phonetic: "/sɜːrtʃ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week01/search.mp3"
    },
    {
      word: "Settings",
      meaning: "Configuraciones del sistema",
      example: "Go to settings",
      context: "Interface",
      phonetic: "/ˈsɛtɪŋz/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week01/settings.mp3"
    },
    {
      word: "Download",
      meaning: "Descargar archivos de internet",
      example: "Download the app",
      context: "Action",
      phonetic: "/ˈdaʊnloʊd/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week01/download.mp3"
    },
    {
      word: "File",
      meaning: "Archivo digital",
      example: "Open the file",
      context: "Storage",
      phonetic: "/faɪl/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week01/file.mp3"
    },
    {
      word: "Error",
      meaning: "Fallo o problema en el sistema",
      example: "System error",
      context: "System",
      phonetic: "/ˈɛrər/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week01/error.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-011"
  },
  practice: [
    {
      question: "¿Qué significa Search?",
      options: ["Buscar", "Guardar", "Eliminar", "Cerrar"],
      answer: "Buscar"
    },
    {
      question: "Si quieres cambiar el idioma de la app, vas a:",
      options: ["Download", "Settings", "Search", "File"],
      answer: "Settings"
    },
    {
      question: "Un documento guardado en la computadora es un:",
      options: ["Error", "File", "Search", "Download"],
      answer: "File"
    }
  ],
  evaluation: [
    {
      question: "¿Qué significa Download?",
      options: ["Descargar", "Eliminar", "Cerrar", "Guardar"],
      answer: "Descargar"
    },
    {
      question: "Settings se traduce como:",
      options: ["Configuraciones", "Archivos", "Búsquedas", "Errores"],
      answer: "Configuraciones"
    },
    {
      question: "Si el programa deja de funcionar, muestra un:",
      options: ["Search", "File", "Error", "Download"],
      answer: "Error"
    },
    {
      question: "Para encontrar un documento usas la función:",
      options: ["Settings", "Search", "Download", "Error"],
      answer: "Search"
    },
    {
      question: "File se refiere a:",
      options: ["Un archivo", "Una descarga", "Una búsqueda", "Un ajuste"],
      answer: "Un archivo"
    },
    {
      question: "Identify the action: 'Search the database'",
      options: ["Database", "Search", "The", "File"],
      answer: "Search"
    },
    {
      question: "Identify the object: 'Download the driver'",
      options: ["Download", "The", "Driver", "Search"],
      answer: "Driver"
    },
    {
      question: "¿Cuál es el opuesto de Download?",
      options: ["Upload", "Search", "Settings", "File"],
      answer: "Upload"
    },
    {
      question: "Settings is usually represented by an icon of a:",
      options: ["Magnifying glass", "Gear", "Folder", "Trash can"],
      answer: "Gear"
    },
    {
      question: "A 'corrupted file' is a file with an:",
      options: ["Error", "Update", "Icon", "Extension"],
      answer: "Error"
    }
  ],
  active: true
};
