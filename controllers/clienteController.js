const Cliente = require('../models/Cliente');

// Función para registrar un cliente
exports.registrarCliente = async (req, res) => {
    const { dni, nombre, telefono, tienda } = req.body; // Asegúrate de pasar el ID de la tienda desde el frontend

    try {
        // Crear el cliente
        const cliente = new Cliente({
            dni,
            nombre,
            telefono,
            tienda
        });

        // Guardar el cliente
        await cliente.save();
        res.status(201).json({ message: 'Cliente registrado correctamente', cliente });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar cliente', error });
    }
};

// Función para obtener los últimos clientes registrados
exports.getClientes = async (req, res) => {
    try {
        // Obtener los últimos 10 clientes registrados (puedes ajustar el número si lo necesitas)
        const clientes = await Cliente.find()
            .sort({ fecha_registro: -1 }) // Ordenar por fecha de registro, de más reciente a más antiguo
            .limit(10); // Limitar a los 10 últimos registrados

        res.status(200).json({ clientes });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes', error });
    }
};