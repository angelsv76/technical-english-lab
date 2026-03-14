import { Simulation } from '../../types';

export const simulation01: Simulation = {
  simulationId: "SIM-001",
  type: "button-recognition",
  visual: "[ Save ]",
  instruction: "Observa el elemento de interfaz.",
  question: "¿Qué tipo de elemento es?",
  options: ["Button", "Menu", "Form", "Message"],
  answer: "Button"
};

export const simulation02: Simulation = {
  simulationId: "SIM-002",
  type: "menu-recognition",
  visual: "File | Edit | View | Help",
  instruction: "Analiza la barra superior del software.",
  question: "¿Cómo se llama este componente?",
  options: ["Toolbar", "Menu Bar", "Status Bar", "Sidebar"],
  answer: "Menu Bar"
};

export const simulation03: Simulation = {
  simulationId: "SIM-003",
  type: "form-fields",
  visual: "Username: [__________]",
  instruction: "Identifica el campo de entrada.",
  question: "¿Qué acción realizas aquí?",
  options: ["Click", "Type text", "Delete", "Scroll"],
  answer: "Type text"
};

export const simulation04: Simulation = {
  simulationId: "SIM-004",
  type: "dialog-windows",
  visual: "Delete file? [ Cancel ] [ OK ]",
  instruction: "Se muestra una ventana emergente.",
  question: "¿Qué tipo de ventana es?",
  options: ["Alert", "Confirmation Dialog", "Error Message", "Tooltip"],
  answer: "Confirmation Dialog"
};

export const simulation05: Simulation = {
  simulationId: "SIM-005",
  type: "system-messages",
  visual: "Update successful!",
  instruction: "Lee el mensaje del sistema.",
  question: "¿Qué indica este mensaje?",
  options: ["Error", "Success", "Warning", "Loading"],
  answer: "Success"
};

export const simulation06: Simulation = {
  simulationId: "SIM-006",
  type: "installation-steps",
  visual: "Step 1 of 3: License Agreement",
  instruction: "Observa el proceso de instalación.",
  question: "¿En qué etapa se encuentra?",
  options: ["Finish", "Setup", "License", "Download"],
  answer: "License"
};

export const simulation07: Simulation = {
  simulationId: "SIM-007",
  type: "interface-navigation",
  visual: "< Back | Next >",
  instruction: "Mira los controles de navegación.",
  question: "¿Qué botón usarías para avanzar?",
  options: ["Back", "Next", "Cancel", "Finish"],
  answer: "Next"
};

export const simulation08: Simulation = {
  simulationId: "SIM-008",
  type: "ide-elements",
  visual: "Project Explorer [ folder+ ]",
  instruction: "Identifica el panel lateral en el IDE.",
  question: "¿Para qué sirve este panel?",
  options: ["Run code", "Manage files", "Debug", "Settings"],
  answer: "Manage files"
};

export const simulation09: Simulation = {
  simulationId: "SIM-009",
  type: "code-editor-interface",
  visual: "1: function main() { \n2:   console.log('Hello'); \n3: }",
  instruction: "Observa el área de trabajo.",
  question: "¿Cómo se llama este componente?",
  options: ["Terminal", "Code Editor", "Output", "Console"],
  answer: "Code Editor"
};

export const simulation10: Simulation = {
  simulationId: "SIM-010",
  type: "error-messages",
  visual: "404 Not Found",
  instruction: "Se muestra un código de estado.",
  question: "¿Qué significa este error?",
  options: ["Access denied", "Page not found", "Server error", "Timeout"],
  answer: "Page not found"
};
