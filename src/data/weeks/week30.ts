import { WeekData } from '../../types';

export const week30: WeekData = {
  week: 30,
  title: "System Messages III",
  objective: "Identificar estados de carga y espera",
  introText: "El sistema debe informar al usuario cuando un proceso está en curso y requiere tiempo.",
  keywords: ["Loading", "Processing", "Pending", "Waiting", "Progress"],
  vocabulary: [
    {
      word: "Loading",
      meaning: "Cargando datos o recursos",
      example: "Loading... please wait",
      context: "System"
    },
    {
      word: "Processing",
      meaning: "Procesando información",
      example: "Processing your request",
      context: "System"
    },
    {
      word: "Pending",
      meaning: "Pendiente de completar",
      example: "Payment pending",
      context: "System"
    },
    {
      word: "Waiting",
      meaning: "Esperando una respuesta",
      example: "Waiting for server",
      context: "System"
    },
    {
      word: "Progress",
      meaning: "Progreso de una tarea",
      example: "Check the progress bar",
      context: "System"
    }
  ],
  simulation: {
    simulationId: "SIM-005"
  },
  practice: [
    {
      question: "¿Qué significa Loading?",
      options: ["Cargando", "Borrando", "Cerrando", "Saliendo"],
      answer: "Cargando"
    },
    {
      question: "Si una tarea aún no se ha terminado, está:",
      options: ["Pending", "Success", "Error", "Finish"],
      answer: "Pending"
    },
    {
      question: "La barra que muestra cuánto falta es la barra de:",
      options: ["Progress", "Loading", "Waiting", "Pending"],
      answer: "Progress"
    }
  ],
  evaluation: [
    {
      question: "Loading significa:",
      options: ["Cargando", "Descargando", "Subiendo", "Bajando"],
      answer: "Cargando"
    },
    {
      question: "Processing significa:",
      options: ["Procesando", "Parando", "Iniciando", "Cerrando"],
      answer: "Procesando"
    },
    {
      question: "Pending significa:",
      options: ["Pendiente", "Terminado", "Nuevo", "Viejo"],
      answer: "Pendiente"
    },
    {
      question: "Waiting significa:",
      options: ["Esperando", "Corriendo", "Saltando", "Caminando"],
      answer: "Esperando"
    },
    {
      question: "Progress significa:",
      options: ["Progreso", "Retroceso", "Fallo", "Error"],
      answer: "Progreso"
    },
    {
      question: "Identify the status: 'The data is still Loading'",
      options: ["Data", "Still", "Loading", "Processing"],
      answer: "Loading"
    },
    {
      question: "Identify the element: 'Look at the Progress bar'",
      options: ["Look", "Progress", "Bar", "Waiting"],
      answer: "Progress"
    },
    {
      question: "¿Qué significa 'In progress'?",
      options: ["En curso / En progreso", "Terminado", "Sin empezar", "Cancelado"],
      answer: "En curso / En progreso"
    },
    {
      question: "To 'Wait for the response' means:",
      options: ["Esperar la respuesta", "Enviar la respuesta", "Borrar la respuesta", "Ignorar la respuesta"],
      answer: "Esperar la respuesta"
    },
    {
      question: "A 'Loading spinner' is a:",
      options: ["Visual indicator of loading", "Type of button", "Error message", "Menu"],
      answer: "Visual indicator of loading"
    }
  ],
  active: true
};
