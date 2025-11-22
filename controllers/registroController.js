const Registro = require('../models/Registro');
const Cliente = require('../models/Cliente');
// ✅ AGREGADOS: Necesarios para que funcionen los .populate()
const Premio = require('../models/Premio'); 
const Tienda = require('../models/Tienda');

// --- OBTENER REGISTROS (Blindado contra Error 500) ---
exports.getRegistros = async (req, res) => {
  try {
    // 1. Manejo inteligente del límite
    let limit = 10; // Valor por defecto
    if (req.query.limit) {
      const parsed = parseInt(req.query.limit);
      // Si el parsed es NaN, volvemos a 10. Si es 0, lo mantenemos como 0.
      limit = isNaN(parsed) ? 10 : parsed;
    }

    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const { campaña, tienda } = req.query;

    // 2. Filtros Robustos (Evita CastError por strings vacíos)
    const filtro = {};
    if (campaña) filtro.campaña = campaña;
    
    // Solo agregamos el filtro de tienda si es un valor real
    if (tienda && tienda !== 'undefined' && tienda !== '') {
        filtro.tienda_id = tienda;
    }

    // 3. Construir la Query
    // Usamos .lean() para mejorar rendimiento al exportar muchos datos
    let query = Registro.find(filtro)
        .sort({ fecha_registro: -1 })
        .populate('cliente_id', 'nombre dni telefono foto')
        .populate('tienda_id', 'nombre')
        .populate('premio_id', 'nombre')
        .lean();

    // 4. Aplicar Paginación solo si hay un límite definido positivo
    // Si limit es 0 (Exportar Todo), saltamos este bloque y trae todo.
    if (limit > 0) {
        query = query.limit(limit).skip(skip);
    }

    // 5. Ejecutar en paralelo (Datos + Conteo Total)
    const [registros, total] = await Promise.all([
      query.exec(),
      Registro.countDocuments(filtro)
    ]);

    res.status(200).json({ registros, total });

  } catch (error) {
    console.error("❌ Error CRÍTICO en getRegistros:", error);
    // Devolvemos el error detallado para verlo en el navegador
    res.status(500).json({ message: 'Error interno al obtener registros', error: error.message });
  }
};

// --- ALIAS PARA COMPATIBILIDAD ---
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

// --- ELIMINAR TODO ---
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