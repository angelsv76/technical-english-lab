import { Simulation } from '../../types';

export const simulation21: Simulation = {
  simulationId: "SIM-021",
  type: "button-recognition",
  visual: "[ Login ]",
  instruction: "Observa el botón de acceso.",
  question: "¿Qué acción inicia este botón?",
  options: ["Sign up", "Authentication", "Logout", "Reset"],
  answer: "Authentication"
};

export const simulation22: Simulation = {
  simulationId: "SIM-022",
  type: "menu-recognition",
  visual: "View > Zoom In / Zoom Out",
  instruction: "Busca opciones de visualización.",
  question: "¿Qué menú contiene estas opciones?",
  options: ["File", "View", "Window", "Help"],
  answer: "View"
};

export const simulation23: Simulation = {
  simulationId: "SIM-023",
  type: "form-fields",
  visual: "Gender: ( ) Male ( ) Female",
  instruction: "Identifica el tipo de control.",
  question: "¿Cómo se llaman estos botones?",
  options: ["Checkbox", "Radio Button", "Dropdown", "Toggle"],
  answer: "Radio Button"
};

export const simulation24: Simulation = {
  simulationId: "SIM-024",
  type: "dialog-windows",
  visual: "Save changes before closing?",
  instruction: "Cierras el programa sin guardar.",
  question: "¿Qué te está pidiendo el sistema?",
  options: ["Confirmation", "Error", "Notification", "Tooltip"],
  answer: "Confirmation"
};

export const simulation25: Simulation = {
  simulationId: "SIM-025",
  type: "system-messages",
  visual: "Connection lost. Reconnecting...",
  instruction: "Mira el estado de la red.",
  question: "¿Qué problema ocurrió?",
  options: ["Disk full", "Network error", "CPU overload", "Memory leak"],
  answer: "Network error"
};

export const simulation26: Simulation = {
  simulationId: "SIM-026",
  type: "installation-steps",
  visual: "Checking for updates...",
  instruction: "El instalador se está preparando.",
  question: "¿Qué está haciendo el software?",
  options: ["Installing", "Updating", "Checking", "Uninstalling"],
  answer: "Checking"
};

export const simulation27: Simulation = {
  simulationId: "SIM-027",
  type: "interface-navigation",
  visual: "[ Home ] [ About ] [ Services ] [ Contact ]",
  instruction: "Observa el menú principal.",
  question: "¿Cómo se llama este componente?",
  options: ["Navigation Bar", "Footer", "Sidebar", "Modal"],
  answer: "Navigation Bar"
};

export const simulation28: Simulation = {
  simulationId: "SIM-028",
  type: "ide-elements",
  visual: "Debug Console [ >_ ]",
  instruction: "Identifica la herramienta de depuración.",
  question: "¿Para qué sirve este panel?",
  options: ["Write code", "Find bugs", "Design icons", "Play music"],
  answer: "Find bugs"
};

export const simulation29: Simulation = {
  simulationId: "SIM-029",
  type: "code-editor-interface",
  visual: "import React from 'react';",
  instruction: "Analiza la primera línea de un archivo.",
  question: "¿Qué acción realiza esta línea?",
  options: ["Export", "Import", "Delete", "Comment"],
  answer: "Import"
};

export const simulation30: Simulation = {
  simulationId: "SIM-030",
  type: "error-messages",
  visual: "Permission Denied",
  instruction: "Intentas abrir un archivo protegido.",
  question: "¿Qué tipo de error es?",
  options: ["Network Error", "Access Error", "Syntax Error", "Hardware Error"],
  answer: "Access Error"
};
