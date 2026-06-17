document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePass = document.getElementById('togglePass');
    const passwordInput = document.getElementById('password');
    const loginAlert = document.getElementById('loginAlert');


    if (togglePass) {
        togglePass.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePass.querySelector('i').classList.toggle('bi-eye');
            togglePass.querySelector('i').classList.toggle('bi-eye-slash');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();


            if (!loginForm.checkValidity()) {
                e.stopPropagation();
                loginForm.classList.add('was-validated');
                return;
            }

            const email = document.getElementById('email').value.toLowerCase().trim();
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('${API_URL}/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo: email, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    if (loginAlert) loginAlert.classList.add('d-none');

                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userRole', data.rol);
                    localStorage.setItem('userName', data.nombre);

                    alert(`¡Bienvenido al sistema como ${data.rol}!`);
                    window.location.href = 'dashboard.html';

                } else {
                    if (loginAlert) {
                        loginAlert.classList.remove('d-none');
                        loginAlert.innerText = data.error || "Usuario o contraseña incorrectos";
                    } else {
                        alert(data.error || "Usuario o contraseña incorrectos");
                    }
                }
            } catch (error) {
                console.error("Error en login:", error);
                if (loginAlert) {
                    loginAlert.classList.remove('d-none');
                    loginAlert.innerText = "Error conectando al servidor. Asegúrate de encenderlo.";
                }
            }
        });
    }
});