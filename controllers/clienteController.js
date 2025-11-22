const Cliente = require('../models/Cliente');
const Registro = require('../models/Registro');

// Obtener clientes (Paginado y ligero)
exports.getClientes = async (req, res) => {
  const { limit = 20, skip = 0, campaña } = req.query;

  try {
    const filtro = campaña ? { campaña } : {};

    const clientes = await Cliente.find(filtro)
      .sort({ fecha_registro: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('tienda', 'nombre')
      .lean(); // .lean() hace que sea mucho más rápido

    const total = await Cliente.countDocuments(filtro);

    res.status(200).json({ clientes, total });
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
};

// Obtener un cliente por ID
exports.getClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findById(id)
      .populate('tienda', 'nombre')
      .lean();

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Buscamos su historial de juegos
    const historial = await Registro.find({ cliente_id: id }).populate('premio_id').lean();

    res.status(200).json({ cliente, historial });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cliente', error: error.message });
  }
};

// Reporte de Actividad (Reemplaza a tu complejo getActividadFantaCompleta)
// Como ya migramos los datos, esta consulta ahora es simple y rápida.
exports.getActividadCompleta = async (req, res) => {
    const { campaña, limit = 100, skip = 0 } = req.query;

    try {
        const registros = await Registro.find({ campaña })
            .sort({ fecha_registro: -1 })
            .skip(Number(skip))
            .limit(Number(limit))
            .populate('cliente_id', 'nombre dni telefono foto')
            .populate('tienda_id', 'nombre')
            .populate('premio_id', 'nombre')
            .lean();
        
        const total = await Registro.countDocuments({ campaña });

        res.status(200).json({ registros, total });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reporte", error: error.message });
    }
};