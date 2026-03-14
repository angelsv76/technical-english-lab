import { WeekData } from '../../types';

export const week27: WeekData = {
  week: 27,
  title: "Form Elements II",
  objective: "Identificar campos de selección y validación",
  introText: "La validación de formularios asegura que los datos ingresados sean correctos antes de procesarlos.",
  keywords: ["Validate", "Invalid", "Error Message", "Success", "Format"],
  vocabulary: [
    {
      word: "Validate",
      meaning: "Validar o verificar datos",
      example: "Validate the input",
      context: "Action"
    },
    {
      word: "Invalid",
      meaning: "Inválido o incorrecto",
      example: "Invalid email format",
      context: "System"
    },
    {
      word: "Error Message",
      meaning: "Mensaje de error",
      example: "Display the error message",
      context: "Interface"
    },
    {
      word: "Success",
      meaning: "Éxito o proceso correcto",
      example: "Success! Form sent",
      context: "System"
    },
    {
      word: "Format",
      meaning: "Formato de los datos",
      example: "Check the date format",
      context: "Data"
    }
  ],
  simulation: {
    simulationId: "SIM-040"
  },
  practice: [
    {
      question: "¿Qué significa Invalid?",
      options: ["Correcto", "Inválido", "Nuevo", "Viejo"],
      answer: "Inválido"
    },
    {
      question: "Si el formulario se envió bien, verás un mensaje de:",
      options: ["Error", "Success", "Invalid", "Format"],
      answer: "Success"
    },
    {
      question: "La estructura de un correo (user@mail.com) es su:",
      options: ["Format", "Success", "Validate", "Error"],
      answer: "Format"
    }
  ],
  evaluation: [
    {
      question: "Validate significa:",
      options: ["Validar", "Borrar", "Ignorar", "Ocultar"],
      answer: "Validar"
    },
    {
      question: "Invalid significa:",
      options: ["Inválido", "Válido", "Útil", "Rápido"],
      answer: "Inválido"
    },
    {
      question: "Error Message significa:",
      options: ["Mensaje de error", "Mensaje de éxito", "Mensaje de ayuda", "Mensaje de bienvenida"],
      answer: "Mensaje de error"
    },
    {
      question: "Success significa:",
      options: ["Éxito", "Fallo", "Espera", "Duda"],
      answer: "Éxito"
    },
    {
      question: "Format significa:",
      options: ["Formato", "Firma", "Fondo", "Fuerza"],
      answer: "Formato"
    },
    {
      question: "Identify the status: 'The email Format is Invalid'",
      options: ["Email", "Format", "Invalid", "Success"],
      answer: "Invalid"
    },
    {
      question: "Identify the element: 'Read the Error Message'",
      options: ["Read", "Error", "Message", "Validate"],
      answer: "Message"
    },
    {
      question: "¿Qué significa 'Real-time validation'?",
      options: ["Validación al instante", "Validación lenta", "Sin validación", "Validación manual"],
      answer: "Validación al instante"
    },
    {
      question: "To 'Correct the errors' means:",
      options: ["Corregir los errores", "Crear errores", "Ignorar errores", "Borrar la app"],
      answer: "Corregir los errores"
    },
    {
      question: "The 'Green color' usually represents:",
      options: ["Success", "Error", "Warning", "Info"],
      answer: "Success"
    }
  ],
  active: true
};
