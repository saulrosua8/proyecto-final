const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'padel_reservas',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});

let retryCount = 0;
const maxRetries = 1;
const retryInterval = 5000;

// Función para manejar reconexiones
const handleDisconnect = () => {
    db.connect((err) => {
        if (err) {
            console.error('Error conectando a MySQL:', err);
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Reintentando conexión en ${retryInterval/1000} segundos... (Intento ${retryCount}/${maxRetries})`);
                setTimeout(handleDisconnect, retryInterval);
            } else {
                console.error('Número máximo de reintentos alcanzado. Verifica la configuración de MySQL.');
                process.exit(1);
            }
            return;
        }
        console.log('Conectado a MySQL exitosamente');
        retryCount = 0;
    });

    db.on('error', (err) => {
        console.error('Error en la conexión MySQL:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
            console.log('Reconectando a MySQL...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
};

handleDisconnect();

module.exports = db;