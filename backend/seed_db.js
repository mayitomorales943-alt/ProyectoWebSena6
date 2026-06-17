import mysql from 'mysql2';
import dbConfig from './db_config.js';
const db = mysql.createConnection(dbConfig);
db.connect(err => {
    if (err) throw err;
    const insertInitialData = `
        INSERT INTO recursos (titulo, descripcion, categoria) VALUES 
        ('Conceptos Básicos de Programación', 'Domina las estructuras básicas, variables y ciclos antes de escribir código real.', 'Fundamentos'),
        ('Desarrollo Web con HTML y CSS', 'Aprende a maquetar y darle estilo a tus primeras páginas web desde cero.', 'Frontend'),
        ('Introducción a Python', 'Descubre el lenguaje más popular. Sintaxis fácil y potentes herramientas de desarrollo.', 'Backend'),
        ('Lógica con Scratch Jr', 'Aprende jugando. Programación visual con bloques diseñada para los más creativos.', 'Creatividad')
   `;
    db.query("SELECT COUNT(*) as count FROM recursos", (err, result) => {
        if (result[0].count === 0) {
            db.query(insertInitialData, (err, r) => {
                console.log(err ? "Error: " + err : "Seeded rows: " + r.affectedRows);
                process.exit();
            });
        } else {
            console.log("Already has rows: " + result[0].count);
            process.exit();
        }
    });
});
