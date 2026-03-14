import { WeekData } from '../../types';

export const week26: WeekData = {
  week: 26,
  title: "Form Elements I",
  objective: "Identificar campos básicos de un formulario",
  introText: "Los formularios son el principal medio para recolectar datos del usuario.",
  keywords: ["Form", "Field", "Label", "Required", "Optional"],
  vocabulary: [
    {
      word: "Form",
      meaning: "Formulario",
      example: "Fill out the form",
      context: "Interface"
    },
    {
      word: "Field",
      meaning: "Campo de entrada",
      example: "The email field",
      context: "Interface"
    },
    {
      word: "Label",
      meaning: "Etiqueta descriptiva del campo",
      example: "Read the label",
      context: "Interface"
    },
    {
      word: "Required",
      meaning: "Obligatorio",
      example: "This field is required",
      context: "System"
    },
    {
      word: "Optional",
      meaning: "Opcional",
      example: "The phone number is optional",
      context: "System"
    }
  ],
  simulation: {
    simulationId: "SIM-021"
  },
  practice: [
    {
      question: "¿Qué significa Required?",
      options: ["Opcional", "Obligatorio", "Borrado", "Oculto"],
      answer: "Obligatorio"
    },
    {
      question: "El texto que dice 'Nombre:' al lado de un cuadro es una:",
      options: ["Form", "Field", "Label", "Optional"],
      answer: "Label"
    },
    {
      question: "Si no es necesario llenar un campo, este es:",
      options: ["Required", "Optional", "Label", "Field"],
      answer: "Optional"
    }
  ],
  evaluation: [
    {
      question: "Form significa:",
      options: ["Formulario", "Forma", "Firma", "Fondo"],
      answer: "Formulario"
    },
    {
      question: "Field significa:",
      options: ["Campo", "Fila", "Columna", "Celda"],
      answer: "Campo"
    },
    {
      question: "Label significa:",
      options: ["Etiqueta", "Botón", "Icono", "Imagen"],
      answer: "Etiqueta"
    },
    {
      question: "Required significa:",
      options: ["Obligatorio", "Opcional", "Innecesario", "Extra"],
      answer: "Obligatorio"
    },
    {
      question: "Optional significa:",
      options: ["Opcional", "Obligatorio", "Forzado", "Crítico"],
      answer: "Opcional"
    },
    {
      question: "Identify the element: 'The Name Field is empty'",
      options: ["Name", "Field", "Empty", "Label"],
      answer: "Field"
    },
    {
      question: "Identify the status: 'Password is a Required field'",
      options: ["Password", "Required", "Field", "Optional"],
      answer: "Required"
    },
    {
      question: "¿Qué significa el asterisco (*) en un formulario?",
      options: ["Campo obligatorio", "Campo opcional", "Error de escritura", "Campo oculto"],
      answer: "Campo obligatorio"
    },
    {
      question: "To 'Submit a form' means:",
      options: ["Enviar un formulario", "Borrar un formulario", "Cerrar un formulario", "Copiar un formulario"],
      answer: "Enviar un formulario"
    },
    {
      question: "A 'Blank field' is a field that:",
      options: ["Is empty", "Is full", "Is red", "Is blue"],
      answer: "Is empty"
    }
  ],
  active: true
};
