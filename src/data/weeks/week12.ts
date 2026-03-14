import { WeekData } from '../../types';

export const week12: WeekData = {
  week: 12,
  title: "Technical Instructions II",
  objective: "Entender comandos de teclado y atajos",
  introText: "El uso de atajos de teclado (Shortcuts) aumenta la eficiencia en el desarrollo de software.",
  keywords: ["Press", "Hold", "Shortcut", "Key", "Command"],
  vocabulary: [
    {
      word: "Press",
      meaning: "Presionar una tecla",
      example: "Press Enter",
      context: "Action"
    },
    {
      word: "Hold",
      meaning: "Mantener presionada una tecla",
      example: "Hold Shift",
      context: "Action"
    },
    {
      word: "Shortcut",
      meaning: "Atajo de teclado",
      example: "Use the shortcut Ctrl+C",
      context: "Interface"
    },
    {
      word: "Key",
      meaning: "Tecla física del teclado",
      example: "The Alt key",
      context: "Hardware"
    },
    {
      word: "Command",
      meaning: "Comando u orden del sistema",
      example: "Type the command",
      context: "System"
    }
  ],
  simulation: {
    simulationId: "SIM-018"
  },
  practice: [
    {
      question: "¿Qué significa Press?",
      options: ["Mantener", "Presionar", "Soltar", "Borrar"],
      answer: "Presionar"
    },
    {
      question: "Si debes dejar presionada una tecla, la instrucción es:",
      options: ["Press", "Hold", "Shortcut", "Key"],
      answer: "Hold"
    },
    {
      question: "Ctrl+V es un ejemplo de:",
      options: ["Key", "Command", "Shortcut", "Press"],
      answer: "Shortcut"
    }
  ],
  evaluation: [
    {
      question: "Press significa:",
      options: ["Presionar", "Soltar", "Cerrar", "Abrir"],
      answer: "Presionar"
    },
    {
      question: "Hold significa:",
      options: ["Presionar una vez", "Mantener presionado", "Soltar rápido", "No tocar"],
      answer: "Mantener presionado"
    },
    {
      question: "Shortcut se traduce como:",
      options: ["Camino largo", "Atajo / Acceso rápido", "Error de teclado", "Tecla rota"],
      answer: "Atajo / Acceso rápido"
    },
    {
      question: "Key se refiere a:",
      options: ["El mouse", "La pantalla", "Una tecla", "Un cable"],
      answer: "Una tecla"
    },
    {
      question: "Command significa:",
      options: ["Comando / Orden", "Pregunta", "Sugerencia", "Aviso"],
      answer: "Comando / Orden"
    },
    {
      question: "Identify the action: 'Press the spacebar'",
      options: ["Press", "The", "Spacebar", "Hold"],
      answer: "Press"
    },
    {
      question: "Identify the key: 'Hold the Ctrl key'",
      options: ["Hold", "The", "Ctrl", "Key"],
      answer: "Ctrl"
    },
    {
      question: "¿Qué significa 'Function keys'?",
      options: ["Teclas de función (F1-F12)", "Teclas de letras", "Teclas de números", "Teclas de flechas"],
      answer: "Teclas de función (F1-F12)"
    },
    {
      question: "The 'Enter key' is also called:",
      options: ["Return", "Escape", "Shift", "Tab"],
      answer: "Return"
    },
    {
      question: "To 'Execute a command' means:",
      options: ["Ejecutar un comando", "Borrar un comando", "Escribir un comando", "Copiar un comando"],
      answer: "Ejecutar un comando"
    }
  ],
  active: true
};
