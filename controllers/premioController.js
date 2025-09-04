const Premio = require('../models/Premio');
const Tienda = require('../models/Tienda');
const Cliente = require('../models/Cliente');
const Registro = require('../models/Registro'); 
// Crear Premio
exports.crearPremio = async (req, res) => {
    const { nombre, stock_inicial, stock_disponible, id_tienda } = req.body;

    try {
        // Buscar la tienda
        const tienda = await Tienda.findById(id_tienda);
        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        // Crear el premio
        const premio = new Premio({
            nombre,
            stock_inicial,
            stock_disponible,
            id_tienda
        });

        // Guardar el premio
        await premio.save();

        // Actualizar el stock de la tienda
        tienda.premios_disponibles += stock_disponible; // Incrementar el stock de premios disponibles
        await tienda.save();

        res.status(201).json({
            message: 'Premio creado correctamente',
            premio
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear premio', error });
    }
};

// Función para entregar un premio
exports.entregarPremio = async (req, res) => {
    const { id_cliente, id_tienda } = req.body;

    try {
        // 1. Buscar la tienda
        const tienda = await Tienda.findById(id_tienda);
        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        // 2. Buscar los premios disponibles de esa tienda
        const premios = await Premio.find({ id_tienda });
        if (premios.length === 0) {
            return res.status(404).json({ message: 'No hay premios disponibles en esta tienda' });
        }

        // 3. Elegir un premio al azar
        const premioAleatorio = premios[Math.floor(Math.random() * premios.length)];

        // 4. Verificar si el premio tiene stock disponible
        if (premioAleatorio.stock_disponible <= 0) {
            return res.status(400).json({ message: 'No hay premios disponibles para entregar' });
        }

        // 5. Restar 1 al stock disponible del premio
        premioAleatorio.stock_disponible -= 1;
        await premioAleatorio.save();

        // 6. Actualizar el stock de la tienda
        tienda.premios_disponibles -= 1; // Restar 1 al stock de la tienda
        await tienda.save();

        // 7. Buscar al cliente y asignarle el premio
        const cliente = await Cliente.findById(id_cliente);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Asignar el premio al cliente
        cliente.premio = premioAleatorio._id;
        await cliente.save();

        // 8. Crear un registro en la tabla de Registros para este premio entregado
        const registro = new Registro({
            cliente_id: cliente._id,
            tienda_id: tienda._id,
            premio_id: premioAleatorio._id
        });
        await registro.save();

        res.json({
            message: 'Premio entregado correctamente',
            premio: premioAleatorio.nombre,
            cliente: cliente.nombre
        });
    } catch (error) {
        console.error("Error al entregar el premio:", error);  // Añadido para registrar el error en consola
        res.status(500).json({ message: 'Error al entregar premio', error: error.message });
    }
};
exports.getPremiosByIdTienda = async (req, res) => {
    const { id_tienda } = req.params;

    try {
        // Buscar los premios asociados a la tienda
        const premios = await Premio.find({ id_tienda });

        if (premios.length === 0) {
            return res.status(404).json({ message: 'No hay premios disponibles para esta tienda' });
        }

        res.json({
            message: 'Premios obtenidos correctamente',
            premios
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener premios', error });
    }
};