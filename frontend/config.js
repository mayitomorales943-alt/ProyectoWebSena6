// =============================================
//  CONFIGURACIÓN CENTRAL DE LA API
//  Cambia esta URL cuando despliegues el backend
// =============================================
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://bakc-m44a.onrender.com';  // URL real de tu backend (Bakc)

// =============================================
//  KEEP-ALIVE PARA RENDER (Evita la suspensión)
// =============================================
function mantenerBackendDespierto() {
    fetch(`${API_URL}/api/ping`)
        .then(response => response.json())
        .then(data => console.log('💓 Keep-Alive:', data.message))
        .catch(err => console.warn('⚠️ Falló keep-alive:', err));
}

// Hacer ping inmediatamente al cargar la página
mantenerBackendDespierto();

// Hacer ping cada 13 minutos (780000 ms)
setInterval(mantenerBackendDespierto, 13 * 60 * 1000);
