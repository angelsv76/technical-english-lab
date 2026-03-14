import { WeekData } from '../../types';

export const week22: WeekData = {
  week: 22,
  title: "Sequential Processes II",
  objective: "Entender instrucciones de inicio y fin",
  introText: "Todo proceso tiene un punto de partida y un punto de finalización claros.",
  keywords: ["Start", "Finish", "Begin", "End", "Complete"],
  vocabulary: [
    {
      word: "Start",
      meaning: "Iniciar o comenzar",
      example: "Start the application",
      context: "Action"
    },
    {
      word: "Finish",
      meaning: "Terminar o finalizar",
      example: "Finish the setup",
      context: "Action"
    },
    {
      word: "Begin",
      meaning: "Empezar",
      example: "Begin the download",
      context: "Action"
    },
    {
      word: "End",
      meaning: "Fin o finalizar",
      example: "The end of the file",
      context: "Action"
    },
    {
      word: "Complete",
      meaning: "Completar o terminar totalmente",
      example: "Complete the form",
      context: "Action"
    }
  ],
  simulation: {
    simulationId: "SIM-008"
  },
  practice: [
    {
      question: "¿Qué significa Start?",
      options: ["Parar", "Iniciar", "Cerrar", "Mover"],
      answer: "Iniciar"
    },
    {
      question: "Para decir que algo ha terminado totalmente usas:",
      options: ["Begin", "Start", "Complete", "End"],
      answer: "Complete"
    },
    {
      question: "El opuesto de Start es:",
      options: ["Finish", "Begin", "Complete", "End"],
      answer: "End"
    }
  ],
  evaluation: [
    {
      question: "Start significa:",
      options: ["Iniciar", "Parar", "Borrar", "Guardar"],
      answer: "Iniciar"
    },
    {
      question: "Finish significa:",
      options: ["Finalizar", "Iniciar", "Pausar", "Reiniciar"],
      answer: "Finalizar"
    },
    {
      question: "Begin significa:",
      options: ["Empezar", "Terminar", "Esperar", "Cerrar"],
      answer: "Empezar"
    },
    {
      question: "End significa:",
      options: ["Fin", "Inicio", "Medio", "Lado"],
      answer: "Fin"
    },
    {
      question: "Complete significa:",
      options: ["Completar", "Borrar", "Ignorar", "Ocultar"],
      answer: "Completar"
    },
    {
      question: "Identify the action: 'Start the process now'",
      options: ["Start", "Process", "Now", "Begin"],
      answer: "Start"
    },
    {
      question: "Identify the status: 'The task is Complete'",
      options: ["Task", "Is", "Complete", "Finish"],
      answer: "Complete"
    },
    {
      question: "¿Qué significa 'Restart'?",
      options: ["Reiniciar", "Detener", "Borrar", "Guardar"],
      answer: "Reiniciar"
    },
    {
      question: "To 'Finish the installation' means:",
      options: ["Terminar la instalación", "Empezar la instalación", "Borrar la instalación", "Pausar la instalación"],
      answer: "Terminar la instalación"
    },
    {
      question: "The 'End-user' is the:",
      options: ["Usuario final", "Programador", "Diseñador", "Gerente"],
      answer: "Usuario final"
    }
  ],
  active: true
};
