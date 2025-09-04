const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv'); // Requerir dotenv
const app = express();

const tiendaRoutes = require('./routes/tiendaRoutes');
const premioRoutes = require('./routes/premioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Conexión a MongoDB Atlas usando la variable de entorno MONGO_URI
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conectado a MongoDB'))
    .catch((error) => console.log('Error de conexión a MongoDB:', error));

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/tienda', tiendaRoutes);
app.use('/premio', premioRoutes);
app.use('/cliente', clienteRoutes);

// Puerto de escucha usando la variable de entorno PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
