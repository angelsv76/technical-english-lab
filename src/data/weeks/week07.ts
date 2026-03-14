import { WeekData } from '../../types';

export const week07: WeekData = {
  week: 7,
  title: "User Authentication Actions",
  objective: "Entender términos de inicio de sesión y seguridad",
  introText: "El acceso a los sistemas requiere procesos de autenticación y gestión de cuentas.",
  keywords: ["Login", "Logout", "Sign up", "Password", "Reset"],
  vocabulary: [
    {
      word: "Login",
      meaning: "Iniciar sesión en el sistema",
      example: "Please login to continue",
      context: "Security"
    },
    {
      word: "Logout",
      meaning: "Cerrar la sesión actual",
      example: "Don't forget to logout",
      context: "Security"
    },
    {
      word: "Sign up",
      meaning: "Registrarse como nuevo usuario",
      example: "Sign up for a new account",
      context: "Security"
    },
    {
      word: "Password",
      meaning: "Contraseña de acceso",
      example: "Enter your password",
      context: "Security"
    },
    {
      word: "Reset",
      meaning: "Restablecer o reiniciar (ej. contraseña)",
      example: "Reset your password",
      context: "Action"
    }
  ],
  simulation: {
    simulationId: "SIM-021"
  },
  practice: [
    {
      question: "¿Qué significa Logout?",
      options: ["Iniciar sesión", "Cerrar sesión", "Registrarse", "Borrar cuenta"],
      answer: "Cerrar sesión"
    },
    {
      question: "Si eres un usuario nuevo, debes hacer:",
      options: ["Login", "Logout", "Sign up", "Reset"],
      answer: "Sign up"
    },
    {
      question: "Para entrar a tu cuenta haces:",
      options: ["Reset", "Login", "Logout", "Sign up"],
      answer: "Login"
    }
  ],
  evaluation: [
    {
      question: "Login significa:",
      options: ["Entrar", "Salir", "Borrar", "Editar"],
      answer: "Entrar"
    },
    {
      question: "Logout significa:",
      options: ["Entrar", "Salir", "Borrar", "Editar"],
      answer: "Salir"
    },
    {
      question: "Sign up significa:",
      options: ["Registrarse", "Iniciar sesión", "Cerrar sesión", "Reiniciar"],
      answer: "Registrarse"
    },
    {
      question: "Password significa:",
      options: ["Usuario", "Contraseña", "Correo", "Nombre"],
      answer: "Contraseña"
    },
    {
      question: "Reset significa:",
      options: ["Guardar", "Restablecer", "Cerrar", "Abrir"],
      answer: "Restablecer"
    },
    {
      question: "Identify the action: 'Login with Google'",
      options: ["Login", "With", "Google", "Sign"],
      answer: "Login"
    },
    {
      question: "Identify the object: 'Reset the password'",
      options: ["Reset", "The", "Password", "Logout"],
      answer: "Password"
    },
    {
      question: "¿Qué significa 'Forgot password'?",
      options: ["Olvidé mi contraseña", "Cambiar contraseña", "Nueva contraseña", "Cerrar contraseña"],
      answer: "Olvidé mi contraseña"
    },
    {
      question: "A 'Strong password' is:",
      options: ["Contraseña débil", "Contraseña fuerte", "Contraseña corta", "Sin contraseña"],
      answer: "Contraseña fuerte"
    },
    {
      question: "To 'Sign in' is the same as:",
      options: ["Login", "Logout", "Sign up", "Reset"],
      answer: "Login"
    }
  ],
  active: true
};
