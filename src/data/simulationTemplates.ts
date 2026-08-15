export const simulationTemplates: Record<string, any> = {
  "Search": {
    simulation: {
      visual: "[ Search... ]",
      question: "You need to find a specific user in the database. Which UI element do you use?",
      options: ["Search bar", "Delete button", "Settings icon", "Refresh arrow"],
      answer: "Search bar",
      explanation: "'Search' significa buscar: la barra de búsqueda (search bar) sirve para localizar información específica, como un usuario en la base de datos."
    },
    practice: {
      question: "What is the primary purpose of a 'Search' function in an application?",
      options: [
        "To locate specific data or information",
        "To delete old files",
        "To change the user password",
        "To close the application"
      ],
      answer: "To locate specific data or information",
      explanation: "La función 'Search' (buscar) sirve para localizar datos o información específica dentro del sistema, no para borrar ni configurar."
    }
  },
  "Settings": {
    simulation: {
      visual: "⚙️ Settings",
      question: "You want to change the application's theme to Dark Mode. Where do you go?",
      options: ["Settings", "Help", "Profile", "Logout"],
      answer: "Settings",
      explanation: "'Settings' significa configuraciones: es donde se cambian las opciones de la aplicación, como el tema o el idioma."
    },
    practice: {
      question: "In technical English, what does 'Settings' usually refer to?",
      options: [
        "Configuration options for the software",
        "The background image of the desktop",
        "The physical location of the server",
        "The speed of the internet connection"
      ],
      answer: "Configuration options for the software",
      explanation: "'Settings' se refiere a las opciones de configuración del software: ajustes que el usuario puede modificar."
    }
  },
  "Download": {
    simulation: {
      visual: "⬇️ Download (15MB)",
      question: "You want to save a PDF report to your local computer. Which action do you take?",
      options: ["Download", "Upload", "Share", "Print"],
      answer: "Download",
      explanation: "'Download' significa descargar: traer un archivo desde internet o un servidor hacia tu computadora. 'Upload' es lo contrario (subir)."
    },
    practice: {
      question: "What is the difference between 'Download' and 'Upload'?",
      options: [
        "Download is receiving data; Upload is sending data",
        "Download is sending data; Upload is receiving data",
        "They are the same thing",
        "Download is for images; Upload is for text"
      ],
      answer: "Download is receiving data; Upload is sending data",
      explanation: "'Download' es recibir datos (descargar hacia tu equipo) y 'Upload' es enviar datos (subir a un servidor). Son acciones opuestas."
    }
  },
  "File": {
    simulation: {
      visual: "File > Save As...",
      question: "You want to save your current work with a new name. Which menu path is correct?",
      options: ["File > Save As...", "Edit > Copy", "View > Zoom", "Help > About"],
      answer: "File > Save As...",
      explanation: "El menú 'File' (archivo) contiene las acciones sobre documentos: 'Save As...' significa guardar con otro nombre."
    },
    practice: {
      question: "What does the 'File' menu typically contain in a desktop application?",
      options: [
        "Commands related to document management (Open, Save, Close)",
        "Formatting options for text",
        "Tools for drawing shapes",
        "Social media sharing buttons"
      ],
      answer: "Commands related to document management (Open, Save, Close)",
      explanation: "El menú 'File' agrupa los comandos de gestión de documentos: abrir (Open), guardar (Save) y cerrar (Close)."
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
      answer: "The requested page could not be found",
      explanation: "'Error 404: Not Found' significa que la página solicitada no se encontró en el servidor. 'Not found' = no encontrado."
    },
    practice: {
      question: "In software development, what is an 'Error'?",
      options: [
        "An unexpected result or failure in the code",
        "A successful completion of a task",
        "A type of user interface design",
        "A fast way to process data"
      ],
      answer: "An unexpected result or failure in the code",
      explanation: "Un 'Error' es un fallo o resultado inesperado en el código o el sistema, no algo exitoso ni un elemento de diseño."
    }
  },
  "Default": {
    simulation: {
      visual: "[ Technical Element ]",
      question: "Identify the purpose of this technical component in the interface.",
      options: ["Input data", "Output result", "Process request", "Navigation"],
      answer: "Process request",
      explanation: "Este componente procesa una solicitud (process request): recibe una acción del usuario y la ejecuta."
    },
    practice: {
      question: "How would you define this technical term in a professional environment?",
      options: [
        "A specific tool or concept used in technology",
        "A general word with no technical meaning",
        "A slang term used by non-experts",
        "A type of hardware device"
      ],
      answer: "A specific tool or concept used in technology",
      explanation: "En inglés técnico, este término nombra una herramienta o concepto específico de tecnología, con un significado preciso en su contexto."
    }
  }
};

export const getTemplateForWord = (word: string) => {
  const normalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  return simulationTemplates[normalizedWord] || simulationTemplates["Default"];
};
