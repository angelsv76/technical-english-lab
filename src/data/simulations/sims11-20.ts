import { Simulation } from '../../types';

export const simulation11: Simulation = {
  simulationId: "SIM-011",
  type: "button-recognition",
  visual: "[ Search ]",
  instruction: "Observa el icono de la lupa.",
  question: "¿Qué acción realiza este botón?",
  options: ["Delete", "Search", "Save", "Print"],
  answer: "Search"
};

export const simulation12: Simulation = {
  simulationId: "SIM-012",
  type: "menu-recognition",
  visual: "Settings > Privacy > Security",
  instruction: "Navega por las opciones.",
  question: "¿En qué menú te encuentras?",
  options: ["Help", "Settings", "Edit", "Tools"],
  answer: "Settings"
};

export const simulation13: Simulation = {
  simulationId: "SIM-013",
  type: "form-fields",
  visual: "Password: [ ********** ]",
  instruction: "Mira el campo de seguridad.",
  question: "¿Por qué se muestran asteriscos?",
  options: ["Error", "Privacy", "Loading", "Disabled"],
  answer: "Privacy"
};

export const simulation14: Simulation = {
  simulationId: "SIM-014",
  type: "dialog-windows",
  visual: "Warning: Low Disk Space",
  instruction: "Aparece un aviso del sistema.",
  question: "¿Qué nivel de importancia tiene?",
  options: ["Info", "Warning", "Critical", "Success"],
  answer: "Warning"
};

export const simulation15: Simulation = {
  simulationId: "SIM-015",
  type: "system-messages",
  visual: "Downloading... 45%",
  instruction: "Observa la barra de progreso.",
  question: "¿Qué proceso se está ejecutando?",
  options: ["Upload", "Download", "Install", "Delete"],
  answer: "Download"
};

export const simulation16: Simulation = {
  simulationId: "SIM-016",
  type: "installation-steps",
  visual: "Select Destination Folder: C:\\Program Files\\...",
  instruction: "Configura la instalación.",
  question: "¿Qué estás eligiendo?",
  options: ["Language", "Location", "Shortcut", "User"],
  answer: "Location"
};

export const simulation17: Simulation = {
  simulationId: "SIM-017",
  type: "interface-navigation",
  visual: "Home / Projects / WebApp",
  instruction: "Mira la ruta de navegación (Breadcrumbs).",
  question: "¿Dónde estás actualmente?",
  options: ["Home", "Projects", "WebApp", "Root"],
  answer: "WebApp"
};

export const simulation18: Simulation = {
  simulationId: "SIM-018",
  type: "ide-elements",
  visual: "Terminal: $ npm start",
  instruction: "Identifica la consola integrada.",
  question: "¿Para qué sirve este componente?",
  options: ["Edit code", "Run commands", "View images", "Design UI"],
  answer: "Run commands"
};

export const simulation19: Simulation = {
  simulationId: "SIM-019",
  type: "code-editor-interface",
  visual: "// This is a comment",
  instruction: "Analiza la línea de código.",
  question: "¿Qué representa el texto después de //?",
  options: ["Variable", "Function", "Comment", "String"],
  answer: "Comment"
};

export const simulation20: Simulation = {
  simulationId: "SIM-020",
  type: "error-messages",
  visual: "Syntax Error: Missing semicolon",
  instruction: "El compilador muestra un error.",
  question: "¿Qué tipo de error es?",
  options: ["Logic Error", "Syntax Error", "Runtime Error", "Network Error"],
  answer: "Syntax Error"
};
