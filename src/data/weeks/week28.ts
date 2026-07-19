import { WeekData } from '../../types';

export const week28: WeekData = {
  week: 28,
  title: "System Messages I",
  objective: "Identificar avisos y advertencias del sistema",
  introText: "El sistema utiliza diferentes tipos de mensajes para alertar al usuario sobre situaciones importantes.",
  keywords: ["Alert", "Warning", "Caution", "Notice", "Attention"],
  vocabulary: [
    {
      word: "Alert",
      meaning: "Alerta o aviso urgente",
      example: "Security alert",
      context: "System",
      phonetic: "/əˈlɜːrt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week28/alert.mp3"
    },
    {
      word: "Warning",
      meaning: "Advertencia de posible problema",
      example: "Low battery warning",
      context: "System",
      phonetic: "/ˈwɔːrnɪŋ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week28/warning.mp3"
    },
    {
      word: "Caution",
      meaning: "Precaución o cuidado",
      example: "Use with caution",
      context: "System",
      phonetic: "/ˈkɔːʃən/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week28/caution.mp3"
    },
    {
      word: "Notice",
      meaning: "Aviso o notificación informativa",
      example: "Read the legal notice",
      context: "System",
      phonetic: "/ˈnoʊtɪs/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week28/notice.mp3"
    },
    {
      word: "Attention",
      meaning: "Atención o llamado de enfoque",
      example: "Attention required",
      context: "System",
      phonetic: "/əˈtɛnʃən/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week28/attention.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-005"
  },
  practice: [
    {
      question: "¿Qué significa Warning?",
      options: ["Éxito", "Advertencia", "Borrado", "Inicio"],
      answer: "Advertencia"
    },
    {
      question: "Un aviso de seguridad urgente es una:",
      options: ["Notice", "Alert", "Caution", "Attention"],
      answer: "Alert"
    },
    {
      question: "Si debes tener cuidado con una acción, el sistema dice:",
      options: ["Success", "Caution", "Notice", "Alert"],
      answer: "Caution"
    }
  ],
  evaluation: [
    {
      question: "Alert significa:",
      options: ["Alerta", "Calma", "Silencio", "Pausa"],
      answer: "Alerta"
    },
    {
      question: "Warning significa:",
      options: ["Advertencia", "Invitación", "Regalo", "Ayuda"],
      answer: "Advertencia"
    },
    {
      question: "Caution significa:",
      options: ["Precaución", "Velocidad", "Fuerza", "Ignorancia"],
      answer: "Precaución"
    },
    {
      question: "Notice significa:",
      options: ["Aviso", "Pregunta", "Error", "Fallo"],
      answer: "Aviso"
    },
    {
      question: "Attention significa:",
      options: ["Atención", "Descuido", "Olvido", "Cierre"],
      answer: "Atención"
    },
    {
      question: "Identify the message: 'Security Alert: Unauthorized access'",
      options: ["Security", "Alert", "Access", "Warning"],
      answer: "Alert"
    },
    {
      question: "Identify the type: 'Warning: Disk space is low'",
      options: ["Warning", "Disk", "Space", "Low"],
      answer: "Warning"
    },
    {
      question: "¿Qué color suele representar un 'Warning'?",
      options: ["Amarillo / Naranja", "Verde", "Azul", "Blanco"],
      answer: "Amarillo / Naranja"
    },
    {
      question: "To 'Ignore a warning' means:",
      options: ["Ignorar una advertencia", "Leer una advertencia", "Borrar una advertencia", "Seguir una advertencia"],
      answer: "Ignorar una advertencia"
    },
    {
      question: "The 'Notice board' is for:",
      options: ["Informational messages", "Errors", "Games", "Videos"],
      answer: "Informational messages"
    }
  ],
  active: true
};
