const mongoose = require('mongoose');
const Registro = require('../models/Registro');
const Cliente = require('../models/Cliente');
// ✅ IMPORTANTE: Mayúsculas para coincidir con tus archivos en Render (Linux)
const Premio = require('../models/Premio'); 
const Tienda = require('../models/Tienda'); 

// --- OBTENER REGISTROS (Blindado contra Error 500) ---
exports.getRegistros = async (req, res) => {
  try {
    // 1. Manejo inteligente del límite
    let limit = 10; 
    if (req.query.limit) {
      const parsed = parseInt(req.query.limit);
      // Si es NaN vuelve a 10. Si es 0, se queda en 0 (para exportar todo).
      limit = isNaN(parsed) ? 10 : parsed;
    }

    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const { campaña, tienda } = req.query;

    // 2. Filtros Robustos
    const filtro = {};
    if (campaña) filtro.campaña = campaña;
    
    // Solo agregamos el filtro de tienda si es un ID real y no un string vacío
    if (tienda && tienda !== 'undefined' && tienda !== '') {
        filtro.tienda_id = tienda;
    }

    // 3. Construir Query
    let query = Registro.find(filtro)
        .sort({ fecha_registro: -1 })
        .populate({ path: 'cliente_id', select: 'nombre dni telefono foto', strictPopulate: false })
        .populate({ path: 'tienda_id', select: 'nombre', strictPopulate: false })
        .populate({ path: 'premio_id', select: 'nombre', strictPopulate: false })
        .lean();

    // 4. Paginación
    // Si limit es 0 (Exportar), NO limitamos. Si es > 0, paginamos.
    if (limit > 0) {
        query = query.limit(limit).skip(skip);
    }

    // 5. Ejecutar
    const [registros, total] = await Promise.all([
      query.exec(),
      Registro.countDocuments(filtro)
    ]);

    res.status(200).json({ registros, total });

  } catch (error) {
    console.error("❌ Error CRÍTICO en getRegistros:", error);
    res.status(500).json({ message: 'Error interno', error: error.message });
  }
};

// --- ALIAS PARA COMPATIBILIDAD ---
exports.getRegistrosCompletos = exports.getRegistros;

// --- OBTENER POR ID (Del Registro) ---
exports.getRegistroById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validación extra de seguridad
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'ID de registro inválido' });
    }

    const registro = await Registro.findById(id)
      .populate('cliente_id', 'nombre dni telefono foto')
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre')
      .lean();

    if (!registro) return res.status(404).json({ message: 'Registro no encontrado' });
    res.status(200).json({ registro });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

// --- OBTENER POR CLIENTE (HÍBRIDO: ID O DNI) ---
// ✅ ESTA ES LA FUNCIÓN QUE ARREGLA TU ERROR "Cast to ObjectId"
exports.getRegistroPorCliente = async (req, res) => {
  try {
    const { idCliente } = req.params;
    
    let idBusqueda = idCliente;

    // 1. DETECTAR SI ES UN DNI (No es un ObjectId válido de MongoDB)
    // Si el frontend manda "27777777", esto entra al if
    if (!mongoose.Types.ObjectId.isValid(idCliente)) {
        // Asumimos que es un DNI y buscamos primero al cliente para obtener su _id real
        const clienteEncontrado = await Cliente.findOne({ dni: idCliente });
        
        if (!clienteEncontrado) {
            return res.status(404).json({ message: `No existe cliente con DNI: ${idCliente}` });
        }
        // Usamos su ID real (_id) para buscar en la tabla de registros
        idBusqueda = clienteEncontrado._id;
    }

    // 2. BUSCAR EL REGISTRO CON EL ID SEGURO
    const registro = await Registro.findOne({ cliente_id: idBusqueda })
      .populate({ path: 'cliente_id', select: 'nombre dni', strictPopulate: false })
      .populate({ path: 'tienda_id', select: 'nombre', strictPopulate: false })
      .populate({ path: 'premio_id', select: 'nombre', strictPopulate: false })
      .lean();

    if (!registro) return res.status(404).json({ message: 'No se encontró registro de juego para este cliente' });
    
    res.status(200).json({ registro });
  } catch (error) {
    console.error("Error en getRegistroPorCliente:", error);
    res.status(500).json({ message: 'Error al buscar por cliente', error: error.message });
  }
};

// --- ELIMINAR TODO ---
exports.eliminarTodosLosRegistros = async (req, res) => {
  try {
    const resultado = await Registro.deleteMany({});
    res.status(200).json({ message: 'Eliminados', eliminados: resultado.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};