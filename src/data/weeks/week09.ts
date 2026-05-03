import { WeekData } from '../../types';

export const week09: WeekData = {
  week: 9,
  title: "Data Processing Actions",
  objective: "Aprender verbos relacionados con el procesamiento de datos",
  introText: "En el desarrollo de software, procesar datos implica transformarlos, enviarlos o recibirlos.",
  keywords: ["Process", "Submit", "Request", "Response", "Fetch"],
  vocabulary: [
    {
      word: "Process",
      meaning: "Procesar información",
      example: "Process the payment",
      context: "Action",
      phonetic: "/ˈprɑːsɛs/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/process.wav"
    },
    {
      word: "Submit",
      meaning: "Enviar un formulario o datos",
      example: "Submit the form",
      context: "Action",
      phonetic: "/səbˈmɪt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/submit.wav"
    },
    {
      word: "Request",
      meaning: "Solicitar datos al servidor",
      example: "Send a data request",
      context: "Network",
      phonetic: "/rɪˈkwɛst/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/request.wav"
    },
    {
      word: "Response",
      meaning: "Respuesta del servidor",
      example: "Wait for the response",
      context: "Network",
      phonetic: "/rɪˈspɑːns/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/response.wav"
    },
    {
      word: "Fetch",
      meaning: "Obtener o traer datos",
      example: "Fetch the user list",
      context: "Action",
      phonetic: "/fɛtʃ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/fetch.wav"
    }
  ],
  simulation: {
    simulationId: "SIM-029"
  },
  practice: [
    {
      question: "¿Qué significa Submit?",
      options: ["Recibir", "Enviar", "Borrar", "Editar"],
      answer: "Enviar"
    },
    {
      question: "Cuando pides algo al servidor, haces un:",
      options: ["Response", "Request", "Submit", "Process"],
      answer: "Request"
    },
    {
      question: "La contestación que da el servidor es el:",
      options: ["Fetch", "Submit", "Response", "Process"],
      answer: "Response"
    }
  ],
  evaluation: [
    {
      question: "Process significa:",
      options: ["Procesar", "Parar", "Iniciar", "Borrar"],
      answer: "Procesar"
    },
    {
      question: "Submit significa:",
      options: ["Enviar / Entregar", "Recibir", "Cancelar", "Editar"],
      answer: "Enviar / Entregar"
    },
    {
      question: "Request significa:",
      options: ["Respuesta", "Petición / Solicitud", "Error", "Éxito"],
      answer: "Petición / Solicitud"
    },
    {
      question: "Response significa:",
      options: ["Pregunta", "Respuesta", "Solicitud", "Carga"],
      answer: "Respuesta"
    },
    {
      question: "Fetch significa:",
      options: ["Enviar", "Traer / Obtener", "Borrar", "Cerrar"],
      answer: "Traer / Obtener"
    },
    {
      question: "Identify the action: 'Submit the application'",
      options: ["Submit", "The", "Application", "Fetch"],
      answer: "Submit"
    },
    {
      question: "Identify the object: 'Wait for the server response'",
      options: ["Wait", "Server", "Response", "Request"],
      answer: "Response"
    },
    {
      question: "¿Qué significa 'Processing data'?",
      options: ["Procesando datos", "Borrando datos", "Enviando datos", "Recibiendo datos"],
      answer: "Procesando datos"
    },
    {
      question: "A 'GET request' is used to:",
      options: ["Send data", "Fetch data", "Delete data", "Update data"],
      answer: "Fetch data"
    },
    {
      question: "The 'Submit button' is usually at the:",
      options: ["Top of a form", "End of a form", "Side of a form", "Background"],
      answer: "End of a form"
    }
  ],
  active: true
};
