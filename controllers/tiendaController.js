const Tienda = require('../models/Tienda');

// Función para obtener todas las tiendas
const getTiendas = async (req, res) => {
  try {
    const { campaña } = req.query;
    const filtro = campaña ? { campaña } : {};

    const tiendas = await Tienda
      .find(filtro)
      .sort({ nombre: 1 }) // Agregado: Ordenar alfabéticamente es mejor para el frontend
      // .populate('premios_disponibles') <--- ELIMINADO: Esto era un error, es un número, no una referencia
      .lean(); // Mantenemos .lean() para velocidad

    return res.json(tiendas);
  } catch (error) {
    console.error("Error en getTiendas:", error);
    return res.status(500).json({ message: 'Error al obtener tiendas', error: error.message });
  }
};

// Función para crear una nueva tienda
const crearTienda = async (req, res) => {
    const { nombre, premios_disponibles, campaña } = req.body;

    try {
        // Validación simple
        if (!nombre || !campaña) {
            return res.status(400).json({ message: "Nombre y Campaña son obligatorios" });
        }

        const tienda = new Tienda({ 
            nombre, 
            premios_disponibles: premios_disponibles || 0, 
            campaña 
        });

        await tienda.save();

        res.status(201).json({
            message: 'Tienda creada correctamente',
            tienda
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear tienda', error: error.message });
    }
};

// Actualizar tienda
const actualizarTienda = async (req, res) => {
  const { nombre, premios_disponibles } = req.body;
  const { id } = req.params;

  try {
    // Usamos findByIdAndUpdate para ser más directos y eficientes
    const tienda = await Tienda.findByIdAndUpdate(
        id,
        { 
            ...(nombre && { nombre }), // Solo actualiza si envían el dato
            ...(typeof premios_disponibles !== 'undefined' && { premios_disponibles })
        },
        { new: true } // Devuelve el objeto actualizado
    );

    if (!tienda) {
      return res.status(404).json({ message: 'Tienda no encontrada' });
    }

    return res.status(200).json({
      message: 'Tienda actualizada correctamente',
      tienda
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar tienda', error: error.message });
  }
};

// Eliminar una tienda
// ⚠️ ADVERTENCIA: Esto borrará la tienda permanentemente. 
// Asegúrate desde el frontend de preguntar "¿Está seguro?" antes de llamar a esto.
const eliminarTienda = async (req, res) => {
    const { id } = req.params;

    try {
        const tienda = await Tienda.findByIdAndDelete(id);
        
        if (!tienda) {
            return res.status(404).json({ message: 'Tienda no encontrada' });
        }

        res.status(200).json({
            message: 'Tienda eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar tienda', error: error.message });
    }
};

module.exports = {
    crearTienda,
    getTiendas,
    actualizarTienda,
    eliminarTienda
};