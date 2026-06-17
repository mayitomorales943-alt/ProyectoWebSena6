// =============================================
//  CONFIGURACIÓN CENTRAL DE LA API
//  Cambia esta URL cuando despliegues el backend
// =============================================
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://bakc-m44a.onrender.com';  // URL real de tu backend (Bakc)
