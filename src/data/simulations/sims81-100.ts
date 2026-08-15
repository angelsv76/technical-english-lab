import { Simulation } from '../../types';

export const sims81_100: Simulation[] = [
  {
    simulationId: "SIM-081",
    type: "Dialog Window",
    visual: "[ Delete File? ] [ Delete ] [ Cancel ]",
    instruction: "Identify the destructive action",
    question: "Which button removes the file?",
    options: ["Delete", "Cancel", "File", "Close"],
    answer: "Delete"
  },
  {
    simulationId: "SIM-082",
    type: "Dialog Window",
    visual: "[ Reset Settings? ] [ Reset ] [ Keep ]",
    instruction: "Identify the action to restore defaults",
    question: "Which button resets the configuration?",
    options: ["Reset", "Keep", "Settings", "Cancel"],
    answer: "Reset"
  },
  {
    simulationId: "SIM-083",
    type: "Menu Recognition",
    visual: "Tools > [ Debugger ] [ Profiler ] [ Linter ]",
    instruction: "Identify the code analysis tool",
    question: "Which option opens the Linter?",
    options: ["Debugger", "Profiler", "Linter", "Tools"],
    answer: "Linter"
  },
  {
    simulationId: "SIM-084",
    type: "Menu Recognition",
    visual: "Help > [ Documentation ] [ Support ] [ About ]",
    instruction: "Identify the technical reference option",
    question: "Which option opens the Documentation?",
    options: ["Documentation", "Support", "About", "Help"],
    answer: "Documentation"
  },
  {
    simulationId: "SIM-085",
    type: "System Message",
    visual: "[ Alert: Unauthorized login attempt ]",
    instruction: "Identify the security message",
    question: "What type of message is this?",
    options: ["Alert", "Success", "Info", "Notice"],
    answer: "Alert"
  },
  {
    simulationId: "SIM-086",
    type: "System Message",
    visual: "[ Notice: Your trial ends in 3 days ]",
    instruction: "Identify the informational notice",
    question: "What is the subject of this notice?",
    options: ["Trial expiration", "System error", "New message", "Update"],
    answer: "Trial expiration"
  },
  {
    simulationId: "SIM-087",
    type: "Interface Navigation",
    visual: "[ Home ] > [ Projects ] > [ Web App ]",
    instruction: "Identify the breadcrumb path",
    question: "What is the current location?",
    options: ["Home", "Projects", "Web App", "Dashboard"],
    answer: "Web App"
  },
  {
    simulationId: "SIM-088",
    type: "Interface Navigation",
    visual: "[ Sidebar: { Files, Search, Settings } ]",
    instruction: "Identify the sidebar content",
    question: "Which option is NOT in the sidebar?",
    options: ["Files", "Search", "Settings", "Logout"],
    answer: "Logout"
  },
  {
    simulationId: "SIM-089",
    type: "Form Fields",
    visual: "Phone: [__________] (Numbers only)",
    instruction: "Identify the input restriction",
    question: "What type of data is allowed in the Phone field?",
    options: ["Letters", "Numbers", "Symbols", "Any"],
    answer: "Numbers"
  },
  {
    simulationId: "SIM-090",
    type: "Form Fields",
    visual: "Country: [ Select... v ]",
    instruction: "Identify the input type",
    question: "What type of input is this?",
    options: ["Text input", "Dropdown / Select", "Checkbox", "Radio button"],
    answer: "Dropdown / Select"
  },
  {
    simulationId: "SIM-091",
    type: "Button Recognition",
    visual: "[ Sign Up ] [ Log In ]",
    instruction: "Identify the action for new users",
    question: "Which button is for creating a new account?",
    options: ["Sign Up", "Log In", "Register", "Join"],
    answer: "Sign Up"
  },
  {
    simulationId: "SIM-092",
    type: "Button Recognition",
    visual: "[ Forgot Password? ]",
    instruction: "Identify the recovery action",
    question: "What does this link help you do?",
    options: ["Recover password", "Change email", "Delete account", "Login"],
    answer: "Recover password"
  },
  {
    simulationId: "SIM-093",
    type: "Installation Steps",
    visual: "[ Choose Install Location: C:\\Program Files\\... ] [ Browse ]",
    instruction: "Identify the path selection action",
    question: "Which button allows you to change the installation folder?",
    options: ["Browse", "Install", "Next", "Cancel"],
    answer: "Browse"
  },
  {
    simulationId: "SIM-094",
    type: "Installation Steps",
    visual: "[ Extracting files... 45% ]",
    instruction: "Identify the current process",
    question: "What is the system doing?",
    options: ["Downloading", "Extracting files", "Deleting", "Restarting"],
    answer: "Extracting files"
  },
  {
    simulationId: "SIM-095",
    type: "IDE Elements",
    visual: "[ Breakpoint set at line 20 ]",
    instruction: "Identify the debugging marker",
    question: "What was set at line 20?",
    options: ["Error", "Breakpoint", "Comment", "Variable"],
    answer: "Breakpoint"
  },
  {
    simulationId: "SIM-096",
    type: "IDE Elements",
    visual: "[ Git: 2 pending changes ]",
    instruction: "Identify the version control status",
    question: "How many changes are pending in Git?",
    options: ["1", "2", "3", "0"],
    answer: "2"
  },
  {
    simulationId: "SIM-097",
    type: "Code Editor Interface",
    visual: "const [count, setCount] = useState(0);",
    instruction: "Identify the variable name",
    question: "What is the name of the state variable?",
    options: ["count", "setCount", "useState", "const"],
    answer: "count"
  },
  {
    simulationId: "SIM-098",
    type: "Code Editor Interface",
    visual: "console.log('Hello World');",
    instruction: "Identify the output message",
    question: "What message will be printed in the console?",
    options: ["Hello", "World", "Hello World", "Console"],
    answer: "Hello World"
  },
  {
    simulationId: "SIM-099",
    type: "Error Messages",
    visual: "[ Network Error: No internet connection ]",
    instruction: "Identify the connectivity problem",
    question: "Why is there an error?",
    options: ["No internet", "Server down", "Invalid password", "File missing"],
    answer: "No internet"
  },
  {
    simulationId: "SIM-100",
    type: "Error Messages",
    visual: "[ Out of Memory ]",
    instruction: "Identify the resource error",
    question: "What resource is exhausted?",
    options: ["Disk space", "Memory (RAM)", "CPU", "Battery"],
    answer: "Memory (RAM)"
  }
];
