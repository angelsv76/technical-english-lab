import { WeekData } from '../../types';

export const week34: WeekData = {
  week: 34,
  title: "Programming Basics IV",
  objective: "Identificar conceptos de bases de datos",
  introText: "Las bases de datos permiten almacenar y organizar grandes cantidades de información de forma persistente.",
  keywords: ["Database", "Table", "Row", "Column", "Record"],
  vocabulary: [
    {
      word: "Database",
      meaning: "Base de datos",
      example: "Connect to the database",
      context: "Data"
    },
    {
      word: "Table",
      meaning: "Tabla de datos",
      example: "Create a new table",
      context: "Data"
    },
    {
      word: "Row",
      meaning: "Fila o registro horizontal",
      example: "Insert a new row",
      context: "Data"
    },
    {
      word: "Column",
      meaning: "Columna o campo vertical",
      example: "Add a column to the table",
      context: "Data"
    },
    {
      word: "Record",
      meaning: "Registro de información",
      example: "Update the record",
      context: "Data"
    }
  ],
  simulation: {
    simulationId: "SIM-009"
  },
  practice: [
    {
      question: "¿Qué significa Database?",
      options: ["Base de datos", "Base de madera", "Base de dibujo", "Base de error"],
      answer: "Base de datos"
    },
    {
      question: "La estructura vertical de una tabla es una:",
      options: ["Row", "Column", "Record", "Table"],
      answer: "Column"
    },
    {
      question: "Un conjunto de datos sobre un solo elemento es un:",
      options: ["Record", "Column", "Database", "Table"],
      answer: "Record"
    }
  ],
  evaluation: [
    {
      question: "Database significa:",
      options: ["Base de datos", "Base de archivos", "Base de imágenes", "Base de sonidos"],
      answer: "Base de datos"
    },
    {
      question: "Table significa:",
      options: ["Tabla", "Mesa", "Cuadro", "Marco"],
      answer: "Tabla"
    },
    {
      question: "Row significa:",
      options: ["Fila", "Columna", "Celda", "Borde"],
      answer: "Fila"
    },
    {
      question: "Column significa:",
      options: ["Columna", "Fila", "Celda", "Borde"],
      answer: "Columna"
    },
    {
      question: "Record significa:",
      options: ["Registro", "Recuerdo", "Regalo", "Relato"],
      answer: "Registro"
    },
    {
      question: "Identify the element: 'Insert a Row into the Table'",
      options: ["Insert", "Row", "Table", "Column"],
      answer: "Row"
    },
    {
      question: "Identify the action: 'Query the Database'",
      options: ["Query", "Database", "The", "Connect"],
      answer: "Database"
    },
    {
      question: "¿Qué significa 'Primary key'?",
      options: ["Llave primaria (identificador único)", "Llave de casa", "Llave de teclado", "Llave de agua"],
      answer: "Llave primaria (identificador único)"
    },
    {
      question: "To 'Update a record' means:",
      options: ["Actualizar un registro", "Borrar un registro", "Crear un registro", "Ignorar un registro"],
      answer: "Actualizar un registro"
    },
    {
      question: "A 'Relational database' uses:",
      options: ["Tables", "Images only", "Videos only", "No data"],
      answer: "Tables"
    }
  ],
  active: true
};
