import { WeekData } from '../../types';

export const week17: WeekData = {
  week: 17,
  title: "Navigation Elements",
  objective: "Identificar componentes de navegación",
  introText: "Los elementos de navegación permiten al usuario moverse de forma intuitiva por la aplicación.",
  keywords: ["Navbar", "Breadcrumbs", "Pagination", "Link", "Tab"],
  vocabulary: [
    {
      word: "Navbar",
      meaning: "Barra de navegación principal",
      example: "Links in the navbar",
      context: "Interface"
    },
    {
      word: "Breadcrumbs",
      meaning: "Ruta de navegación (migas de pan)",
      example: "Check the breadcrumbs",
      context: "Interface"
    },
    {
      word: "Pagination",
      meaning: "Paginación de resultados",
      example: "Go to page 2 in pagination",
      context: "Interface"
    },
    {
      word: "Link",
      meaning: "Enlace o hipervínculo",
      example: "Click the link",
      context: "Interface"
    },
    {
      word: "Tab",
      meaning: "Pestaña de navegación",
      example: "Switch to the 'Settings' tab",
      context: "Interface"
    }
  ],
  simulation: {
    simulationId: "SIM-017"
  },
  practice: [
    {
      question: "¿Qué significa Link?",
      options: ["Botón", "Enlace", "Imagen", "Texto"],
      answer: "Enlace"
    },
    {
      question: "Para ver más resultados divididos en páginas usas:",
      options: ["Navbar", "Pagination", "Breadcrumbs", "Tab"],
      answer: "Pagination"
    },
    {
      question: "La ruta 'Home > Projects > Web' es un ejemplo de:",
      options: ["Navbar", "Link", "Breadcrumbs", "Tab"],
      answer: "Breadcrumbs"
    }
  ],
  evaluation: [
    {
      question: "Navbar significa:",
      options: ["Barra de navegación", "Barra de estado", "Barra de tareas", "Barra de error"],
      answer: "Barra de navegación"
    },
    {
      question: "Breadcrumbs se refiere a:",
      options: ["La ruta de navegación", "El menú principal", "El pie de página", "Las pestañas"],
      answer: "La ruta de navegación"
    },
    {
      question: "Pagination significa:",
      options: ["Paginación", "Impresión", "Escaneo", "Borrado"],
      answer: "Paginación"
    },
    {
      question: "Link significa:",
      options: ["Enlace", "Bloqueo", "Cierre", "Apertura"],
      answer: "Enlace"
    },
    {
      question: "Tab significa:",
      options: ["Pestaña", "Ventana", "Botón", "Icono"],
      answer: "Pestaña"
    },
    {
      question: "Identify the element: 'Click the Link to open the website'",
      options: ["Click", "Link", "Website", "Open"],
      answer: "Link"
    },
    {
      question: "Identify the navigation type: 'Switch between the active Tabs'",
      options: ["Switch", "Active", "Tabs", "Between"],
      answer: "Tabs"
    },
    {
      question: "¿Qué significa 'Hyperlink'?",
      options: ["Hipervínculo", "Hipertexto", "Hiperactividad", "Hipermercado"],
      answer: "Hipervínculo"
    },
    {
      question: "Breadcrumbs are usually located:",
      options: ["At the bottom", "Below the header", "In the footer", "Hidden"],
      answer: "Below the header"
    },
    {
      question: "A 'Broken link' is a link that:",
      options: ["Doesn't work", "Is too long", "Is blue", "Is underlined"],
      answer: "Doesn't work"
    }
  ],
  active: true
};
