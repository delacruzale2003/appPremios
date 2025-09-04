const Tienda = require('../models/Tienda');

// Función para obtener una tienda por su ID
const getTiendaById = async (req, res) => {
    try {
        const tienda = await Tienda.findById(req.params.id).populate('premios_disponibles');
        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }
        res.json(tienda);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tienda', error });
    }
};

// Función para crear una nueva tienda
const crearTienda = async (req, res) => {
    const { nombre, premios_disponibles } = req.body;

    try {
        // Crear la nueva tienda
        const tienda = new Tienda({
            nombre,
            premios_disponibles
        });

        // Guardar la tienda en la base de datos
        await tienda.save();

        res.status(201).json({
            message: 'Tienda creada correctamente',
            tienda
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear tienda', error });
    }
};

// Exportar las funciones individualmente
module.exports = {
    crearTienda,
    getTiendaById
};