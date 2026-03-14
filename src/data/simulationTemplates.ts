export const simulationTemplates: Record<string, any> = {
  "Search": {
    simulation: {
      visual: "[ Search... ]",
      question: "You need to find a specific user in the database. Which UI element do you use?",
      options: ["Search bar", "Delete button", "Settings icon", "Refresh arrow"],
      answer: "Search bar"
    },
    practice: {
      question: "What is the primary purpose of a 'Search' function in an application?",
      options: [
        "To locate specific data or information",
        "To delete old files",
        "To change the user password",
        "To close the application"
      ],
      answer: "To locate specific data or information"
    }
  },
  "Settings": {
    simulation: {
      visual: "⚙️ Settings",
      question: "You want to change the application's theme to Dark Mode. Where do you go?",
      options: ["Settings", "Help", "Profile", "Logout"],
      answer: "Settings"
    },
    practice: {
      question: "In technical English, what does 'Settings' usually refer to?",
      options: [
        "Configuration options for the software",
        "The background image of the desktop",
        "The physical location of the server",
        "The speed of the internet connection"
      ],
      answer: "Configuration options for the software"
    }
  },
  "Download": {
    simulation: {
      visual: "⬇️ Download (15MB)",
      question: "You want to save a PDF report to your local computer. Which action do you take?",
      options: ["Download", "Upload", "Share", "Print"],
      answer: "Download"
    },
    practice: {
      question: "What is the difference between 'Download' and 'Upload'?",
      options: [
        "Download is receiving data; Upload is sending data",
        "Download is sending data; Upload is receiving data",
        "They are the same thing",
        "Download is for images; Upload is for text"
      ],
      answer: "Download is receiving data; Upload is sending data"
    }
  },
  "File": {
    simulation: {
      visual: "File > Save As...",
      question: "You want to save your current work with a new name. Which menu path is correct?",
      options: ["File > Save As...", "Edit > Copy", "View > Zoom", "Help > About"],
      answer: "File > Save As..."
    },
    practice: {
      question: "What does the 'File' menu typically contain in a desktop application?",
      options: [
        "Commands related to document management (Open, Save, Close)",
        "Formatting options for text",
        "Tools for drawing shapes",
        "Social media sharing buttons"
      ],
      answer: "Commands related to document management (Open, Save, Close)"
    }
  },
  "Error": {
    simulation: {
      visual: "⚠️ Error 404: Not Found",
      question: "The browser shows this message. What does it mean?",
      options: [
        "The requested page could not be found",
        "The server is down for maintenance",
        "Your internet connection is lost",
        "The password you entered is incorrect"
      ],
      answer: "The requested page could not be found"
    },
    practice: {
      question: "In software development, what is an 'Error'?",
      options: [
        "An unexpected result or failure in the code",
        "A successful completion of a task",
        "A type of user interface design",
        "A fast way to process data"
      ],
      answer: "An unexpected result or failure in the code"
    }
  },
  "Default": {
    simulation: {
      visual: "[ Technical Element ]",
      question: "Identify the purpose of this technical component in the interface.",
      options: ["Input data", "Output result", "Process request", "Navigation"],
      answer: "Process request"
    },
    practice: {
      question: "How would you define this technical term in a professional environment?",
      options: [
        "A specific tool or concept used in technology",
        "A general word with no technical meaning",
        "A slang term used by non-experts",
        "A type of hardware device"
      ],
      answer: "A specific tool or concept used in technology"
    }
  }
};

export const getTemplateForWord = (word: string) => {
  const normalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  return simulationTemplates[normalizedWord] || simulationTemplates["Default"];
};
