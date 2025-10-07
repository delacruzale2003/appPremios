const Registro = require('../models/Registro'); // Importar el modelo Registro

// Función para obtener todos los registros con los detalles relacionados
exports.getRegistros = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
const skip = req.query.skip ? parseInt(req.query.skip) : null;

    const { campaña, tienda } = req.query;

    // Construir filtro dinámico
    const filtro = {};
    if (campaña) filtro.campaña = campaña;
    if (tienda) filtro['tienda_id'] = tienda; // ← debe ser el ObjectId de la tienda

    const registros = await Registro.find(filtro)
      .sort({ fecha_registro: -1 })
      .limit(limit)
      .skip(skip)
      .populate('cliente_id', 'nombre dni telefono')
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre')
      .exec();

    const total = await Registro.countDocuments(filtro);

    res.status(200).json({ registros, total });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registros', error });
  }
};


exports.getRegistroById = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Registro.findById(id)
      .populate('cliente_id', 'nombre dni telefono foto')  // Incluye la foto del cliente
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre')  // Si el premio tiene más datos, puedes agregar aquí
      .exec();

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.status(200).json({ registro });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el registro', error });
  }
};

exports.getRegistros = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const skip = req.query.skip ? parseInt(req.query.skip) : null;
    const { campaña, tienda } = req.query;

    // Construir filtro dinámico
    const filtro = {};
    if (campaña) filtro.campaña = campaña;
    if (tienda) filtro['tienda_id'] = tienda;

    let query = Registro.find(filtro)
      .sort({ fecha_registro: -1 })
      .populate('cliente_id', 'nombre dni telefono')
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre');

    if (limit !== null) query = query.limit(limit);
    if (skip !== null) query = query.skip(skip);

    const registros = await query.exec();
    const total = await Registro.countDocuments(filtro);

    res.status(200).json({ registros, total });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener registros', error });
  }
};

exports.eliminarTodosLosRegistros = async (req, res) => {
  try {
    const resultado = await Registro.deleteMany({});
    res.status(200).json({
      message: 'Todos los registros han sido eliminados correctamente.',
      eliminados: resultado.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al eliminar los registros.',
      error,
    });
  }
};
