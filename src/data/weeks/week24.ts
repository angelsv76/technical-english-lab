import { WeekData } from '../../types';

export const week24: WeekData = {
  week: 24,
  title: "Sequential Processes IV",
  objective: "Entender instrucciones de confirmación y cancelación",
  introText: "Confirmar o cancelar acciones es crítico para evitar errores accidentales en el sistema.",
  keywords: ["Confirm", "Cancel", "Agree", "Decline", "Accept"],
  vocabulary: [
    {
      word: "Confirm",
      meaning: "Confirmar una acción",
      example: "Confirm your password",
      context: "Action",
      phonetic: "/kənˈfɜːrm/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week24/confirm.mp3"
    },
    {
      word: "Cancel",
      meaning: "Cancelar o anular",
      example: "Cancel the operation",
      context: "Action",
      phonetic: "/ˈkænsəl/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week24/cancel.mp3"
    },
    {
      word: "Agree",
      meaning: "Estar de acuerdo (términos)",
      example: "I agree to the terms",
      context: "Action",
      phonetic: "/əˈɡriː/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week24/agree.mp3"
    },
    {
      word: "Decline",
      meaning: "Rechazar o declinar",
      example: "Decline the invitation",
      context: "Action",
      phonetic: "/dɪˈklaɪn/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week24/decline.mp3"
    },
    {
      word: "Accept",
      meaning: "Aceptar",
      example: "Accept the changes",
      context: "Action",
      phonetic: "/əkˈsɛpt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week24/accept.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-004"
  },
  practice: [
    {
      question: "¿Qué significa Confirm?",
      options: ["Cancelar", "Confirmar", "Borrar", "Mover"],
      answer: "Confirmar"
    },
    {
      question: "Si no quieres realizar la acción, presionas:",
      options: ["Confirm", "Cancel", "Agree", "Accept"],
      answer: "Cancel"
    },
    {
      question: "Para los términos y condiciones usualmente haces click en:",
      options: ["Agree", "Decline", "Cancel", "Confirm"],
      answer: "Agree"
    }
  ],
  evaluation: [
    {
      question: "Confirm significa:",
      options: ["Confirmar", "Dudar", "Negar", "Ocultar"],
      answer: "Confirmar"
    },
    {
      question: "Cancel significa:",
      options: ["Cancelar", "Continuar", "Guardar", "Abrir"],
      answer: "Cancelar"
    },
    {
      question: "Agree significa:",
      options: ["Estar de acuerdo", "Estar en contra", "Estar ausente", "Estar ocupado"],
      answer: "Estar de acuerdo"
    },
    {
      question: "Decline significa:",
      options: ["Rechazar", "Aceptar", "Mover", "Copiar"],
      answer: "Rechazar"
    },
    {
      question: "Accept significa:",
      options: ["Aceptar", "Rechazar", "Ignorar", "Borrar"],
      answer: "Aceptar"
    },
    {
      question: "Identify the action: 'Confirm the deletion'",
      options: ["Confirm", "Deletion", "The", "Cancel"],
      answer: "Confirm"
    },
    {
      question: "Identify the choice: 'I Decline the cookies'",
      options: ["I", "Decline", "Cookies", "Accept"],
      answer: "Decline"
    },
    {
      question: "¿Qué significa 'Terms and Conditions'?",
      options: ["Términos y condiciones", "Tiempos y climas", "Temas y conductas", "Tareas y consejos"],
      answer: "Términos y condiciones"
    },
    {
      question: "A 'Confirmation dialog' asks you to:",
      options: ["Verify an action", "Type a story", "Draw a picture", "Close the computer"],
      answer: "Verify an action"
    },
    {
      question: "To 'Cancel the subscription' means:",
      options: ["Cancelar la suscripción", "Pagar la suscripción", "Renovar la suscripción", "Ver la suscripción"],
      answer: "Cancelar la suscripción"
    }
  ],
  active: true
};
