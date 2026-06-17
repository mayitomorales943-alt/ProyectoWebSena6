import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dbConfig from './db_config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
// Servir el frontend desde la carpeta ../frontend (inicio.html como página principal)
app.use(express.static(path.join(__dirname, '../frontend'), { index: 'inicio.html' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const SECRET_KEY = 'mi_super_secreto_educativo';

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.message);
        return;
    }
    console.log('✅ ¡Conectado exitosamente a la base de datos MySQL!');


    const createRecursosTable = `
        CREATE TABLE IF NOT EXISTS recursos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descripcion TEXT,
            categoria VARCHAR(100),
            autor VARCHAR(255),
            archivo_url VARCHAR(255),
            imagen VARCHAR(255),
            progreso INT DEFAULT 0,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createRecursosTable, (err) => {
        if (err) {
            console.error('Error creando tabla recursos:', err);
        } else {
            db.query("SELECT COUNT(*) AS count FROM recursos", (err, result) => {
                if (!err && result[0].count === 0) {
                    const insertInitialData = `
                        INSERT INTO recursos (titulo, descripcion, categoria, autor, imagen, progreso) VALUES 
                        ('Conceptos Básicos de Programación', 'Domina las estructuras básicas, variables y ciclos antes de escribir código real.', 'Fundamentos', 'Admin', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80', 100),
                        ('Desarrollo Web con HTML y CSS', 'Aprende a maquetar y darle estilo a tus primeras páginas web desde cero.', 'Frontend', 'Admin', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80', 45),
                        ('Introducción a Python', 'Descubre el lenguaje más popular. Sintaxis fácil y potentes herramientas de desarrollo.', 'Backend', 'Admin', 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=500&q=80', 15),
                        ('Lógica con Scratch Jr', 'Aprende jugando. Programación visual con bloques diseñada para los más creativos.', 'Creatividad', 'Admin', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80', 0)
                    `;
                    db.query(insertInitialData, (err) => {
                        if (err) console.error("Error insertando datos iniciales", err);
                        else console.log("✅ Datos iniciales de recursos creados");
                    });
                }
            });
        }
    });

    const createUsuariosTable = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            correo VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) NOT NULL,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createUsuariosTable, async (err) => {
        if (!err) {
            db.query("SELECT COUNT(*) AS count FROM usuarios", async (err, result) => {
                if (!err && result[0].count === 0) {
                    const hashedPassword = await bcrypt.hash('123456', 10);
                    const insertUsers = `
                        INSERT INTO usuarios (nombre, correo, password, rol) VALUES 
                        ('Administrador', 'admin@gmail.com', '${hashedPassword}', 'tic'),
                        ('Docente Juan', 'docente@gmail.com', '${hashedPassword}', 'docente'),
                        ('Estudiante Ana', 'estudiante@gmail.com', '${hashedPassword}', 'estudiante')
                    `;
                    db.query(insertUsers, (err) => {
                        if (err) console.error("Error insertando usuarios iniciales", err);
                        else console.log("✅ Usuarios iniciales creados (contraseña por defecto: 123456)");

                        db.query("ALTER TABLE usuarios ADD COLUMN xp INT DEFAULT 0, ADD COLUMN nivel INT DEFAULT 1", (err) => {
                            if (!err) console.log("✅ Sistema de Gamificacion inicializado (XP)");
                        });
                    });
                } else {
                    db.query("ALTER TABLE usuarios ADD COLUMN xp INT DEFAULT 0, ADD COLUMN nivel INT DEFAULT 1", (err) => {
                        if (!err) console.log("✅ Sistema de Gamificacion Inicializado (XP a tabla existente)");
                    });
                }
            });
        } else {
            console.error('Error creando tabla usuarios:', err);
        }
    });

    const createComentariosTable = `
        CREATE TABLE IF NOT EXISTS comentarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recurso_id INT,
            usuario_id INT,
            texto TEXT,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createComentariosTable, (err) => {
        if (!err) console.log("✅ Sistema de Foros inicializado (Tabla comentarios)");
    });

    const createCalificacionesTable = `
        CREATE TABLE IF NOT EXISTS calificaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recurso_id INT,
            usuario_id INT,
            estrellas INT,
            comentario TEXT,
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createCalificacionesTable, (err) => {
        if (!err) console.log("✅ Sistema de Evaluacion (Tabla calificaciones)");
    });

    const createEntregasTable = `
        CREATE TABLE IF NOT EXISTS entregas_tareas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            recurso_id INT,
            usuario_id INT,
            archivo_entrega VARCHAR(255),
            calificacion INT DEFAULT NULL,
            feedback TEXT,
            estado ENUM('Pendiente', 'Calificado') DEFAULT 'Pendiente',
            creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(createEntregasTable, (err) => {
        if (!err) console.log("✅ Tablero LMS (Tabla entregas_tareas)");
    });
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Token es requerido.' });

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Token inválido.' });
        req.user = decoded;
        next();
    });
};

app.post('/api/registro', async (req, res) => {
    const { nombre, correo, password, rol } = req.body;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)";

        db.query(query, [nombre, correo, hashedPassword, rol], (err, result) => {
            if (err) {
                console.error('Error en el registro:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'El correo institucional ya está registrado.' });
                }
                return res.status(500).json({ error: 'Error interno del servidor al registrar.' });
            }
            res.status(201).json({ mensaje: 'Usuario creado con éxito', id: result.insertId });
        });
    } catch (error) {
        console.error('Error al encriptar:', error);
        res.status(500).json({ error: 'Error al procesar la contraseña.' });
    }
});

app.post('/api/login', (req, res) => {
    const { correo, password } = req.body;

    const query = "SELECT * FROM usuarios WHERE correo = ?";

    db.query(query, [correo], async (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
        }

        const usuario = results[0];

        try {
            const contrasenaValida = await bcrypt.compare(password, usuario.password);

            if (!contrasenaValida) {
                return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
            }

            const token = jwt.sign({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol, correo: usuario.correo }, SECRET_KEY, { expiresIn: '8h' });

            res.status(200).json({
                mensaje: 'Inicio de sesión exitoso',
                nombre: usuario.nombre,
                rol: usuario.rol,
                token: token
            });

        } catch (error) {
            console.error('Error al comparar contraseñas:', error);
            res.status(500).json({ error: 'Error al procesar la solicitud.' });
        }
    });
});

app.get('/api/recursos', verifyToken, (req, res) => {
    db.query("SELECT * FROM recursos ORDER BY id DESC", (err, results) => {
        if (err) {
            console.error('Error fetching resources:', err);
            return res.status(500).json({ error: 'Error obteniendo recursos' });
        }
        res.status(200).json(results);
    });
});

app.post('/api/recursos', verifyToken, upload.single('archivo'), (req, res) => {
    if (req.user.rol === 'estudiante') {
        return res.status(403).json({ error: 'No tienes permisos para agregar recursos.' });
    }

    const { titulo, descripcion, categoria, autor } = req.body;
    let archivo_url = req.file ? '/uploads/' + req.file.filename : null;

    let imagen_default = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=80';
    if (categoria === 'Frontend') imagen_default = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80';
    if (categoria === 'Backend') imagen_default = 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=500&q=80';

    const query = "INSERT INTO recursos (titulo, descripcion, categoria) VALUES (?, ?, ?)";
    db.query(query, [titulo, descripcion, categoria], (err, result) => {
        if (err) {
            console.error('Error adding resource:', err);
            return res.status(500).json({ error: 'Error insertando recurso' });
        }
        res.status(201).json({ mensaje: 'Recurso guardado con éxito', id: result.insertId });
    });
});

app.put('/api/recursos/:id', verifyToken, (req, res) => {
    if (req.user.rol === 'estudiante') {
        return res.status(403).json({ error: 'No tienes permisos.' });
    }
    const { id } = req.params;
    const { titulo, descripcion, categoria } = req.body;
    const query = "UPDATE recursos SET titulo=?, descripcion=?, categoria=? WHERE id=?";
    db.query(query, [titulo, descripcion, categoria, id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error actualizando recurso' });
        }
        res.status(200).json({ mensaje: 'Recurso actualizado' });
    });
});

app.get('/api/metricas', verifyToken, (req, res) => {
    if (req.user.rol !== 'tic') return res.status(403).json({ error: 'Acceso denegado' });

    const metricas = {
        totalUsuarios: 0,
        usuariosPorRol: [],
        totalRecursos: 0,
        totalForos: 0
    };

    db.query("SELECT COUNT(*) as total FROM recursos", (err, res1) => {
        if (!err && res1.length) metricas.totalRecursos = res1[0].total;

        db.query("SELECT COUNT(*) as total FROM comentarios", (err, res2) => {
            if (!err && res2.length) metricas.totalForos = res2[0].total;

            db.query("SELECT COUNT(*) as total FROM usuarios", (err, res3) => {
                if (!err && res3.length) metricas.totalUsuarios = res3[0].total;

                db.query("SELECT rol, COUNT(*) as cantidad FROM usuarios GROUP BY rol", (err, res4) => {
                    if (!err) metricas.usuariosPorRol = res4;
                    res.status(200).json(metricas);
                });
            });
        });
    });
});

app.delete('/api/recursos/:id', verifyToken, (req, res) => {
    if (req.user.rol !== 'tic') {
        return res.status(403).json({ error: 'No tienes permisos para eliminar recursos.' });
    }
    const { id } = req.params;
    db.query("DELETE FROM recursos WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error eliminando recurso' });
        }
        res.status(200).json({ mensaje: 'Recurso eliminado correctamente' });
    });
});

app.get('/api/comentarios/:recurso_id', verifyToken, (req, res) => {
    const { recurso_id } = req.params;
    const query = `
        SELECT c.id, c.texto, c.creado_en, u.nombre, u.rol 
        FROM comentarios c 
        JOIN usuarios u ON c.usuario_id = u.id 
        WHERE c.recurso_id = ? 
        ORDER BY c.creado_en ASC
    `;
    db.query(query, [recurso_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error obteniendo comentarios' });
        res.status(200).json(results);
    });
});

app.post('/api/comentarios/:recurso_id', verifyToken, (req, res) => {
    const { recurso_id } = req.params;
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: 'El comentario no puede estar vacío.' });

    db.query("INSERT INTO comentarios (recurso_id, usuario_id, texto) VALUES (?, ?, ?)", [recurso_id, req.user.id, texto], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error guardando el comentario' });

        const newQuery = "SELECT c.id, c.texto, c.creado_en, u.nombre, u.rol FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = ?";
        db.query(newQuery, [results.insertId], (err, latest) => {
            res.status(201).json(latest[0]);
        });
    });
});

app.get('/api/perfil', verifyToken, (req, res) => {
    db.query("SELECT id, nombre, correo, rol, xp, nivel FROM usuarios WHERE id = ?", [req.user.id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: 'Error obteniendo perfil' });
        res.status(200).json(results[0]);
    });
});

app.post('/api/perfil/xp', verifyToken, (req, res) => {
    const xpAganar = req.body.cantidad || 10;
    db.query("SELECT xp, nivel FROM usuarios WHERE id = ?", [req.user.id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: 'Error agregando XP' });

        let currentXp = results[0].xp + xpAganar;
        let currentNivel = results[0].nivel;

        if (currentXp >= (currentNivel * 100)) {
            currentNivel += 1;
        }

        db.query("UPDATE usuarios SET xp = ?, nivel = ? WHERE id = ?", [currentXp, currentNivel, req.user.id], (err) => {
            res.status(200).json({ xp: currentXp, nivel: currentNivel });
        });
    });
});

app.get('/api/usuarios', verifyToken, (req, res) => {
    if (req.user.rol !== 'tic') return res.status(403).json({ error: 'Acceso denegado' });
    db.query("SELECT id, nombre, correo, rol, xp, nivel FROM usuarios ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
        res.status(200).json(results);
    });
});

app.put('/api/usuarios/:id', verifyToken, (req, res) => {
    if (req.user.rol !== 'tic') return res.status(403).json({ error: 'Acceso denegado' });
    const { id } = req.params;
    const { nombre, correo, rol } = req.body;
    db.query("UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?", [nombre, correo, rol, id], (err) => {
        if (err) return res.status(500).json({ error: 'Error actualizando usuario' });
        res.status(200).json({ mensaje: 'Actualizado correctamente' });
    });
});

app.delete('/api/usuarios/:id', verifyToken, (req, res) => {
    if (req.user.rol !== 'tic') return res.status(403).json({ error: 'Acceso denegado' });
    const { id } = req.params;
    db.query("DELETE FROM usuarios WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error eliminando usuario' });
        res.status(200).json({ mensaje: 'Usuario eliminado' });
    });
});

app.get('/api/ranking', verifyToken, (req, res) => {
    db.query("SELECT id, nombre, rol, xp, nivel FROM usuarios WHERE rol != 'tic' ORDER BY xp DESC LIMIT 20", (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener ranking' });
        res.status(200).json(results);
    });
});


app.get('/api/notificaciones', verifyToken, (req, res) => {
    db.query("SELECT id, titulo, creado_en FROM recursos ORDER BY creado_en DESC LIMIT 3", (err, recs) => {
        if (err) return res.status(500).json({ error: 'Error obteniendo recursos' });

        db.query("SELECT c.id, u.nombre, c.creado_en FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id WHERE c.recurso_id = 9999 ORDER BY c.creado_en DESC LIMIT 3", (err, coms) => {
            if (err) return res.status(500).json({ error: 'Error obteniendo comunidad' });

            let notifs = [];

            recs.forEach(r => {
                notifs.push({
                    id: 'r_' + r.id,
                    texto: `¡Nuevo recurso: ${r.titulo}!`,
                    fecha: r.creado_en,
                    icono: 'bi-journal-arrow-up text-primary bg-primary bg-opacity-10',
                    ruta: 'dashboard.html'
                });
            });

            coms.forEach(c => {
                notifs.push({
                    id: 'c_' + c.id,
                    texto: `${c.nombre} publicó en la Comunidad.`,
                    fecha: c.creado_en,
                    icono: 'bi-chat-heart-fill text-danger bg-danger bg-opacity-10',
                    ruta: 'comunidad.html'
                });
            });


            notifs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            res.status(200).json(notifs.slice(0, 5));
        });
    });
});

app.get('/api/comunidad', verifyToken, (req, res) => {
    const query = `
        SELECT c.id, c.texto, c.creado_en, u.nombre, u.rol 
        FROM comentarios c 
        JOIN usuarios u ON c.usuario_id = u.id 
        WHERE c.recurso_id = 9999 
        ORDER BY c.creado_en DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error obteniendo comunidad' });
        res.status(200).json(results);
    });
});

app.post('/api/comunidad', verifyToken, (req, res) => {
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: 'Texto vacío' });
    db.query("INSERT INTO comentarios (recurso_id, usuario_id, texto) VALUES (9999, ?, ?)", [req.user.id, texto], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error guardando en comunidad' });
        const newQuery = "SELECT c.id, c.texto, c.creado_en, u.nombre, u.rol FROM comentarios c JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = ?";
        db.query(newQuery, [results.insertId], (err, latest) => {
            res.status(201).json(latest[0]);
        });
    });
});

app.post('/api/calificaciones', verifyToken, (req, res) => {
    const { recurso_id, estrellas, comentario } = req.body;
    if (!recurso_id || !estrellas) return res.status(400).json({ error: 'Faltan datos de calificación' });

    db.query("INSERT INTO calificaciones (recurso_id, usuario_id, estrellas, comentario) VALUES (?, ?, ?, ?)",
        [recurso_id, req.user.id, estrellas, comentario], (err) => {
            if (err) return res.status(500).json({ error: 'Error guardando calificacion' });
            res.status(201).json({ mensaje: 'Calificacion guardada con éxito' });
        });
});

app.get('/api/calificaciones', verifyToken, (req, res) => {
    if (req.user.rol !== 'tic') return res.status(403).json({ error: 'Acceso denegado' });
    const query = `
        SELECT c.id, c.estrellas, c.comentario, c.creado_en, u.correo, u.nombre, r.titulo as recurso_titulo
        FROM calificaciones c
        JOIN usuarios u ON c.usuario_id = u.id
        JOIN recursos r ON c.recurso_id = r.id
        ORDER BY c.creado_en DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching calificaciones' });
        res.status(200).json(results);
    });
});

app.delete('/api/calificaciones/:id', verifyToken, (req, res) => {
    if (req.user.rol !== 'tic') return res.status(403).json({ error: 'Acceso denegado' });
    db.query("DELETE FROM calificaciones WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: 'Fallo al borrar' });
        res.status(200).json({ mensaje: 'Comentario eliminado exitosamente' });
    });
});

app.post('/api/entregas', verifyToken, upload.single('archivo_entrega'), (req, res) => {
    const { recurso_id } = req.body;
    if (!recurso_id || !req.file) return res.status(400).json({ error: 'Faltan datos o el archivo' });

    const archivo_entrega = `/uploads/${req.file.filename}`;

    db.query("INSERT INTO entregas_tareas (recurso_id, usuario_id, archivo_entrega) VALUES (?, ?, ?)",
        [recurso_id, req.user.id, archivo_entrega], (err) => {
            if (err) return res.status(500).json({ error: 'Error guardando entrega' });
            res.status(201).json({ mensaje: 'Tarea subida con éxito' });
        });
});

app.get('/api/entregas', verifyToken, (req, res) => {
    let query = `
        SELECT et.id, et.archivo_entrega, et.calificacion, et.feedback, et.estado, et.creado_en,
               u.nombre, u.correo, r.titulo AS recurso_titulo
        FROM entregas_tareas et
        JOIN usuarios u ON et.usuario_id = u.id
        JOIN recursos r ON et.recurso_id = r.id
    `;
    let params = [];
    if (req.user.rol === 'estudiante') {
        query += " WHERE et.usuario_id = ?";
        params.push(req.user.id);
    }
    query += " ORDER BY et.creado_en DESC";

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error obteniendo entregas' });
        res.status(200).json(results);
    });
});

app.put('/api/entregas/:id', verifyToken, (req, res) => {
    if (req.user.rol === 'estudiante') return res.status(403).json({ error: 'Acceso denegado' });
    const { calificacion, feedback } = req.body;
    const { id } = req.params;

    db.query("UPDATE entregas_tareas SET calificacion = ?, feedback = ?, estado = 'Calificado' WHERE id = ?",
        [calificacion, feedback, id], (err) => {
            if (err) return res.status(500).json({ error: 'Error al calificar tarea' });
            res.status(200).json({ mensaje: 'Tarea calificada correctamente' });
        });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor de la API corriendo en http://localhost:${PORT}`);
});