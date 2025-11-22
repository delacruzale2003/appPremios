const Registro = require('../models/Registro');
const Cliente = require('../models/Cliente');

// --- OBTENER REGISTROS (Ganadores y No Ganadores unificados) ---
exports.getRegistros = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const { campaña, tienda } = req.query;

    const filtro = {};
    if (campaña) filtro.campaña = campaña;
    if (tienda) filtro.tienda_id = tienda;

    const [registros, total] = await Promise.all([
      Registro.find(filtro)
        .sort({ fecha_registro: -1 })
        .skip(skip)
        .limit(limit)
        .populate('cliente_id', 'nombre dni telefono foto')
        .populate('tienda_id', 'nombre')
        .populate('premio_id', 'nombre')
        .lean(), // Lectura rápida
      Registro.countDocuments(filtro)
    ]);

    res.status(200).json({ registros, total });
  } catch (error) {
    console.error("Error getRegistros:", error);
    res.status(500).json({ message: 'Error al obtener registros', error: error.message });
  }
};

// --- ALIAS PARA COMPATIBILIDAD (Redirige al método nuevo) ---
exports.getRegistrosCompletos = exports.getRegistros;

// --- OBTENER POR ID ---
exports.getRegistroById = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await Registro.findById(id)
      .populate('cliente_id', 'nombre dni telefono foto')
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre')
      .lean();

    if (!registro) return res.status(404).json({ message: 'Registro no encontrado' });
    res.status(200).json({ registro });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registro', error: error.message });
  }
};

// --- OBTENER POR CLIENTE ---
exports.getRegistroPorCliente = async (req, res) => {
  try {
    const { idCliente } = req.params;
    const registro = await Registro.findOne({ cliente_id: idCliente })
      .populate('cliente_id', 'nombre dni')
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre')
      .lean();

    if (!registro) return res.status(404).json({ message: 'No se encontró registro' });
    res.status(200).json({ registro });
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar por cliente', error: error.message });
  }
};

// --- ELIMINAR TODO (Cuidado con esto en producción) ---
exports.eliminarTodosLosRegistros = async (req, res) => {
  try {
    const resultado = await Registro.deleteMany({});
    res.status(200).json({
      message: 'Historial eliminado.',
      eliminados: resultado.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar', error: error.message });
  }
};