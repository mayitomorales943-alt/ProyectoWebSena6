const recursoForm = document.getElementById('recursoForm');

if (recursoForm) {
    recursoForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombreRecurso').value;
        const correo = document.getElementById('correoAutor').value;
        const desc = document.getElementById('descripcionRecurso').value;
        const categoria = document.getElementById('categoriaRecurso').value;
        const fileInput = document.getElementById('fileInput').files[0];

        const token = localStorage.getItem('userToken');
        if (!token) {
            Swal.fire('Error', 'Debes iniciar sesión para subir archivos.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('titulo', nombre);
        formData.append('autor', correo);
        formData.append('descripcion', desc);
        formData.append('categoria', categoria);
        if (fileInput) {
            formData.append('archivo', fileInput);
        }

        try {
            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.innerText = "Guardando...";

            const response = await fetch('${API_URL}/api/recursos', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                Swal.fire({
                    title: '¡Recurso Guardado!',
                    text: 'El documento se ha agregado correctamente en el servidor.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.reload();
                });
            } else {
                const errorData = await response.json();
                Swal.fire('Error', errorData.error || 'Ocurrió un problema.', 'error');
                btn.disabled = false;
                btn.innerText = "Guardar Recurso";
            }
        } catch (err) {
            Swal.fire('Error', 'Fallo conexión con el servidor.', 'error');
            console.error(err);
        }
    });
}

window.editarRecurso = function (boton) {
    const fila = boton.closest('tr');
    document.getElementById('nombreRecurso').value = fila.cells[1].innerText;
    document.getElementById('correoAutor').value = fila.cells[2].innerText;
    document.getElementById('descripcionRecurso').value = fila.cells[3].innerText;
    fila.remove();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.eliminarFila = function (boton) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará el registro de la tabla.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-trash"></i> Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {

            boton.closest('tr').remove();


            Swal.fire({
                title: '¡Eliminado!',
                text: 'El registro ha sido borrado.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const estrellas = document.querySelectorAll('.estrella');
    const textoCalificacion = document.getElementById('texto-calificacion');
    const btnEnviarComentario = document.getElementById('btnEnviarComentario');
    let calificacionActual = 0;

    if (estrellas.length > 0) {
        function pintarEstrellas(cantidad) {
            estrellas.forEach(estrella => {
                const valor = estrella.getAttribute('data-value');
                if (valor <= cantidad) {
                    estrella.classList.remove('bi-star', 'text-secondary');
                    estrella.classList.add('bi-star-fill', 'text-warning');
                } else {
                    estrella.classList.remove('bi-star-fill', 'text-warning');
                    estrella.classList.add('bi-star', 'text-secondary');
                }
            });
        }

        estrellas.forEach(estrella => {
            estrella.addEventListener('mouseover', function () {
                pintarEstrellas(this.getAttribute('data-value'));
            });

            estrella.addEventListener('mouseout', function () {
                pintarEstrellas(calificacionActual);
            });

            estrella.addEventListener('click', function () {
                calificacionActual = this.getAttribute('data-value');
                textoCalificacion.innerText = calificacionActual + (calificacionActual == 1 ? ' estrella' : ' estrellas');
            });
        });

        if (btnEnviarComentario) {
            btnEnviarComentario.addEventListener('click', function () {
                const comentario = document.getElementById('textoComentario').value;

                if (calificacionActual === 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Por favor selecciona una calificación de estrellas.',
                        confirmButtonColor: '#0d6efd'
                    });
                    return;
                }
                if (comentario.trim() === '') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Falta información',
                        text: 'Por favor escribe tu comentario antes de enviar.',
                        confirmButtonColor: '#0d6efd'
                    });
                    return;
                }


                Swal.fire({
                    icon: 'success',
                    title: '¡Comentario guardado!',
                    text: 'Gracias por compartir tu opinión.',
                    confirmButtonColor: '#0d6efd'
                }).then(() => {
                    calificacionActual = 0;
                    pintarEstrellas(0);
                    textoCalificacion.innerText = '0 estrellas';
                    document.getElementById('textoComentario').value = '';

                    var modalElement = document.getElementById('modalComent');
                    var modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();
                });
            });
        }
    }
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');

        const temaGuardado = localStorage.getItem('tema') || 'light';

        document.documentElement.setAttribute('data-bs-theme', temaGuardado);
        actualizarIcono(temaGuardado);

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                let temaActual = document.documentElement.getAttribute('data-bs-theme');
                let nuevoTema = temaActual === 'dark' ? 'light' : 'dark';

                document.documentElement.setAttribute('data-bs-theme', nuevoTema);

                localStorage.setItem('tema', nuevoTema);

                actualizarIcono(nuevoTema);
            });
        }

        function actualizarIcono(tema) {
            if (!themeIcon) return;
            if (tema === 'dark') {
                themeIcon.classList.remove('bi-moon-stars-fill');
                themeIcon.classList.add('bi-sun-fill');
                themeIcon.style.color = '#ffc107';
                themeToggleBtn.classList.replace('btn-outline-dark', 'btn-outline-light');
            } else {
                themeIcon.classList.remove('bi-sun-fill');
                themeIcon.classList.add('bi-moon-stars-fill');
                themeIcon.style.color = '';
                if (themeToggleBtn.classList.contains('btn-outline-light')) {
                    themeToggleBtn.classList.replace('btn-outline-light', 'btn-outline-dark');
                }
            }
        }
});