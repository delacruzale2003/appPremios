const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression'); // Gzip
const helmet = require('helmet'); // Seguridad

// Rutas
const tiendaRoutes = require('./routes/tiendaRoutes');
const premioRoutes = require('./routes/premioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const registroRoutes = require('./routes/registroRoutes');

dotenv.config();

const app = express();

// --- 1. SEGURIDAD Y RENDIMIENTO HTTP ---
app.use(helmet()); // Protege headers HTTP
app.use(compression()); // Comprime las respuestas JSON (reduce peso hasta 70%)
app.use(cors()); 
app.use(express.json({ limit: '10kb' })); // Protege contra ataques de payloads gigantes

// --- 2. OPTIMIZACIÓN DE BASE DE DATOS ---
// Configuración del Pool de Conexiones para alto tráfico
const mongoOptions = {
    maxPoolSize: 50, // Mantiene hasta 50 conexiones abiertas listas para usar
    wtimeoutMS: 2500, // Timeout de escritura para evitar bloqueos largos
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(process.env.MONGO_URI, mongoOptions)
    .then(() => console.log('🚀 Conectado a MongoDB con Pool Optimizado'))
    .catch((error) => {
        console.error('❌ Error crítico de DB:', error);
        process.exit(1); // Si falla la DB al inicio, apagar el proceso para que el gestor lo reinicie
    });

// --- 3. RUTAS ---
app.use('/tienda', tiendaRoutes);
app.use('/premio', premioRoutes);
app.use('/cliente', clienteRoutes);
app.use('/registro', registroRoutes);

// --- 4. GESTIÓN DE ERRORES GLOBAL ---
// Evita que el servidor crashee por errores no capturados en promesas
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo salió mal, intenta más tarde.' });
});

const PORT = process.env.PORT || 5000;

// El servidor escucha
const server = app.listen(PORT, () => {
    console.log(`⚡ Servidor corriendo en puerto ${PORT}`);
});

// --- 5. CIERRE ELEGANTE (GRACEFUL SHUTDOWN) ---
// Necesario para despliegues en Kubernetes, Docker o PM2
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    server.close(() => {
        console.log('Servidor HTTP cerrado.');
        mongoose.connection.close(false, () => {
            console.log('Conexión MongoDB cerrada.');
            process.exit(0);
        });
    });
});