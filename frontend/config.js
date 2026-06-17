// =============================================
//  CONFIGURACIÓN CENTRAL DE LA API
//  Cambia esta URL cuando despliegues el backend
// =============================================
const API_URL = window.location.hostname === 'localhost'
    ? '${API_URL}'
    : 'https://proyectowebsena6.onrender.com';  // <-- URL del backend en Render
