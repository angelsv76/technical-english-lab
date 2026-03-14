import { WeekData } from '../../types';

export const week35: WeekData = {
  week: 35,
  title: "Programming Basics V",
  objective: "Identificar conceptos de redes y servidores",
  introText: "Las aplicaciones modernas funcionan conectándose a servidores a través de internet.",
  keywords: ["Server", "Client", "Request", "Response", "API"],
  vocabulary: [
    {
      word: "Server",
      meaning: "Servidor (provee datos)",
      example: "The server is down",
      context: "Networking"
    },
    {
      word: "Client",
      meaning: "Cliente (solicita datos)",
      example: "The web client",
      context: "Networking"
    },
    {
      word: "Request",
      meaning: "Petición o solicitud",
      example: "Send an HTTP request",
      context: "Networking"
    },
    {
      word: "Response",
      meaning: "Respuesta del servidor",
      example: "Wait for the response",
      context: "Networking"
    },
    {
      word: "API",
      meaning: "Interfaz de programación de aplicaciones",
      example: "Connect to the API",
      context: "Networking"
    }
  ],
  simulation: {
    simulationId: "SIM-009"
  },
  practice: [
    {
      question: "¿Qué significa Server?",
      options: ["Servidor", "Servicio", "Serie", "Sello"],
      answer: "Servidor"
    },
    {
      question: "Cuando pides datos al servidor, envías una:",
      options: ["Request", "Response", "API", "Client"],
      answer: "Request"
    },
    {
      question: "La respuesta que recibes es la:",
      options: ["Response", "Request", "Server", "API"],
      answer: "Response"
    }
  ],
  evaluation: [
    {
      question: "Server significa:",
      options: ["Servidor", "Cliente", "Usuario", "Invitado"],
      answer: "Servidor"
    },
    {
      question: "Client significa:",
      options: ["Cliente", "Servidor", "Dueño", "Jefe"],
      answer: "Cliente"
    },
    {
      question: "Request significa:",
      options: ["Petición / Solicitud", "Respuesta", "Error", "Aviso"],
      answer: "Petición / Solicitud"
    },
    {
      question: "Response significa:",
      options: ["Respuesta", "Pregunta", "Duda", "Fallo"],
      answer: "Respuesta"
    },
    {
      question: "API significa:",
      options: ["Interfaz de programación", "Archivo de imagen", "Base de datos", "Protocolo de error"],
      answer: "Interfaz de programación"
    },
    {
      question: "Identify the element: 'The Client sends a Request'",
      options: ["Client", "Sends", "Request", "Server"],
      answer: "Request"
    },
    {
      question: "Identify the action: 'Wait for the Server Response'",
      options: ["Wait", "Server", "Response", "API"],
      answer: "Response"
    },
    {
      question: "¿Qué significa 'Backend'?",
      options: ["Parte lógica / servidor", "Parte visual / cliente", "Parte de diseño", "Parte de marketing"],
      answer: "Parte lógica / servidor"
    },
    {
      question: "To 'Fetch data' means:",
      options: ["Traer / Obtener datos", "Borrar datos", "Ignorar datos", "Ocultar datos"],
      answer: "Traer / Obtener datos"
    },
    {
      question: "A 'Status code 200' means:",
      options: ["Success", "Error", "Not found", "Forbidden"],
      answer: "Success"
    }
  ],
  active: true
};
