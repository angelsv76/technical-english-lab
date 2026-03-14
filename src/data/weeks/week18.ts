import { WeekData } from '../../types';

export const week18: WeekData = {
  week: 18,
  title: "Input Elements",
  objective: "Identificar elementos de entrada de datos",
  introText: "Los elementos de entrada permiten al usuario enviar información al sistema de diversas formas.",
  keywords: ["Input", "Checkbox", "Radio Button", "Dropdown", "Textarea"],
  vocabulary: [
    {
      word: "Input",
      meaning: "Campo de entrada de texto",
      example: "Enter your name in the input",
      context: "Interface"
    },
    {
      word: "Checkbox",
      meaning: "Casilla de verificación (múltiple opción)",
      example: "Check the boxes that apply",
      context: "Interface"
    },
    {
      word: "Radio Button",
      meaning: "Botón de opción única",
      example: "Select one radio button",
      context: "Interface"
    },
    {
      word: "Dropdown",
      meaning: "Menú desplegable de selección",
      example: "Select your country from the dropdown",
      context: "Interface"
    },
    {
      word: "Textarea",
      meaning: "Área de texto para mensajes largos",
      example: "Write your comment in the textarea",
      context: "Interface"
    }
  ],
  simulation: {
    simulationId: "SIM-023"
  },
  practice: [
    {
      question: "¿Qué significa Input?",
      options: ["Salida", "Entrada", "Borrado", "Cierre"],
      answer: "Entrada"
    },
    {
      question: "Si solo puedes elegir UNA opción entre varias, usas:",
      options: ["Checkbox", "Radio Button", "Dropdown", "Textarea"],
      answer: "Radio Button"
    },
    {
      question: "Para escribir un párrafo largo usas un:",
      options: ["Input", "Textarea", "Checkbox", "Dropdown"],
      answer: "Textarea"
    }
  ],
  evaluation: [
    {
      question: "Input significa:",
      options: ["Entrada de datos", "Salida de datos", "Error de datos", "Cierre de datos"],
      answer: "Entrada de datos"
    },
    {
      question: "Checkbox permite elegir:",
      options: ["Solo una opción", "Múltiples opciones", "Ninguna opción", "Solo texto"],
      answer: "Múltiples opciones"
    },
    {
      question: "Radio Button permite elegir:",
      options: ["Solo una opción", "Múltiples opciones", "Ninguna opción", "Solo texto"],
      answer: "Solo una opción"
    },
    {
      question: "Dropdown es un:",
      options: ["Menú desplegable", "Botón de radio", "Campo de texto", "Icono"],
      answer: "Menú desplegable"
    },
    {
      question: "Textarea se usa para:",
      options: ["Nombres cortos", "Contraseñas", "Textos largos / comentarios", "Números"],
      answer: "Textos largos / comentarios"
    },
    {
      question: "Identify the element: 'Select your gender using the Radio Button'",
      options: ["Select", "Gender", "Radio Button", "Input"],
      answer: "Radio Button"
    },
    {
      question: "Identify the action: 'Check the Checkbox to agree'",
      options: ["Check", "Checkbox", "Agree", "Select"],
      answer: "Check"
    },
    {
      question: "¿Qué significa 'Placeholder'?",
      options: ["Texto de ayuda dentro del input", "Botón de envío", "Error de red", "Imagen de fondo"],
      answer: "Texto de ayuda dentro del input"
    },
    {
      question: "A 'Required field' is a field that:",
      options: ["Must be filled", "Can be empty", "Is hidden", "Is disabled"],
      answer: "Must be filled"
    },
    {
      question: "The 'Submit button' sends the data from the:",
      options: ["Form", "Header", "Footer", "Sidebar"],
      answer: "Form"
    }
  ],
  active: true
};
