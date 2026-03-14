import { WeekData } from '../../types';

export const week14: WeekData = {
  week: 14,
  title: "Technical Instructions IV",
  objective: "Entender instrucciones de selección y marcado",
  introText: "Seleccionar y marcar elementos es una tarea constante en cualquier flujo de trabajo digital.",
  keywords: ["Select", "Deselect", "Check", "Uncheck", "Highlight"],
  vocabulary: [
    {
      word: "Select",
      meaning: "Seleccionar uno o varios elementos",
      example: "Select all files",
      context: "Action"
    },
    {
      word: "Deselect",
      meaning: "Desmarcar o quitar la selección",
      example: "Deselect the image",
      context: "Action"
    },
    {
      word: "Check",
      meaning: "Marcar una casilla (poner el gancho)",
      example: "Check the box",
      context: "Action"
    },
    {
      word: "Uncheck",
      meaning: "Desmarcar una casilla",
      example: "Uncheck the option",
      context: "Action"
    },
    {
      word: "Highlight",
      meaning: "Resaltar o subrayar texto/elementos",
      example: "Highlight the keywords",
      context: "Action"
    }
  ],
  simulation: {
    simulationId: "SIM-023"
  },
  practice: [
    {
      question: "¿Qué significa Select?",
      options: ["Borrar", "Seleccionar", "Mover", "Cerrar"],
      answer: "Seleccionar"
    },
    {
      question: "Para marcar una casilla de verificación usas:",
      options: ["Check", "Uncheck", "Select", "Highlight"],
      answer: "Check"
    },
    {
      question: "Si quieres resaltar una línea de código importante, haces:",
      options: ["Deselect", "Highlight", "Check", "Uncheck"],
      answer: "Highlight"
    }
  ],
  evaluation: [
    {
      question: "Select significa:",
      options: ["Seleccionar", "Borrar", "Ignorar", "Ocultar"],
      answer: "Seleccionar"
    },
    {
      question: "Deselect significa:",
      options: ["Seleccionar", "Desmarcar", "Eliminar", "Copiar"],
      answer: "Desmarcar"
    },
    {
      question: "Check significa:",
      options: ["Marcar", "Desmarcar", "Borrar", "Guardar"],
      answer: "Marcar"
    },
    {
      question: "Uncheck significa:",
      options: ["Marcar", "Desmarcar", "Borrar", "Guardar"],
      answer: "Desmarcar"
    },
    {
      question: "Highlight significa:",
      options: ["Resaltar", "Ocultar", "Borrar", "Cerrar"],
      answer: "Resaltar"
    },
    {
      question: "Identify the action: 'Select the text'",
      options: ["Select", "The", "Text", "Check"],
      answer: "Select"
    },
    {
      question: "Identify the object: 'Check the checkbox'",
      options: ["Check", "The", "Checkbox", "Uncheck"],
      answer: "Checkbox"
    },
    {
      question: "¿Cuál es el opuesto de Select?",
      options: ["Deselect", "Check", "Uncheck", "Highlight"],
      answer: "Deselect"
    },
    {
      question: "To 'Highlight' a syntax error means:",
      options: ["Resaltar un error", "Borrar un error", "Ignorar un error", "Crear un error"],
      answer: "Resaltar un error"
    },
    {
      question: "The instruction 'Select all' usually uses:",
      options: ["Ctrl+A", "Ctrl+S", "Ctrl+D", "Ctrl+F"],
      answer: "Ctrl+A"
    }
  ],
  active: true
};
