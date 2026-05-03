import { WeekData } from '../../types';

export const week10: WeekData = {
  week: 10,
  title: "Software Maintenance Actions",
  objective: "Aprender verbos de mantenimiento y actualización",
  introText: "El software requiere actualizaciones constantes y corrección de errores para funcionar bien.",
  keywords: ["Update", "Upgrade", "Fix", "Patch", "Debug"],
  vocabulary: [
    {
      word: "Update",
      meaning: "Actualizar a una versión más reciente",
      example: "Update the software",
      context: "Maintenance",
      phonetic: "/ʌpˈdeɪt/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/update.wav"
    },
    {
      word: "Upgrade",
      meaning: "Mejorar a una versión superior o hardware",
      example: "Upgrade your plan",
      context: "Maintenance",
      phonetic: "/ʌpˈɡreɪd/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/upgrade.wav"
    },
    {
      word: "Fix",
      meaning: "Corregir o reparar un error",
      example: "Fix the bug",
      context: "Maintenance",
      phonetic: "/fɪks/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/fix.wav"Action",
      },
    {
      word: "Patch",
      meaning: "Parche de seguridad o corrección rápida",
      example: "Apply the security patch",
      context: "Maintenance",
      phonetic: "/pætʃ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/patch.wav"
    },
    {
      word: "Debug",
      meaning: "Depurar o buscar errores en el código",
      example: "Debug the application",
      context: "Development",
      phonetic: "/diːˈbʌɡ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/debug.wav"
    }
  ],
  simulation: {
    simulationId: "SIM-028"
  },
  practice: [
    {
      question: "¿Qué significa Fix?",
      options: ["Romper", "Corregir", "Mover", "Copiar"],
      answer: "Corregir"
    },
    {
      question: "Para mejorar tu cuenta a una versión de pago, haces un:",
      options: ["Update", "Upgrade", "Fix", "Debug"],
      answer: "Upgrade"
    },
    {
      question: "El proceso de buscar errores en el código se llama:",
      options: ["Patch", "Update", "Debug", "Fix"],
      answer: "Debug"
    }
  ],
  evaluation: [
    {
      question: "Update significa:",
      options: ["Actualizar", "Borrar", "Cerrar", "Mover"],
      answer: "Actualizar"
    },
    {
      question: "Upgrade significa:",
      options: ["Bajar de nivel", "Mejorar / Subir de nivel", "Eliminar", "Copiar"],
      answer: "Mejorar / Subir de nivel"
    },
    {
      question: "Fix significa:",
      options: ["Romper", "Reparar / Corregir", "Ignorar", "Ocultar"],
      answer: "Reparar / Corregir"
    },
    {
      question: "Patch se refiere a:",
      options: ["Un error grave", "Un parche / corrección", "Un virus", "Una imagen"],
      answer: "Un parche / corrección"
    },
    {
      question: "Debug significa:",
      options: ["Crear errores", "Depurar / Buscar errores", "Borrar código", "Guardar código"],
      answer: "Depurar / Buscar errores"
    },
    {
      question: "Identify the action: 'Fix the syntax error'",
      options: ["Fix", "Syntax", "Error", "Update"],
      answer: "Fix"
    },
    {
      question: "Identify the object: 'Update the database schema'",
      options: ["Update", "Database", "Schema", "Fix"],
      answer: "Schema"
    },
    {
      question: "¿Qué es un 'Bug'?",
      options: ["Una mejora", "Un error de software", "Un tipo de archivo", "Un usuario"],
      answer: "Un error de software"
    },
    {
      question: "To 'Apply a patch' means to:",
      options: ["Install a fix", "Delete the app", "Rename a file", "Search for data"],
      answer: "Install a fix"
    },
    {
      question: "A 'System update' usually:",
      options: ["Improves performance", "Deletes files", "Changes the owner", "Breaks the PC"],
      answer: "Improves performance"
    }
  ],
  active: true
};
