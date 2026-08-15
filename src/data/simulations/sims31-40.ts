import { Simulation } from '../../types';

export const simulation31: Simulation = {
  simulationId: "SIM-031",
  type: "button-recognition",
  visual: "[ Upload ]",
  instruction: "Observa el botón con la flecha hacia arriba.",
  question: "¿Qué acción realiza?",
  options: ["Download", "Upload", "Refresh", "Exit"],
  answer: "Upload"
};

export const simulation32: Simulation = {
  simulationId: "SIM-032",
  type: "menu-recognition",
  visual: "Tools > Extension Manager",
  instruction: "Busca complementos del software.",
  question: "¿En qué menú se encuentran?",
  options: ["Edit", "Tools", "View", "File"],
  answer: "Tools"
};

export const simulation33: Simulation = {
  simulationId: "SIM-033",
  type: "form-fields",
  visual: "Country: [ Select v ]",
  instruction: "Identifica el tipo de lista.",
  question: "¿Cómo se llama este control?",
  options: ["Input", "Dropdown / Select", "Checkbox", "Textarea"],
  answer: "Dropdown / Select"
};

export const simulation34: Simulation = {
  simulationId: "SIM-034",
  type: "dialog-windows",
  visual: "New Folder Name: [__________]",
  instruction: "Creas una nueva carpeta.",
  question: "¿Qué tipo de ventana es?",
  options: ["Alert", "Prompt / Input Dialog", "Error", "Notification"],
  answer: "Prompt / Input Dialog"
};

export const simulation35: Simulation = {
  simulationId: "SIM-035",
  type: "system-messages",
  visual: "Battery Low: 10% remaining",
  instruction: "Mira el aviso de energía.",
  question: "¿Qué tipo de mensaje es?",
  options: ["Success", "Info", "Warning", "Critical"],
  answer: "Warning"
};

export const simulation36: Simulation = {
  simulationId: "SIM-036",
  type: "installation-steps",
  visual: "Installation Complete! [ Finish ]",
  instruction: "El proceso ha terminado.",
  question: "¿Qué botón debes presionar?",
  options: ["Cancel", "Back", "Finish", "Next"],
  answer: "Finish"
};

export const simulation37: Simulation = {
  simulationId: "SIM-037",
  type: "interface-navigation",
  visual: "[ < ] [ > ] [ Refresh ]",
  instruction: "Mira los controles del navegador web.",
  question: "¿Qué botón recarga la página?",
  options: ["Back", "Forward", "Refresh", "Stop"],
  answer: "Refresh"
};

export const simulation38: Simulation = {
  simulationId: "SIM-038",
  type: "ide-elements",
  visual: "Breakpoints [ red dot ]",
  instruction: "Observa el margen del editor.",
  question: "¿Para qué sirve este punto rojo?",
  options: ["Error", "Breakpoint (Debug)", "Comment", "Save"],
  answer: "Breakpoint (Debug)"
};

export const simulation39: Simulation = {
  simulationId: "SIM-039",
  type: "code-editor-interface",
  visual: "const x = 10;",
  instruction: "Analiza la declaración.",
  question: "¿Qué representa 'const'?",
  options: ["Variable", "Constant", "Function", "Loop"],
  answer: "Constant"
};

export const simulation40: Simulation = {
  simulationId: "SIM-040",
  type: "error-messages",
  visual: "Internal Server Error (500)",
  instruction: "La web no carga correctamente.",
  question: "¿Dónde está el problema?",
  options: ["User's computer", "Internet provider", "Server", "Browser"],
  answer: "Server"
};
