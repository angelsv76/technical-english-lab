import { WeekData } from '../../types';

export const week02: WeekData = {
  week: 2,
  title: "Interface Navigation",
  objective: "Navegar por los menús y opciones de una interfaz",
  introText: "Navegar por un software requiere entender términos direccionales y de ubicación en los menús.",
  keywords: ["Menu", "Home", "Back", "Next", "Exit"],
  vocabulary: [
    {
      word: "Menu",
      meaning: "Lista de opciones",
      example: "Open the main menu",
      context: "Navigation"
    },
    {
      word: "Home",
      meaning: "Página de inicio o principal",
      example: "Return to home",
      context: "Navigation"
    },
    {
      word: "Back",
      meaning: "Regresar a la pantalla anterior",
      example: "Go back",
      context: "Navigation"
    },
    {
      word: "Next",
      meaning: "Avanzar a la siguiente pantalla",
      example: "Click next to continue",
      context: "Navigation"
    },
    {
      word: "Exit",
      meaning: "Salir del programa",
      example: "Exit the application",
      context: "Action"
    }
  ],
  simulation: {
    simulationId: "SIM-007"
  },
  practice: [
    {
      question: "¿Qué significa Home?",
      options: ["Casa", "Inicio", "Atrás", "Siguiente"],
      answer: "Inicio"
    },
    {
      question: "Para cerrar el programa buscas:",
      options: ["Next", "Back", "Exit", "Menu"],
      answer: "Exit"
    },
    {
      question: "Si quieres ver la página anterior presionas:",
      options: ["Next", "Home", "Back", "Menu"],
      answer: "Back"
    }
  ],
  evaluation: [
    {
      question: "Menu se refiere a:",
      options: ["Una lista de opciones", "Un error", "Un archivo", "Una descarga"],
      answer: "Una lista de opciones"
    },
    {
      question: "Next significa:",
      options: ["Siguiente", "Atrás", "Inicio", "Salir"],
      answer: "Siguiente"
    },
    {
      question: "Back significa:",
      options: ["Atrás", "Siguiente", "Inicio", "Salir"],
      answer: "Atrás"
    },
    {
      question: "Para volver al principio de la app usas:",
      options: ["Exit", "Home", "Next", "Back"],
      answer: "Home"
    },
    {
      question: "Exit se traduce como:",
      options: ["Entrar", "Salir", "Siguiente", "Atrás"],
      answer: "Salir"
    },
    {
      question: "Identify the navigation command: 'Go back to the previous page'",
      options: ["Go", "Back", "Previous", "Page"],
      answer: "Back"
    },
    {
      question: "Identify the destination: 'Click Next to see the results'",
      options: ["Click", "Next", "Results", "See"],
      answer: "Results"
    },
    {
      question: "A 'Main Menu' is the:",
      options: ["Menu principal", "Menu secundario", "Menu de ayuda", "Menu de error"],
      answer: "Menu principal"
    },
    {
      question: "'Return to Home' means:",
      options: ["Volver al inicio", "Salir de casa", "Ir al final", "Cerrar todo"],
      answer: "Volver al inicio"
    },
    {
      question: "The 'Exit' button is often a:",
      options: ["Green check", "Red X", "Blue arrow", "Yellow gear"],
      answer: "Red X"
    }
  ],
  active: true
};
