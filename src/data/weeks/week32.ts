import { WeekData } from '../../types';

export const week32: WeekData = {
  week: 32,
  title: "Programming Basics II",
  objective: "Identificar tipos de datos y operadores",
  introText: "Los programas manipulan diferentes tipos de información usando operadores lógicos y matemáticos.",
  keywords: ["String", "Integer", "Boolean", "Operator", "Value"],
  vocabulary: [
    {
      word: "String",
      meaning: "Cadena de texto",
      example: "The name is a string",
      context: "Development",
      phonetic: "/strɪŋ/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week32/string.mp3"
    },
    {
      word: "Integer",
      meaning: "Número entero",
      example: "Age is an integer",
      context: "Development",
      phonetic: "/ˈɪntɪdʒər/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week32/integer.mp3"
    },
    {
      word: "Boolean",
      meaning: "Valor lógico (true/false)",
      example: "IsActive is a boolean",
      context: "Development",
      phonetic: "/ˈbuːliən/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week32/boolean.mp3"
    },
    {
      word: "Operator",
      meaning: "Operador matemático o lógico",
      example: "Use the plus operator",
      context: "Development",
      phonetic: "/ˈɑːpəreɪtər/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week32/operator.mp3"
    },
    {
      word: "Value",
      meaning: "Valor asignado a una variable",
      example: "Assign a value",
      context: "Development",
      phonetic: "/ˈvæljuː/",
      audioUrl: "https://uecbylctkvdmvfqcxlzg.supabase.co/storage/v1/object/public/vocabulary-audio/week32/value.mp3"
    }
  ],
  simulation: {
    simulationId: "SIM-039"
  },
  practice: [
    {
      question: "¿Qué significa String?",
      options: ["Número", "Texto", "Imagen", "Error"],
      answer: "Texto"
    },
    {
      question: "Un valor que solo puede ser Verdadero o Falso es:",
      options: ["Integer", "String", "Boolean", "Operator"],
      answer: "Boolean"
    },
    {
      question: "El símbolo '+' es un:",
      options: ["Value", "Operator", "String", "Integer"],
      answer: "Operator"
    }
  ],
  evaluation: [
    {
      question: "String significa:",
      options: ["Cadena de texto", "Cuerda", "Cable", "Capa"],
      answer: "Cadena de texto"
    },
    {
      question: "Integer significa:",
      options: ["Número entero", "Número decimal", "Letra", "Símbolo"],
      answer: "Número entero"
    },
    {
      question: "Boolean significa:",
      options: ["Valor lógico (T/F)", "Valor numérico", "Valor de texto", "Valor nulo"],
      answer: "Valor lógico (T/F)"
    },
    {
      question: "Operator significa:",
      options: ["Operador", "Operación", "Operario", "Opción"],
      answer: "Operador"
    },
    {
      question: "Value significa:",
      options: ["Valor", "Venta", "Vista", "Voz"],
      answer: "Valor"
    },
    {
      question: "Identify the type: 'True or False is a Boolean'",
      options: ["True", "False", "Boolean", "Type"],
      answer: "Boolean"
    },
    {
      question: "Identify the action: 'Assign a new Value'",
      options: ["Assign", "New", "Value", "Operator"],
      answer: "Value"
    },
    {
      question: "¿Qué significa 'Data type'?",
      options: ["Tipo de dato", "Tipo de disco", "Tipo de teclado", "Tipo de error"],
      answer: "Tipo de dato"
    },
    {
      question: "To 'Declare a variable' means:",
      options: ["Declarar una variable", "Borrar una variable", "Usar una variable", "Cerrar una variable"],
      answer: "Declarar una variable"
    },
    {
      question: "A 'Float' is a number with:",
      options: ["Decimals", "Only zeros", "No value", "Letters"],
      answer: "Decimals"
    }
  ],
  active: true
};
