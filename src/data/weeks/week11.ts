import { WeekData } from '../../types';

export const week11: WeekData = {
  week: 11,
  title: "Technical Instructions I",
  objective: "Seguir instrucciones técnicas simples",
  introText: "Las instrucciones técnicas suelen utilizar el modo imperativo para guiar al usuario en tareas específicas.",
  keywords: ["Click", "Double-click", "Right-click", "Drag", "Drop"],
  vocabulary: [
    {
      word: "Click",
      meaning: "Presionar el botón del mouse",
      example: "Click the icon",
      context: "Action",
      phonetic: "/klɪk/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week11/click.wav"
    },
    {
      word: "Double-click",
      meaning: "Presionar dos veces rápido",
      example: "Double-click to open",
      context: "Action",
      phonetic: "/ˈdʌbəl klɪk/", 
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week11/double-click.wav"
    },  
    {
      word: "Right-click",
      meaning: "Presionar el botón derecho",
      example: "Right-click for options",
      context: "Action",
      phonetic: "/ˈraɪt klɪk/", 
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week11/right-click.wav"
    },
    {
      word: "Drag",
      meaning: "Arrastrar un elemento",
      example: "Drag the file",
      context: "Action",
      phonetic: "/dræɡ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week11/drag.wav"
    },
    {
      word: "Drop",
      meaning: "Soltar un elemento arrastrado",
      example: "Drop it in the folder",
      context: "Action",
      phonetic: "/drɑːp/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week11/drop.wav"
    }
  ],
  simulation: {
    simulationId: "SIM-003"
  },
  practice: [
    {
      question: "¿Qué significa Drag?",
      options: ["Soltar", "Arrastrar", "Presionar", "Cerrar"],
      answer: "Arrastrar"
    },
    {
      question: "Para ver el menú contextual usas:",
      options: ["Click", "Double-click", "Right-click", "Drag"],
      answer: "Right-click"
    },
    {
      question: "La acción de mover y soltar se llama:",
      options: ["Drag and Drop", "Click and Save", "Copy and Paste", "Open and Close"],
      answer: "Drag and Drop"
    }
  ],
  evaluation: [
    {
      question: "Click significa:",
      options: ["Presionar", "Soltar", "Arrastrar", "Borrar"],
      answer: "Presionar"
    },
    {
      question: "Double-click se usa comúnmente para:",
      options: ["Abrir archivos", "Borrar archivos", "Mover archivos", "Cerrar sesión"],
      answer: "Abrir archivos"
    },
    {
      question: "Right-click abre el:",
      options: ["Menú principal", "Menú contextual", "Navegador", "Editor"],
      answer: "Menú contextual"
    },
    {
      question: "Drag significa:",
      options: ["Arrastrar", "Soltar", "Copiar", "Pegar"],
      answer: "Arrastrar"
    },
    {
      question: "Drop significa:",
      options: ["Arrastrar", "Soltar", "Copiar", "Pegar"],
      answer: "Soltar"
    },
    {
      question: "Identify the action: 'Right-click on the desktop'",
      options: ["Right-click", "On", "The", "Desktop"],
      answer: "Right-click"
    },
    {
      question: "Identify the object: 'Drag the selected item'",
      options: ["Drag", "The", "Selected", "Item"],
      answer: "Item"
    },
    {
      question: "¿Qué significa 'Left-click'?",
      options: ["Click derecho", "Click izquierdo", "Doble click", "Arrastrar"],
      answer: "Click izquierdo"
    },
    {
      question: "To move a window, you usually:",
      options: ["Click it", "Drag it", "Double-click it", "Right-click it"],
      answer: "Drag it"
    },
    {
      question: "The instruction 'Drop the file here' means:",
      options: ["Suelta el archivo aquí", "Arrastra el archivo aquí", "Copia el archivo aquí", "Borra el archivo aquí"],
      answer: "Suelta el archivo aquí"
    }
  ],
  active: true
};
