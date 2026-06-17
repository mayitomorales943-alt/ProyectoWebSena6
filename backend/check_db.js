import mysql from 'mysql2';
import dbConfig from './db_config.js';
const db = mysql.createConnection(dbConfig);
db.connect(err => {
    if (err) {
        console.error("❌ Error de conexión:", err);
        process.exit(1);
    }
    db.query("SHOW TABLES", (err, result) => {
        if (err) {
            console.error("❌ Error en consulta:", err);
        } else {
            console.log("✅ Conexión exitosa. Tablas actuales:", result);
        }
        process.exit();
    });
});
