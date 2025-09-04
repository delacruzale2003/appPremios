const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const tiendaRoutes = require('./routes/tiendaRoutes');
const premioRoutes = require('./routes/premioRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://delacruzcalderonalejandro23_db_user:MJtQum6pPZrOAyrM@apppremios.yltracw.mongodb.net/?retryWrites=true&w=majority&appName=appPremios', {
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

// Puerto de escucha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
