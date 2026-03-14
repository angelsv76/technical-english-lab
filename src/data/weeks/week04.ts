import { WeekData } from '../../types';

export const week04: WeekData = {
  week: 4,
  title: "Software Actions II",
  objective: "Aprender verbos de procesamiento y gestión",
  introText: "Más allá de las acciones básicas, existen procesos de gestión de datos y archivos.",
  keywords: ["Copy", "Paste", "Cut", "Undo", "Redo"],
  vocabulary: [
    {
      word: "Copy",
      meaning: "Copiar un elemento al portapapeles",
      example: "Copy the text",
      context: "Action"
    },
    {
      word: "Paste",
      meaning: "Pegar el contenido del portapapeles",
      example: "Paste the image",
      context: "Action"
    },
    {
      word: "Cut",
      meaning: "Cortar (mover) un elemento",
      example: "Cut the file",
      context: "Action"
    },
    {
      word: "Undo",
      meaning: "Deshacer la última acción",
      example: "Undo the deletion",
      context: "Action"
    },
    {
      word: "Redo",
      meaning: "Rehacer la acción deshecha",
      example: "Redo the changes",
      context: "Action"
    }
  ],
  simulation: {
    simulationId: "SIM-012"
  },
  practice: [
    {
      question: "¿Qué significa Paste?",
      options: ["Copiar", "Pegar", "Cortar", "Deshacer"],
      answer: "Pegar"
    },
    {
      question: "Si cometiste un error y quieres volver atrás usas:",
      options: ["Redo", "Undo", "Copy", "Cut"],
      answer: "Undo"
    },
    {
      question: "Para duplicar un archivo usas primero:",
      options: ["Cut", "Copy", "Undo", "Paste"],
      answer: "Copy"
    }
  ],
  evaluation: [
    {
      question: "Copy significa:",
      options: ["Copiar", "Pegar", "Cortar", "Borrar"],
      answer: "Copiar"
    },
    {
      question: "Paste significa:",
      options: ["Copiar", "Pegar", "Cortar", "Borrar"],
      answer: "Pegar"
    },
    {
      question: "Cut significa:",
      options: ["Copiar", "Pegar", "Cortar", "Borrar"],
      answer: "Cortar"
    },
    {
      question: "Undo significa:",
      options: ["Deshacer", "Rehacer", "Copiar", "Pegar"],
      answer: "Deshacer"
    },
    {
      question: "Redo significa:",
      options: ["Deshacer", "Rehacer", "Copiar", "Pegar"],
      answer: "Rehacer"
    },
    {
      question: "Identify the action: 'Paste the code here'",
      options: ["Paste", "The", "Code", "Here"],
      answer: "Paste"
    },
    {
      question: "Identify the object: 'Cut the selected area'",
      options: ["Cut", "The", "Selected", "Area"],
      answer: "Area"
    },
    {
      question: "¿Cuál es el atajo para Undo?",
      options: ["Ctrl+C", "Ctrl+V", "Ctrl+Z", "Ctrl+X"],
      answer: "Ctrl+Z"
    },
    {
      question: "To move a file, you use:",
      options: ["Copy & Paste", "Cut & Paste", "Undo & Redo", "Delete & Save"],
      answer: "Cut & Paste"
    },
    {
      question: "Redo is the opposite of:",
      options: ["Undo", "Copy", "Paste", "Cut"],
      answer: "Undo"
    }
  ],
  active: true
};
