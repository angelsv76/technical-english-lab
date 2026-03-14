import { WeekData } from '../../types';

export const week37: WeekData = {
  week: 37,
  title: "Documentation II",
  objective: "Identificar términos de licencias y autoría",
  introText: "El software está protegido por leyes de autoría y licencias que definen cómo se puede usar.",
  keywords: ["License", "Copyright", "Author", "Version", "Release"],
  vocabulary: [
    {
      word: "License",
      meaning: "Licencia de uso",
      example: "Read the MIT license",
      context: "Legal"
    },
    {
      word: "Copyright",
      meaning: "Derechos de autor",
      example: "Copyright 2024",
      context: "Legal"
    },
    {
      word: "Author",
      meaning: "Autor o creador",
      example: "Contact the author",
      context: "Legal"
    },
    {
      word: "Version",
      meaning: "Versión del software",
      example: "Version 1.0.2",
      context: "System"
    },
    {
      word: "Release",
      meaning: "Lanzamiento o publicación",
      example: "The latest release",
      context: "System"
    }
  ],
  simulation: {
    simulationId: "SIM-032"
  },
  practice: [
    {
      question: "¿Qué significa License?",
      options: ["Libro", "Licencia", "Línea", "Luz"],
      answer: "Licencia"
    },
    {
      question: "El número que identifica el estado del software es la:",
      options: ["Version", "Author", "License", "Copyright"],
      answer: "Version"
    },
    {
      question: "El creador del código es el:",
      options: ["Author", "License", "Release", "Version"],
      answer: "Author"
    }
  ],
  evaluation: [
    {
      question: "License significa:",
      options: ["Licencia", "Libertad", "Límite", "Lugar"],
      answer: "Licencia"
    },
    {
      question: "Copyright significa:",
      options: ["Derechos de autor", "Copia derecha", "Copia rápida", "Copia total"],
      answer: "Derechos de autor"
    },
    {
      question: "Author significa:",
      options: ["Autor", "Actor", "Auto", "Aviso"],
      answer: "Autor"
    },
    {
      question: "Version significa:",
      options: ["Versión", "Verdad", "Vista", "Voz"],
      answer: "Versión"
    },
    {
      question: "Release significa:",
      options: ["Lanzamiento / Publicación", "Regreso", "Relato", "Regalo"],
      answer: "Lanzamiento / Publicación"
    },
    {
      question: "Identify the element: 'Check the software Version'",
      options: ["Check", "Software", "Version", "License"],
      answer: "Version"
    },
    {
      question: "Identify the status: 'The new Release is out'",
      options: ["The", "New", "Release", "Out"],
      answer: "Release"
    },
    {
      question: "¿Qué significa 'Open source'?",
      options: ["Código abierto", "Código cerrado", "Código secreto", "Código de error"],
      answer: "Código abierto"
    },
    {
      question: "To 'Accept the license' means:",
      options: ["Aceptar la licencia", "Borrar la licencia", "Ignorar la licencia", "Cerrar la app"],
      answer: "Aceptar la licencia"
    },
    {
      question: "The 'Copyright symbol' is:",
      options: ["©", "®", "™", "@"],
      answer: "©"
    }
  ],
  active: true
};
