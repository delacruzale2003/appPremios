const Tienda = require('../models/Tienda');

// Función para obtener todas las tiendas
const getTiendas = async (req, res) => {
    try {
        // Obtener todas las tiendas y poblar los premios disponibles
        const tiendas = await Tienda.find().populate('premios_disponibles');
        if (!tiendas || tiendas.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tiendas' });
        }
        res.json(tiendas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tiendas', error });
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

// Función para actualizar una tienda
const actualizarTienda = async (req, res) => {
    const { nombre, premios_disponibles } = req.body;
    const { id } = req.params;

    try {
        // Buscar la tienda por su ID
        const tienda = await Tienda.findById(id);
        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        // Actualizar los campos de la tienda
        tienda.nombre = nombre || tienda.nombre;  // Solo actualiza si hay un nuevo valor
        tienda.premios_disponibles = premios_disponibles || tienda.premios_disponibles;

        // Guardar la tienda actualizada
        await tienda.save();

        res.status(200).json({
            message: 'Tienda actualizada correctamente',
            tienda
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar tienda', error });
    }
};

// Función para eliminar una tienda
const eliminarTienda = async (req, res) => {
    const { id } = req.params;

    try {
        // Buscar la tienda por su ID
        const tienda = await Tienda.findById(id);
        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        // Eliminar la tienda
        await Tienda.findByIdAndDelete(id);

        res.status(200).json({
            message: 'Tienda eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar tienda', error });
    }
};

// Exportar las funciones individualmente
module.exports = {
    crearTienda,
    getTiendas,
    actualizarTienda,
    eliminarTienda
};
