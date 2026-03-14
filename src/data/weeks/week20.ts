import { WeekData } from '../../types';

export const week20: WeekData = {
  week: 20,
  title: "Layout & Container Elements",
  objective: "Identificar elementos de organización y contenedores",
  introText: "Los contenedores organizan los elementos de la interfaz en grupos lógicos y visuales.",
  keywords: ["Card", "Modal", "Accordion", "Grid", "Container"],
  vocabulary: [
    {
      word: "Card",
      meaning: "Tarjeta o contenedor de información",
      example: "Display user info in a card",
      context: "Interface"
    },
    {
      word: "Modal",
      meaning: "Ventana emergente que bloquea el fondo",
      example: "Open the confirmation modal",
      context: "Interface"
    },
    {
      word: "Accordion",
      meaning: "Menú desplegable vertical (acordeón)",
      example: "Click the accordion to expand",
      context: "Interface"
    },
    {
      word: "Grid",
      meaning: "Cuadrícula de organización",
      example: "Align elements in a grid",
      context: "Interface"
    },
    {
      word: "Container",
      meaning: "Contenedor general de elementos",
      example: "Wrap the content in a container",
      context: "Interface"
    }
  ],
  simulation: {
    simulationId: "SIM-004"
  },
  practice: [
    {
      question: "¿Qué significa Modal?",
      options: ["Modo de juego", "Ventana emergente", "Tipo de letra", "Icono"],
      answer: "Ventana emergente"
    },
    {
      question: "Un elemento que se expande y contrae al hacer click es un:",
      options: ["Card", "Grid", "Accordion", "Container"],
      answer: "Accordion"
    },
    {
      question: "Para organizar elementos en filas y columnas usas una:",
      options: ["Card", "Grid", "Modal", "Accordion"],
      answer: "Grid"
    }
  ],
  evaluation: [
    {
      question: "Card significa:",
      options: ["Tarjeta / Contenedor", "Carta", "Mapa", "Imagen"],
      answer: "Tarjeta / Contenedor"
    },
    {
      question: "Modal se refiere a:",
      options: ["Una ventana emergente", "Un menú lateral", "Un pie de página", "Un botón"],
      answer: "Una ventana emergente"
    },
    {
      question: "Accordion significa:",
      options: ["Acordeón / Menú desplegable", "Piano", "Guitarra", "Batería"],
      answer: "Acordeón / Menú desplegable"
    },
    {
      question: "Grid significa:",
      options: ["Cuadrícula", "Línea", "Punto", "Círculo"],
      answer: "Cuadrícula"
    },
    {
      question: "Container significa:",
      options: ["Contenedor", "Contenido", "Contacto", "Control"],
      answer: "Contenedor"
    },
    {
      question: "Identify the element: 'The user profile is displayed in a Card'",
      options: ["User", "Profile", "Card", "Grid"],
      answer: "Card"
    },
    {
      question: "Identify the action: 'Expand the Accordion to see more details'",
      options: ["Expand", "Accordion", "See", "Details"],
      answer: "Accordion"
    },
    {
      question: "¿Qué significa 'Responsive layout'?",
      options: ["Diseño que se adapta a pantallas", "Diseño de respuesta rápida", "Diseño con muchos colores", "Diseño sin imágenes"],
      answer: "Diseño que se adapta a pantallas"
    },
    {
      question: "A 'Modal' usually has an overlay that:",
      options: ["Darkens the background", "Deletes the background", "Changes the background to red", "Is invisible"],
      answer: "Darkens the background"
    },
    {
      question: "To 'Group elements' you use a:",
      options: ["Container", "Link", "Icon", "Tooltip"],
      answer: "Container"
    }
  ],
  active: true
};
