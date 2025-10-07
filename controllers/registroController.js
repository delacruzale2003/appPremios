const Registro = require('../models/Registro'); // Importar el modelo Registro

// Obtener todos los registros con filtros y paginación opcional
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

// Obtener un registro por ID
exports.getRegistroById = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await Registro.findById(id)
      .populate('cliente_id', 'nombre dni telefono foto')
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre')
      .exec();

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.status(200).json({ registro });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el registro', error });
  }
};

// Obtener registro por cliente
exports.getRegistroPorCliente = async (req, res) => {
  try {
    const { idCliente } = req.params;

    const registro = await Registro.findOne({ cliente_id: idCliente })
      .populate({
        path: 'cliente_id',
        select: 'nombre dni telefono foto tienda',
        populate: {
          path: 'tienda',
          select: 'nombre'
        }
      })
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre')
      .exec();

    if (!registro) {
      return res.status(404).json({ message: 'No se encontró registro para este cliente' });
    }

    res.status(200).json({ registro });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el registro por cliente', error });
  }
};

// Eliminar todos los registros
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
