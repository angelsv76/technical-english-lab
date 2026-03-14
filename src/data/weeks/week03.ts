import { WeekData } from '../../types';

export const week03: WeekData = {
  week: 3,
  title: "Software Actions I",
  objective: "Identificar verbos de acción comunes en software",
  introText: "Los verbos describen las acciones que el usuario o el sistema realizan sobre los datos.",
  keywords: ["Save", "Open", "Close", "Edit", "Delete"],
  vocabulary: [
    {
      word: "Save",
      meaning: "Guardar los cambios",
      example: "Save your work",
      context: "Action"
    },
    {
      word: "Open",
      meaning: "Abrir un archivo o programa",
      example: "Open the document",
      context: "Action"
    },
    {
      word: "Close",
      meaning: "Cerrar una ventana o archivo",
      example: "Close the window",
      context: "Action"
    },
    {
      word: "Edit",
      meaning: "Modificar contenido existente",
      example: "Edit the profile",
      context: "Action"
    },
    {
      word: "Delete",
      meaning: "Eliminar o borrar un elemento",
      example: "Delete the folder",
      context: "Action"
    }
  ],
  simulation: {
    simulationId: "SIM-001"
  },
  practice: [
    {
      question: "¿Qué significa Save?",
      options: ["Cerrar", "Guardar", "Abrir", "Editar"],
      answer: "Guardar"
    },
    {
      question: "Para modificar un texto usas:",
      options: ["Delete", "Edit", "Close", "Save"],
      answer: "Edit"
    },
    {
      question: "Si quieres quitar un archivo para siempre usas:",
      options: ["Open", "Save", "Delete", "Edit"],
      answer: "Delete"
    }
  ],
  evaluation: [
    {
      question: "Save se traduce como:",
      options: ["Guardar", "Cerrar", "Abrir", "Borrar"],
      answer: "Guardar"
    },
    {
      question: "Open significa:",
      options: ["Cerrar", "Abrir", "Editar", "Guardar"],
      answer: "Abrir"
    },
    {
      question: "Close significa:",
      options: ["Cerrar", "Abrir", "Editar", "Guardar"],
      answer: "Cerrar"
    },
    {
      question: "Edit significa:",
      options: ["Borrar", "Editar", "Guardar", "Cerrar"],
      answer: "Editar"
    },
    {
      question: "Delete significa:",
      options: ["Guardar", "Abrir", "Cerrar", "Eliminar"],
      answer: "Eliminar"
    },
    {
      question: "Identify the action: 'Save the changes'",
      options: ["Save", "The", "Changes", "Edit"],
      answer: "Save"
    },
    {
      question: "Identify the object: 'Close the application'",
      options: ["Close", "The", "Application", "Open"],
      answer: "Application"
    },
    {
      question: "¿Cuál es el opuesto de Open?",
      options: ["Save", "Close", "Edit", "Delete"],
      answer: "Close"
    },
    {
      question: "To 'Discard' is similar to:",
      options: ["Save", "Delete", "Open", "Edit"],
      answer: "Delete"
    },
    {
      question: "The shortcut Ctrl+S is for:",
      options: ["Save", "Search", "Select", "Settings"],
      answer: "Save"
    }
  ],
  active: true
};
