const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv'); 
const app = express();

const tiendaRoutes = require('./routes/tiendaRoutes');
const premioRoutes = require('./routes/premioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const registroRoutes = require('./routes/registroRoutes');

// Cargar las variables de entorno
dotenv.config();

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.log('Error de conexión a MongoDB:', error));

// --- CONFIGURACIÓN CORS ROBUSTA ---
// Define aquí explícitamente los dominios que pueden pedir datos
const whitelist = [
  'http://localhost:5173',              // Tu entorno local (Vite)
  'http://localhost:3000',              // Por si usas otro puerto local
  'https://admincclibertadores.ptm.pe', // TU DOMINIO DE PRODUCCIÓN
  'https://apppremios.onrender.com' ,
  'https://adminsanluis.ptm.pe',
  'https://sanluispromo.ptm.pe',
  'https://cocacolalibertadorespromo.ptm.pe',
  'https://fantapromovendo.ptm.pe',
  'https://adminfantapromoauto.ptm.pe',
  'https://fantapromohalloweent.ptm.pe' ,
  'https://fantapromohalloween.ptm.pe',
  'https://adminfantapromohalloween.ptm.pe'   // El propio dominio del server
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origen (como Postman, Apps móviles o curl)
    if (!origin) return callback(null, true);
    
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Origen bloqueado por CORS:", origin); // Esto aparecerá en los logs de Render si falla
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permite cookies/headers autorizados si los usaras
}));
// ----------------------------------

app.use(express.json());

// Rutas
app.use('/tienda', tiendaRoutes);
app.use('/premio', premioRoutes);
app.use('/cliente', clienteRoutes);
app.use('/registro', registroRoutes);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));