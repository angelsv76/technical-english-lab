import { Simulation } from '../../types';

export const sims101_120: Simulation[] = [
  {
    simulationId: "SIM-101",
    type: "Dialog Window",
    visual: "[ Exit without saving? ] [ Save ] [ Don't Save ] [ Cancel ]",
    instruction: "Identify the action to lose changes",
    question: "Which button closes the app without saving the work?",
    options: ["Save", "Don't Save", "Cancel", "Exit"],
    answer: "Don't Save"
  },
  {
    simulationId: "SIM-102",
    type: "Dialog Window",
    visual: "[ Restart Required ] [ Restart Now ] [ Later ]",
    instruction: "Identify the action to reboot",
    question: "Which button reboots the system immediately?",
    options: ["Restart Now", "Later", "Restart", "Close"],
    answer: "Restart Now"
  },
  {
    simulationId: "SIM-103",
    type: "Menu Recognition",
    visual: "Window > [ Minimize ] [ Maximize ] [ Close ]",
    instruction: "Identify the action to hide the window",
    question: "Which option hides the window to the taskbar?",
    options: ["Minimize", "Maximize", "Close", "Window"],
    answer: "Minimize"
  },
  {
    simulationId: "SIM-104",
    type: "Menu Recognition",
    visual: "Format > [ Bold ] [ Italic ] [ Underline ]",
    instruction: "Identify the text style action",
    question: "Which option makes the text slanted?",
    options: ["Bold", "Italic", "Underline", "Format"],
    answer: "Italic"
  },
  {
    simulationId: "SIM-105",
    type: "System Message",
    visual: "[ Processing... 99% ]",
    instruction: "Identify the process status",
    question: "Is the process almost finished?",
    options: ["Yes", "No", "It just started", "It failed"],
    answer: "Yes"
  },
  {
    simulationId: "SIM-106",
    type: "System Message",
    visual: "[ Waiting for response from server... ]",
    instruction: "Identify the network status",
    question: "What is the system doing?",
    options: ["Sending data", "Waiting for server", "Deleting files", "Restarting"],
    answer: "Waiting for server"
  },
  {
    simulationId: "SIM-107",
    type: "Interface Navigation",
    visual: "[ Tab: Documentation ] [ Tab: API Reference ]",
    instruction: "Identify the active section",
    question: "Which tab is currently selected?",
    options: ["Documentation", "API Reference", "Home", "Settings"],
    answer: "Documentation"
  },
  {
    simulationId: "SIM-108",
    type: "Interface Navigation",
    visual: "[ Link: Privacy Policy ]",
    instruction: "Identify the legal link",
    question: "What document does this link open?",
    options: ["Terms of service", "Privacy Policy", "User manual", "License"],
    answer: "Privacy Policy"
  },
  {
    simulationId: "SIM-109",
    type: "Form Fields",
    visual: "Gender: ( ) Male ( ) Female ( ) Other",
    instruction: "Identify the selection type",
    question: "What type of buttons are these?",
    options: ["Checkboxes", "Radio Buttons", "Dropdowns", "Inputs"],
    answer: "Radio Buttons"
  },
  {
    simulationId: "SIM-110",
    type: "Form Fields",
    visual: "Interests: [x] Coding [ ] Music [x] Gaming",
    instruction: "Identify the selection type",
    question: "What type of boxes are these?",
    options: ["Checkboxes", "Radio Buttons", "Dropdowns", "Inputs"],
    answer: "Checkboxes"
  },
  {
    simulationId: "SIM-111",
    type: "Button Recognition",
    visual: "[ Upgrade to Pro ]",
    instruction: "Identify the premium action",
    question: "What does this button offer?",
    options: ["A better version", "A free version", "To delete the app", "To close the app"],
    answer: "A better version"
  },
  {
    simulationId: "SIM-112",
    type: "Button Recognition",
    visual: "[ Buy Now ] [ Add to Cart ]",
    instruction: "Identify the purchase action",
    question: "Which button adds the item to the shopping list?",
    options: ["Buy Now", "Add to Cart", "Shop", "Purchase"],
    answer: "Add to Cart"
  },
  {
    simulationId: "SIM-113",
    type: "Installation Steps",
    visual: "[ Checking for updates... ]",
    instruction: "Identify the initial step",
    question: "What is the installer doing?",
    options: ["Installing", "Checking for updates", "Uninstalling", "Cleaning"],
    answer: "Checking for updates"
  },
  {
    simulationId: "SIM-114",
    type: "Installation Steps",
    visual: "[ Installation Failed: Error 0x800 ]",
    instruction: "Identify the result",
    question: "Was the installation successful?",
    options: ["Yes", "No", "Partially", "Unknown"],
    answer: "No"
  },
  {
    simulationId: "SIM-115",
    type: "IDE Elements",
    visual: "[ Terminal: npm start ]",
    instruction: "Identify the command",
    question: "What command was typed in the terminal?",
    options: ["npm start", "npm install", "node app", "git push"],
    answer: "npm start"
  },
  {
    simulationId: "SIM-116",
    type: "IDE Elements",
    visual: "[ Console: 0 errors, 2 warnings ]",
    instruction: "Identify the code status",
    question: "How many warnings are there?",
    options: ["0", "1", "2", "3"],
    answer: "2"
  },
  {
    simulationId: "SIM-117",
    type: "Code Editor Interface",
    visual: "function add(a, b) { return a + b; }",
    instruction: "Identify the function purpose",
    question: "What does this function do?",
    options: ["Subtracts numbers", "Adds numbers", "Multiplies numbers", "Divides numbers"],
    answer: "Adds numbers"
  },
  {
    simulationId: "SIM-118",
    type: "Code Editor Interface",
    visual: "if (age >= 18) { console.log('Adult'); }",
    instruction: "Identify the condition",
    question: "At what age is someone considered an adult in this code?",
    options: ["17", "18", "19", "21"],
    answer: "18"
  },
  {
    simulationId: "SIM-119",
    type: "Error Messages",
    visual: "[ Access Denied: Admin privileges required ]",
    instruction: "Identify the requirement",
    question: "What do you need to access this?",
    options: ["A password", "Admin privileges", "An email", "A new computer"],
    answer: "Admin privileges"
  },
  {
    simulationId: "SIM-120",
    type: "Error Messages",
    visual: "[ Success: Course Completed! ]",
    instruction: "Identify the final message",
    question: "What is the result of the course?",
    options: ["Failed", "Completed", "Started", "Pending"],
    answer: "Completed"
  }
];
