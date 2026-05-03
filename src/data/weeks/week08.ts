import { WeekData } from '../../types';

export const week08: WeekData = {
  week: 8,
  title: "Software Installation Actions",
  objective: "Entender el proceso de instalación de software",
  introText: "Instalar software requiere seguir una serie de pasos técnicos y configurar opciones.",
  keywords: ["Install", "Uninstall", "Setup", "Run", "Launch"],
  vocabulary: [
    {
      word: "Install",
      meaning: "Instalar software en el sistema",
      example: "Install the driver",
      context: "Action",
      phonetic: "/ɪnˈstɔːl/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/install.wav"
    },
    {
      word: "Uninstall",
      meaning: "Desinstalar o quitar software",
      example: "Uninstall unused apps",
      context: "Action",
      phonetic: "/ˌʌnɪnˈstɔːl/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/uninstall.wav"
    },
    {
      word: "Setup",
      meaning: "Configuración inicial o instalador",
      example: "Run the setup file",
      context: "Action",
      honetic: "/ˈsɛtʌp/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/setup.wav"
    },
    {
      word: "Run",
      meaning: "Ejecutar un programa o comando",
      example: "Run the script",
      context: "Action",
      phonetic: "/rʌn/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/run.wav"
    },
    {
      word: "Launch",
      meaning: "Lanzar o abrir una aplicación",
      example: "Launch the browser",
      context: "Action",
      phonetic: "/lɔːntʃ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week${i+1}/launch.wav"
    }
  ],
  simulation: {
    simulationId: "SIM-006"
  },
  practice: [
    {
      question: "¿Qué significa Uninstall?",
      options: ["Instalar", "Desinstalar", "Ejecutar", "Lanzar"],
      answer: "Desinstalar"
    },
    {
      question: "Para abrir una app por primera vez, dices:",
      options: ["Uninstall", "Launch", "Setup", "Install"],
      answer: "Launch"
    },
    {
      question: "El archivo que inicia la instalación es el:",
      options: ["Run", "Setup", "Uninstall", "Launch"],
      answer: "Setup"
    }
  ],
  evaluation: [
    {
      question: "Install significa:",
      options: ["Borrar", "Instalar", "Cerrar", "Mover"],
      answer: "Instalar"
    },
    {
      question: "Uninstall significa:",
      options: ["Instalar", "Desinstalar", "Actualizar", "Ejecutar"],
      answer: "Desinstalar"
    },
    {
      question: "Setup se refiere a:",
      options: ["Configuración / Instalador", "Error de sistema", "Archivo de texto", "Imagen"],
      answer: "Configuración / Instalador"
    },
    {
      question: "Run significa:",
      options: ["Correr / Ejecutar", "Caminar", "Saltar", "Parar"],
      answer: "Correr / Ejecutar"
    },
    {
      question: "Launch significa:",
      options: ["Cerrar", "Lanzar / Iniciar", "Borrar", "Guardar"],
      answer: "Lanzar / Iniciar"
    },
    {
      question: "Identify the action: 'Run the installer'",
      options: ["Run", "The", "Installer", "Setup"],
      answer: "Run"
    },
    {
      question: "Identify the object: 'Uninstall the program'",
      options: ["Uninstall", "The", "Program", "Launch"],
      answer: "Program"
    },
    {
      question: "¿Qué significa 'Installation wizard'?",
      options: ["Mago de instalación", "Asistente de instalación", "Error de instalación", "Virus"],
      answer: "Asistente de instalación"
    },
    {
      question: "To 'Execute' a file is the same as to:",
      options: ["Run it", "Delete it", "Rename it", "Copy it"],
      answer: "Run it"
    },
    {
      question: "A 'Launch icon' is used to:",
      options: ["Start the app", "Close the app", "Delete the app", "Update the app"],
      answer: "Start the app"
    }
  ],
  active: true
};
