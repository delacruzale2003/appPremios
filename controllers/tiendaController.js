const Tienda = require('../models/Tienda');

// Función para obtener todas las tiendas
const getTiendas = async (req, res) => {
  try {
    const { campaña } = req.query;
    const filtro = campaña ? { campaña } : {};

    const tiendas = await Tienda
      .find(filtro)
      .populate('premios_disponibles')
      .lean();

    // Siempre retorna un array (vacío si no hay resultados)
    return res.json(tiendas);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error al obtener tiendas', error });
  }
};


// Función para crear una nueva tienda
const crearTienda = async (req, res) => {
    const { nombre, premios_disponibles, campaña } = req.body;

    try {
        // Crear la nueva tienda
        const tienda = new Tienda({ nombre, premios_disponibles, campaña });

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
// Actualizar tienda (sin modificar campaña)
const actualizarTienda = async (req, res) => {
  const { nombre, premios_disponibles } = req.body;
  const { id } = req.params;

  try {
    const tienda = await Tienda.findById(id);
    if (!tienda) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }

    if (nombre) tienda.nombre = nombre;
    if (typeof premios_disponibles !== 'undefined') {
      tienda.premios_disponibles = premios_disponibles;
    }

    await tienda.save();

    return res.status(200).json({
      message: 'Tienda actualizada correctamente',
      tienda
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar tienda', error });
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
