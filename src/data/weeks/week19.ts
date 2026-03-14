import { WeekData } from '../../types';

export const week19: WeekData = {
  week: 19,
  title: "Action & Feedback Elements",
  objective: "Identificar elementos de acción y retroalimentación",
  introText: "Los botones y las notificaciones son esenciales para la interacción y para informar al usuario sobre el resultado de sus acciones.",
  keywords: ["Button", "Icon", "Tooltip", "Badge", "Notification"],
  vocabulary: [
    {
      word: "Button",
      meaning: "Botón de acción",
      example: "Click the 'Submit' button",
      context: "Interface"
    },
    {
      word: "Icon",
      meaning: "Icono o representación gráfica",
      example: "The 'Save' icon is a diskette",
      context: "Interface"
    },
    {
      word: "Tooltip",
      meaning: "Texto de ayuda al pasar el mouse",
      example: "Hover to see the tooltip",
      context: "Interface"
    },
    {
      word: "Badge",
      meaning: "Insignia o indicador numérico",
      example: "A badge with the number of messages",
      context: "Interface"
    },
    {
      word: "Notification",
      meaning: "Notificación o aviso del sistema",
      example: "You have a new notification",
      context: "Interface"
    }
  ],
  simulation: {
    simulationId: "SIM-001"
  },
  practice: [
    {
      question: "¿Qué significa Tooltip?",
      options: ["Botón", "Icono", "Texto de ayuda flotante", "Notificación"],
      answer: "Texto de ayuda flotante"
    },
    {
      question: "El pequeño círculo rojo con un número sobre un icono es un:",
      options: ["Badge", "Tooltip", "Button", "Notification"],
      answer: "Badge"
    },
    {
      question: "Para ejecutar una acción principal usas un:",
      options: ["Icon", "Button", "Tooltip", "Badge"],
      answer: "Button"
    }
  ],
  evaluation: [
    {
      question: "Button significa:",
      options: ["Botón", "Enlace", "Imagen", "Texto"],
      answer: "Botón"
    },
    {
      question: "Icon significa:",
      options: ["Icono", "Ventana", "Menú", "Cursor"],
      answer: "Icono"
    },
    {
      question: "Tooltip es:",
      options: ["Una herramienta de dibujo", "Un texto de ayuda al pasar el mouse", "Un error de sistema", "Un tipo de letra"],
      answer: "Un texto de ayuda al pasar el mouse"
    },
    {
      question: "Badge significa:",
      options: ["Insignia / Indicador", "Fondo", "Borde", "Sombra"],
      answer: "Insignia / Indicador"
    },
    {
      question: "Notification significa:",
      options: ["Notificación", "Cancelación", "Edición", "Borrado"],
      answer: "Notificación"
    },
    {
      question: "Identify the element: 'Hover over the Icon to see the Tooltip'",
      options: ["Hover", "Icon", "Tooltip", "See"],
      answer: "Tooltip"
    },
    {
      question: "Identify the status: 'You received a new Notification'",
      options: ["You", "Received", "Notification", "New"],
      answer: "Notification"
    },
    {
      question: "¿Qué significa 'Hover'?",
      options: ["Pasar el mouse por encima", "Hacer click", "Arrastrar", "Escribir"],
      answer: "Pasar el mouse por encima"
    },
    {
      question: "A 'Disabled button' is a button that:",
      options: ["Cannot be clicked", "Is invisible", "Is very large", "Changes color"],
      answer: "Cannot be clicked"
    },
    {
      question: "The 'Bell icon' usually represents:",
      options: ["Settings", "Notifications", "Search", "Home"],
      answer: "Notifications"
    }
  ],
  active: true
};
