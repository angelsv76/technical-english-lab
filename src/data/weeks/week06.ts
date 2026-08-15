import { WeekData } from '../../types';

export const week06: WeekData = {
  week: 6,
  title: "File Management Actions",
  objective: "Aprender acciones para gestionar archivos",
  introText: "Gestionar archivos implica moverlos, renombrarlos y organizarlos en el sistema.",
  keywords: ["Rename", "Move", "Upload", "Refresh", "Sort"],
  vocabulary: [
    {
      word: "Rename",
      meaning: "Cambiar el nombre de un archivo",
      example: "Rename the file to 'data.txt'",
      context: "Action",
      phonetic: "/riːˈneɪm/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week06/rename.mp3"
    },
    {
      word: "Move",
      meaning: "Mover un archivo a otra ubicación",
      example: "Move the folder to Desktop",
      context: "Action",
      phonetic: "/muːv/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week06/move.mp3"
    },
    {
      word: "Upload",
      meaning: "Subir archivos a la nube o servidor",
      example: "Upload the report",
      context: "Action",
      phonetic: "/ˈʌploʊd/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week06/upload.mp3"
    },
    {
      word: "Refresh",
      meaning: "Actualizar la vista o contenido",
      example: "Refresh the page",
      context: "Action",
      phonetic: "/rɪˈfrɛʃ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week06/refresh.mp3"
    },
    {
      word: "Sort",
      meaning: "Ordenar elementos por criterios",
      example: "Sort by date",
      context: "Action",
      phonetic: "/sɔːrt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week06/sort.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-031"
  },
  practice: [
    {
      question: "¿Qué significa Rename?",
      options: ["Borrar", "Renombrar", "Mover", "Copiar"],
      answer: "Renombrar"
    },
    {
      question: "Para enviar un archivo a internet usas:",
      options: ["Download", "Upload", "Refresh", "Sort"],
      answer: "Upload"
    },
    {
      question: "Si la página no carga bien, presionas:",
      options: ["Sort", "Move", "Refresh", "Rename"],
      answer: "Refresh"
    }
  ],
  evaluation: [
    {
      question: "Rename significa:",
      options: ["Cambiar nombre", "Borrar nombre", "Copiar nombre", "Mover nombre"],
      answer: "Cambiar nombre"
    },
    {
      question: "Move significa:",
      options: ["Copiar", "Mover", "Eliminar", "Abrir"],
      answer: "Mover"
    },
    {
      question: "Upload significa:",
      options: ["Bajar", "Subir", "Cerrar", "Guardar"],
      answer: "Subir"
    },
    {
      question: "Refresh significa:",
      options: ["Cerrar", "Actualizar", "Guardar", "Borrar"],
      answer: "Actualizar"
    },
    {
      question: "Sort significa:",
      options: ["Ordenar", "Buscar", "Filtrar", "Eliminar"],
      answer: "Ordenar"
    },
    {
      question: "Identify the action: 'Upload the image'",
      options: ["Upload", "The", "Image", "Rename"],
      answer: "Upload"
    },
    {
      question: "Identify the criteria: 'Sort by name'",
      options: ["Sort", "By", "Name", "Refresh"],
      answer: "Name"
    },
    {
      question: "¿Cuál es el opuesto de Upload?",
      options: ["Download", "Refresh", "Rename", "Move"],
      answer: "Download"
    },
    {
      question: "To change a file's location is to:",
      options: ["Rename it", "Move it", "Sort it", "Refresh it"],
      answer: "Move it"
    },
    {
      question: "The F5 key is usually for:",
      options: ["Rename", "Refresh", "Sort", "Move"],
      answer: "Refresh"
    }
  ],
  active: true
};
