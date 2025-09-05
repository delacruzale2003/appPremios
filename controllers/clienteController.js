const { validationResult } = require('express-validator');
const Cliente = require('../models/Cliente');

// Función para registrar un cliente
exports.registrarCliente = async (req, res) => {
    // Capturar los errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { dni, nombre, telefono, tienda, foto } = req.body;

    try {
        // Crear el cliente
        const cliente = new Cliente({
            dni,
            nombre,
            telefono,
            tienda,
            foto
        });

        // Guardar el cliente
        await cliente.save();
        res.status(201).json({ message: 'Cliente registrado correctamente', cliente });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar cliente', error });
    }
};

// Función para obtener los últimos clientes registrados con el nombre de la tienda
exports.getClientes = async (req, res) => {
    const { limit = 10 } = req.query;

    try {
        // Obtener los últimos clientes registrados y poblar el nombre de la tienda
        const clientes = await Cliente.find()
            .sort({ fecha_registro: -1 })
            .limit(Number(limit))
            .populate('tienda', 'nombre');  // Poblar la tienda y solo obtener el campo 'nombre'

        res.status(200).json({ clientes });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes', error });
    }
};
