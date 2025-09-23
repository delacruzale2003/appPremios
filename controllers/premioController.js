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

// controllers/premioController.js
exports.entregarPremio = async (req, res) => {
  const { id_cliente, id_tienda } = req.body;

  try {
    // 1. Buscar la tienda
    const tienda = await Tienda.findById(id_tienda);
    if (!tienda) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }

    // 2. Buscar premios disponibles
    const premios = await Premio.find({ id_tienda });
    if (premios.length === 0) {
      return res.status(404).json({ message: 'No hay premios disponibles en esta tienda' });
    }
    const premioAleatorio = premios[Math.floor(Math.random() * premios.length)];
    if (premioAleatorio.stock_disponible <= 0) {
      return res.status(400).json({ message: 'No hay stock disponible en el premio seleccionado' });
    }

    // 3. Descontar existencias
    premioAleatorio.stock_disponible -= 1;
    await premioAleatorio.save();
    tienda.premios_disponibles -= 1;
    await tienda.save();

    // 4. Buscar al cliente
    const cliente = await Cliente.findById(id_cliente);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // 5. Asignar premio al cliente
    cliente.premio = premioAleatorio._id;
    await cliente.save();

    // 6. Crear registro usando cliente.foto
    const registro = new Registro({
      cliente_id:    cliente._id,
      tienda_id:     tienda._id,
      premio_id:     premioAleatorio._id,
      foto:          cliente.foto,        // <–– aquí reutilizas la foto del cliente
      fecha_registro: new Date()
    });
    await registro.save();

    return res.json({
      message: 'Premio entregado correctamente',
      premio: premioAleatorio.nombre,
      cliente: cliente.nombre
    });
  } catch (error) {
    console.error("Error al entregar el premio:", error);
    return res.status(500).json({ message: 'Error al entregar premio', error: error.message });
  }
};

// Función para obtener los premios disponibles por ID de tienda
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

// Función para actualizar un premio
exports.actualizarPremio = async (req, res) => {
    const { nombre, stock_inicial, stock_disponible, id_tienda } = req.body;
    const { id } = req.params;

    try {
        // Buscar el premio por su ID
        const premio = await Premio.findById(id);
        if (!premio) {
            return res.status(404).json({ message: 'Premio no encontrado' });
        }

        // Buscar la tienda asociada para validar el id_tienda
        const tienda = await Tienda.findById(id_tienda);
        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        // Actualizar los campos del premio
        premio.nombre = nombre || premio.nombre;
        premio.stock_inicial = stock_inicial || premio.stock_inicial;
        premio.stock_disponible = stock_disponible || premio.stock_disponible;
        premio.id_tienda = id_tienda || premio.id_tienda;

        // Guardar el premio actualizado
        await premio.save();

        // Responder con el premio actualizado
        res.status(200).json({
            message: 'Premio actualizado correctamente',
            premio
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar premio', error });
    }
};
