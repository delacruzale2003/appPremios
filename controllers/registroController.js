const Registro = require('../models/Registro'); // Importar el modelo Registro

// Función para obtener todos los registros con los detalles relacionados
exports.getRegistros = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const { campaña } = req.query;

    const filtro = campaña ? { campaña } : {};

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
