import { Simulation } from '../../types';

export const sims41_60: Simulation[] = [
  {
    simulationId: "SIM-041",
    type: "Dialog Window",
    visual: "[ Save Changes? ] [ Yes ] [ No ] [ Cancel ]",
    instruction: "Identify the action to keep the work",
    question: "Which button saves the current progress?",
    options: ["Yes", "No", "Cancel", "Save"],
    answer: "Yes"
  },
  {
    simulationId: "SIM-042",
    type: "Dialog Window",
    visual: "[ Discard unsaved changes? ] [ Discard ] [ Keep Editing ]",
    instruction: "Identify the action to continue working",
    question: "Which button allows you to continue editing?",
    options: ["Discard", "Keep Editing", "Cancel", "Exit"],
    answer: "Keep Editing"
  },
  {
    simulationId: "SIM-043",
    type: "Menu Recognition",
    visual: "View > [ Zoom In ] [ Zoom Out ] [ Reset Zoom ]",
    instruction: "Identify the action to make text larger",
    question: "Which option increases the size of the interface?",
    options: ["Zoom In", "Zoom Out", "Reset Zoom", "View"],
    answer: "Zoom In"
  },
  {
    simulationId: "SIM-044",
    type: "Menu Recognition",
    visual: "View > [ Appearance ] > [ Full Screen ]",
    instruction: "Identify the action to maximize the workspace",
    question: "Which option enables Full Screen mode?",
    options: ["Appearance", "Full Screen", "View", "Zoom"],
    answer: "Full Screen"
  },
  {
    simulationId: "SIM-045",
    type: "System Message",
    visual: "[ Warning: Battery Low (10%) ]",
    instruction: "Identify the system alert",
    question: "What type of message is displayed?",
    options: ["Success", "Error", "Warning", "Info"],
    answer: "Warning"
  },
  {
    simulationId: "SIM-046",
    type: "System Message",
    visual: "[ Error: Connection Timeout ]",
    instruction: "Identify the system failure",
    question: "What is the problem reported?",
    options: ["Low battery", "Connection timeout", "File not found", "Disk full"],
    answer: "Connection timeout"
  },
  {
    simulationId: "SIM-047",
    type: "Interface Navigation",
    visual: "[ Home ] [ Profile ] [ Settings ] [ Help ]",
    instruction: "Identify the navigation link for user configuration",
    question: "Which button opens the Settings?",
    options: ["Home", "Profile", "Settings", "Help"],
    answer: "Settings"
  },
  {
    simulationId: "SIM-048",
    type: "Interface Navigation",
    visual: "[ < Back ] [ Forward > ] [ Refresh ]",
    instruction: "Identify the browser action to reload",
    question: "Which button reloads the current page?",
    options: ["Back", "Forward", "Refresh", "Stop"],
    answer: "Refresh"
  },
  {
    simulationId: "SIM-049",
    type: "Form Fields",
    visual: "Username: [__________] *Required",
    instruction: "Identify the mandatory field",
    question: "Is the Username field mandatory?",
    options: ["Yes", "No", "Optional", "Unknown"],
    answer: "Yes"
  },
  {
    simulationId: "SIM-050",
    type: "Form Fields",
    visual: "Bio: [____________________] (Optional)",
    instruction: "Identify the non-mandatory field",
    question: "Is the Bio field required?",
    options: ["Yes", "No", "Mandatory", "Critical"],
    answer: "No"
  },
  {
    simulationId: "SIM-051",
    type: "Button Recognition",
    visual: "[ Submit ] [ Reset ] [ Clear ]",
    instruction: "Identify the action to send data",
    question: "Which button sends the form data?",
    options: ["Submit", "Reset", "Clear", "Cancel"],
    answer: "Submit"
  },
  {
    simulationId: "SIM-052",
    type: "Button Recognition",
    visual: "[ Install ] [ Extract ] [ Browse... ]",
    instruction: "Identify the action to start installation",
    question: "Which button begins the installation process?",
    options: ["Install", "Extract", "Browse", "Cancel"],
    answer: "Install"
  },
  {
    simulationId: "SIM-053",
    type: "Installation Steps",
    visual: "Step 2 of 4: [ License Agreement ] [ I Agree ]",
    instruction: "Identify the legal acceptance action",
    question: "Which button confirms you accept the terms?",
    options: ["Step 2", "License", "I Agree", "Cancel"],
    answer: "I Agree"
  },
  {
    simulationId: "SIM-054",
    type: "Installation Steps",
    visual: "Step 4 of 4: [ Installation Complete ] [ Launch ] [ Finish ]",
    instruction: "Identify the action to open the app immediately",
    question: "Which button starts the application right after finishing?",
    options: ["Launch", "Finish", "Complete", "Step 4"],
    answer: "Launch"
  },
  {
    simulationId: "SIM-055",
    type: "IDE Elements",
    visual: "[ Run ] [ Debug ] [ Stop ] [ Restart ]",
    instruction: "Identify the action to find code errors",
    question: "Which button starts the Debugger?",
    options: ["Run", "Debug", "Stop", "Restart"],
    answer: "Debug"
  },
  {
    simulationId: "SIM-056",
    type: "IDE Elements",
    visual: "[ Build ] [ Rebuild ] [ Clean ]",
    instruction: "Identify the action to compile the project",
    question: "Which button compiles the entire project?",
    options: ["Build", "Rebuild", "Clean", "Stop"],
    answer: "Build"
  },
  {
    simulationId: "SIM-057",
    type: "Code Editor Interface",
    visual: "Line 12: [ Error: Missing semicolon ]",
    instruction: "Identify the syntax problem",
    question: "What is missing in line 12?",
    options: ["Bracket", "Semicolon", "Variable", "Function"],
    answer: "Semicolon"
  },
  {
    simulationId: "SIM-058",
    type: "Code Editor Interface",
    visual: "[ Search: 'main' ] [ 3 matches found ]",
    instruction: "Identify the search result",
    question: "How many times does 'main' appear?",
    options: ["1", "2", "3", "0"],
    answer: "3"
  },
  {
    simulationId: "SIM-059",
    type: "Error Messages",
    visual: "[ 404 Not Found ]",
    instruction: "Identify the web error",
    question: "What does this error mean?",
    options: ["Server error", "Page not found", "Access denied", "Timeout"],
    answer: "Page not found"
  },
  {
    simulationId: "SIM-060",
    type: "Error Messages",
    visual: "[ 403 Forbidden ]",
    instruction: "Identify the permission error",
    question: "What does this error mean?",
    options: ["Not found", "Access denied", "Success", "Loading"],
    answer: "Access denied"
  }
];
