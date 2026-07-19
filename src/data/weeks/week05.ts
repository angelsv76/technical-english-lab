import { WeekData } from '../../types';

export const week05: WeekData = {
  week: 5,
  title: "System Status & Messages",
  objective: "Entender mensajes de estado y alertas",
  introText: "El sistema se comunica con el usuario mediante mensajes que indican éxito, advertencia o error.",
  keywords: ["Success", "Warning", "Alert", "Info", "Loading"],
  vocabulary: [
    {
      word: "Success",
      meaning: "Operación completada con éxito",
      example: "Upload success",
      context: "Status",
      phonetic: "/səkˈsɛs/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week05/success.mp3"
    },
    {
      word: "Warning",
      meaning: "Advertencia sobre un posible problema",
      example: "Low battery warning",
      context: "Status",
      phonetic: "/ˈwɔːrnɪŋ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week05/warning.mp3"
    },
    {
      word: "Alert",
      meaning: "Alerta que requiere atención inmediata",
      example: "Security alert",
      context: "Status",
      phonetic: "/əˈlɜːrt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week05/alert.mp3"
    },
    {
      word: "Info",
      meaning: "Información general del sistema",
      example: "System info",
      context: "Status",
      phonetic: "/ˈɪnfoʊ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week05/info.mp3"
    },
    {
      word: "Loading",
      meaning: "Cargando datos o procesos",
      example: "Loading data...",
      context: "Status",
      phonetic: "/ˈloʊdɪŋ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week05/loading.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-005"
  },
  practice: [
    {
      question: "¿Qué significa Success?",
      options: ["Error", "Éxito", "Cargando", "Aviso"],
      answer: "Éxito"
    },
    {
      question: "Si ves un triángulo amarillo, es un:",
      options: ["Success", "Warning", "Info", "Loading"],
      answer: "Warning"
    },
    {
      question: "Cuando el sistema está procesando algo, dice:",
      options: ["Success", "Alert", "Loading", "Info"],
      answer: "Loading"
    }
  ],
  evaluation: [
    {
      question: "Success significa:",
      options: ["Éxito", "Fallo", "Espera", "Ayuda"],
      answer: "Éxito"
    },
    {
      question: "Warning significa:",
      options: ["Error fatal", "Advertencia", "Información", "Éxito"],
      answer: "Advertencia"
    },
    {
      question: "Alert significa:",
      options: ["Alerta", "Cierre", "Inicio", "Borrado"],
      answer: "Alerta"
    },
    {
      question: "Info es abreviatura de:",
      options: ["Información", "Informática", "Infinito", "Informe"],
      answer: "Información"
    },
    {
      question: "Loading significa:",
      options: ["Cargando", "Descargando", "Guardando", "Borrando"],
      answer: "Cargando"
    },
    {
      question: "Identify the status: 'Operation success'",
      options: ["Operation", "Success", "The", "Alert"],
      answer: "Success"
    },
    {
      question: "Identify the level: 'Critical alert'",
      options: ["Critical", "Alert", "System", "Info"],
      answer: "Critical"
    },
    {
      question: "A green message usually means:",
      options: ["Success", "Warning", "Error", "Loading"],
      answer: "Success"
    },
    {
      question: "A red message usually means:",
      options: ["Success", "Info", "Error / Alert", "Loading"],
      answer: "Error / Alert"
    },
    {
      question: "'Please wait' is related to:",
      options: ["Success", "Loading", "Warning", "Info"],
      answer: "Loading"
    }
  ],
  active: true
};
