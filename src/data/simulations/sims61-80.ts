import { Simulation } from '../../types';

export const sims61_80: Simulation[] = [
  {
    simulationId: "SIM-061",
    type: "Dialog Window",
    visual: "[ Update Available ] [ Download ] [ Remind Me Later ]",
    instruction: "Identify the action to get the new version",
    question: "Which button starts the update download?",
    options: ["Download", "Remind Me Later", "Update", "Close"],
    answer: "Download"
  },
  {
    simulationId: "SIM-062",
    type: "Dialog Window",
    visual: "[ Low Disk Space ] [ Clean Up ] [ Ignore ]",
    instruction: "Identify the action to free space",
    question: "Which button helps you free up disk space?",
    options: ["Clean Up", "Ignore", "Low Disk", "Close"],
    answer: "Clean Up"
  },
  {
    simulationId: "SIM-063",
    type: "Menu Recognition",
    visual: "Edit > [ Undo ] [ Redo ] [ Cut ] [ Copy ] [ Paste ]",
    instruction: "Identify the action to revert the last change",
    question: "Which option undoes the last action?",
    options: ["Undo", "Redo", "Cut", "Copy"],
    answer: "Undo"
  },
  {
    simulationId: "SIM-064",
    type: "Menu Recognition",
    visual: "File > [ Import ] [ Export ] [ Print ]",
    instruction: "Identify the action to save as a different format",
    question: "Which option allows you to export the file?",
    options: ["Import", "Export", "Print", "File"],
    answer: "Export"
  },
  {
    simulationId: "SIM-065",
    type: "System Message",
    visual: "[ Success: File uploaded successfully ]",
    instruction: "Identify the positive feedback",
    question: "What is the status of the upload?",
    options: ["Success", "Error", "Warning", "Pending"],
    answer: "Success"
  },
  {
    simulationId: "SIM-066",
    type: "System Message",
    visual: "[ Info: System maintenance at 10 PM ]",
    instruction: "Identify the informational message",
    question: "What type of message is this?",
    options: ["Success", "Error", "Warning", "Info"],
    answer: "Info"
  },
  {
    simulationId: "SIM-067",
    type: "Interface Navigation",
    visual: "[ Dashboard ] [ Reports ] [ Analytics ] [ Users ]",
    instruction: "Identify the link for data visualization",
    question: "Which button opens the Analytics section?",
    options: ["Dashboard", "Reports", "Analytics", "Users"],
    answer: "Analytics"
  },
  {
    simulationId: "SIM-068",
    type: "Interface Navigation",
    visual: "[ Previous ] [ 1 ] [ 2 ] [ 3 ] [ Next ]",
    instruction: "Identify the pagination control",
    question: "Which button goes to the next set of results?",
    options: ["Previous", "1", "2", "Next"],
    answer: "Next"
  },
  {
    simulationId: "SIM-069",
    type: "Form Fields",
    visual: "Email: [____________________] *Invalid Format",
    instruction: "Identify the validation error",
    question: "What is wrong with the Email field?",
    options: ["It is empty", "Invalid format", "It is correct", "It is optional"],
    answer: "Invalid format"
  },
  {
    simulationId: "SIM-070",
    type: "Form Fields",
    visual: "Password: [**********] (Strength: High)",
    instruction: "Identify the security level",
    question: "What is the strength of the password?",
    options: ["Low", "Medium", "High", "Weak"],
    answer: "High"
  },
  {
    simulationId: "SIM-071",
    type: "Button Recognition",
    visual: "[ Apply Changes ] [ Revert ]",
    instruction: "Identify the action to save settings",
    question: "Which button applies the new settings?",
    options: ["Apply Changes", "Revert", "Save", "Cancel"],
    answer: "Apply Changes"
  },
  {
    simulationId: "SIM-072",
    type: "Button Recognition",
    visual: "[ Toggle Dark Mode ]",
    instruction: "Identify the theme action",
    question: "What does this button do?",
    options: ["Changes the theme", "Deletes the app", "Restarts the app", "Saves the file"],
    answer: "Changes the theme"
  },
  {
    simulationId: "SIM-073",
    type: "Installation Steps",
    visual: "Step 1 of 3: [ Select Language: English ] [ Next ]",
    instruction: "Identify the language selection",
    question: "What language is currently selected?",
    options: ["Spanish", "English", "French", "German"],
    answer: "English"
  },
  {
    simulationId: "SIM-074",
    type: "Installation Steps",
    visual: "Step 3 of 3: [ Ready to Install ] [ Install Now ] [ Back ]",
    instruction: "Identify the final confirmation action",
    question: "Which button starts the actual installation?",
    options: ["Install Now", "Back", "Ready", "Step 3"],
    answer: "Install Now"
  },
  {
    simulationId: "SIM-075",
    type: "IDE Elements",
    visual: "[ Console ] [ Terminal ] [ Problems ] [ Output ]",
    instruction: "Identify the panel for system output",
    question: "Which tab shows the program's Output?",
    options: ["Console", "Terminal", "Problems", "Output"],
    answer: "Output"
  },
  {
    simulationId: "SIM-076",
    type: "IDE Elements",
    visual: "[ Explorer ] [ Search ] [ Source Control ] [ Extensions ]",
    instruction: "Identify the file management panel",
    question: "Which icon opens the File Explorer?",
    options: ["Explorer", "Search", "Source Control", "Extensions"],
    answer: "Explorer"
  },
  {
    simulationId: "SIM-077",
    type: "Code Editor Interface",
    visual: "Line 45: // TODO: Implement validation",
    instruction: "Identify the code comment",
    question: "What does the developer need to do in line 45?",
    options: ["Delete code", "Implement validation", "Fix a bug", "Run the app"],
    answer: "Implement validation"
  },
  {
    simulationId: "SIM-078",
    type: "Code Editor Interface",
    visual: "Line 1: import { useState } from 'react';",
    instruction: "Identify the library being used",
    question: "Which library is imported in line 1?",
    options: ["React", "Vue", "Angular", "Express"],
    answer: "React"
  },
  {
    simulationId: "SIM-079",
    type: "Error Messages",
    visual: "[ 500 Internal Server Error ]",
    instruction: "Identify the server-side error",
    question: "What type of error is this?",
    options: ["Client error", "Server error", "Network error", "User error"],
    answer: "Server error"
  },
  {
    simulationId: "SIM-080",
    type: "Error Messages",
    visual: "[ 401 Unauthorized ]",
    instruction: "Identify the authentication error",
    question: "What does this error mean?",
    options: ["Not found", "Unauthorized / Login required", "Success", "Forbidden"],
    answer: "Unauthorized / Login required"
  }
];
