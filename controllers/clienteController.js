const { validationResult } = require('express-validator');
const axios = require('axios');

const Cliente = require('../models/Cliente');
const Registro = require('../models/Registro');
const Tienda = require('../models/Tienda');
const Premio = require('../models/Premio');

const campañasConDniUnico = ['cocacola', 'fantaauto', 'sanluis', 'cclibertadores'];

// Función para registrar un cliente
exports.registrarCliente = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { dni, nombre, telefono, tienda, foto, campaña } = req.body;

  try {
    // Validar si esta campaña requiere DNI único
    const requiereDniUnico = campañasConDniUnico.includes(campaña);

    if (requiereDniUnico) {
      const yaRegistrado = await Cliente.findOne({ dni, campaña });
      if (yaRegistrado) {
        return res.status(400).json({
          message: 'Este DNI ya fue registrado en esta campaña',
          error: 'dni_duplicado_en_campaña'
        });
      }
    }

    // Crear y guardar el cliente
    const cliente = new Cliente({
      dni,
      nombre,
      telefono,
      tienda,
      foto,
      campaña,
      isValid: true,
      tienePremio: false,
    });

    await cliente.save();

    // Notificación solo para campaña fanta
    if (campaña === 'fanta') {
      let tiendaNombre = 'Sin tienda';

      // 💡 CORRECCIÓN AQUÍ: Si hay un ID de tienda, búscalo para obtener el nombre
      if (tienda) {
        try {
          const tiendaEncontrada = await Tienda.findById(tienda);
          if (tiendaEncontrada) {
            tiendaNombre = tiendaEncontrada.nombre;
          }
        } catch (err) {
          console.error('Error al buscar la tienda para notificación:', err.message);
          // Continuamos con 'Sin tienda' si falla la búsqueda
        }
      }
      // -----------------------------------------------------------------------

      const mensaje = `Nuevo cliente FANTA registrado:\n👤 ${nombre}\n🆔 DNI: ${dni}\n📞 Teléfono: ${telefono}\n🏪 Tienda: ${tiendaNombre}`;

      try {
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: mensaje,
        });
      } catch (err) {
        console.error('❌ Error al enviar notificación Telegram:', err.message);
      }
    }

    res.status(201).json({ message: 'Cliente registrado correctamente', cliente });
  } catch (error) {
    console.error('Error en registrarCliente:', error);
    res.status(500).json({ message: 'Error al registrar cliente', error: error.message || error });
  }
};

// Obtener últimos clientes (limit, por campaña)
exports.getClientes = async (req, res) => {
  const { limit, campaña } = req.query;

  try {
    const filtro = campaña ? { campaña } : {};

    let query = Cliente.find(filtro).sort({ fecha_registro: -1 }).populate('tienda', 'nombre').lean();

    if (limit) {
      query = query.limit(Number(limit));
    }

    const clientes = await query;

    res.status(200).json({ clientes });
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message || error });
  }
};

exports.exportClientes = async (req, res) => {
  const { campaña } = req.query;

  try {
    const filtro = campaña ? { campaña } : {};

    const clientes = await Cliente.find(filtro)
      .sort({ fecha_registro: -1 })
      .populate('tienda', 'nombre') // si existe en el schema
      .lean();

    res.status(200).json({ clientes });
  } catch (error) {
    console.error('Error en exportClientes:', error);
    res.status(500).json({
      message: 'Error al exportar clientes',
      error: error.message || error,
    });
  }
};

// Obtener un cliente por su ID
exports.getClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findById(id)
  .populate('tienda', 'nombre')
  .populate('premio', 'nombre'); // ← importante

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json({ cliente });
  } catch (error) {
    console.error('Error en getClientePorId:', error);
    res.status(500).json({ message: 'Error al obtener cliente', error: error.message || error });
  }
};

// Clientes pendientes (isValid true, sin premio, con tienda)
exports.getClientesPendientes = async (req, res) => {
  const { campaña } = req.query;

  try {
    const filtro = {
      isValid: true,
      tienePremio: false,
      tienda: { $ne: null },
      ...(campaña && { campaña })
    };

    const clientes = await Cliente.find(filtro).populate('tienda', 'nombre').lean();
    res.status(200).json({ clientes });
  } catch (error) {
    console.error('Error en getClientesPendientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes pendientes', error: error.message || error });
  }
};

// Clientes cancelados (isValid false)
exports.getClientesCancelados = async (req, res) => {
  const { campaña } = req.query;

  try {
    const filtro = {
      isValid: false,
      ...(campaña && { campaña })
    };

    const clientes = await Cliente.find(filtro).populate('tienda', 'nombre').lean();
    res.status(200).json({ clientes });
  } catch (error) {
    console.error('Error en getClientesCancelados:', error);
    res.status(500).json({ message: 'Error al obtener clientes cancelados', error: error.message || error });
  }
};

// Endpoint para verificar si hay clientes FANTA pendientes de premio
exports.notificacionFanta = async (req, res) => {
  try {
    const hayPendientes = await Cliente.exists({
      campaña: 'fanta',
      isValid: true,
      tienePremio: false,
      tienda: { $ne: null }
    });

    res.status(200).json({ hayPendientes: Boolean(hayPendientes) });
  } catch (error) {
    console.error('Error en notificacionFanta:', error);
    res.status(500).json({ message: 'Error al verificar notificación Fanta', error: error.message || error });
  }
};

// Devuelve toda la actividad de la campaña 'fanta' (clientes con o sin premio), orden cronológico descendente
// GET /actividad-fanta-completa?limit=1000&skip=0
exports.getActividadFantaCompleta = async (req, res) => {
  try {
    const campaña = 'fanta';
    const tiendaFiltro = req.query.tienda ? String(req.query.tienda) : null;
    const limit = Math.max(1, Math.min(5000, Number(req.query.limit ?? 1000)));
    const skip = Math.max(0, Number(req.query.skip ?? 0));

    // Build filtro para registros (aplica tienda si se pasó)
    const filtroRegistros = { campaña };
    if (tiendaFiltro) filtroRegistros.tienda_id = tiendaFiltro;

    // 1) Traer registros (clientes que recibieron premio), aplicando filtro de tienda si existe
    const registros = await Registro.find(filtroRegistros)
      .sort({ fecha_registro: -1 })
      .skip(skip)
      .limit(limit)
      .populate('cliente_id', 'nombre dni telefono tienda foto isValid tienePremio fecha_registro campaña')
      .populate('tienda_id', 'nombre')
      .populate('premio_id', 'nombre')
      .lean();

    // Mapear registros a formato unificado
    const itemsFromRegistros = registros.map((r) => {
      const cliente = r.cliente_id || {};
      return {
        origen: 'registro',
        registro_id: r._id,
        cliente_id: cliente._id ?? null,
        nombre: cliente.nombre ?? null,
        dni: cliente.dni ?? null,
        telefono: cliente.telefono ?? null,
        tienda: r.tienda_id ? { _id: r.tienda_id._id, nombre: r.tienda_id.nombre } :
               (cliente.tienda ? { _id: cliente.tienda._id ?? null, nombre: cliente.tienda.nombre ?? null } : null),
        foto: r.foto ?? cliente.foto ?? null,
        premio: r.premio_id ? r.premio_id.nombre : (cliente.premio ? cliente.premio : 'SIN CONFIRMAR'),
        tienePremio: Boolean(r.premio_id) || Boolean(cliente.tienePremio),
        isValid: cliente.isValid === undefined ? true : cliente.isValid,
        fecha_registro: r.fecha_registro ?? cliente.fecha_registro ?? null,
        campaña: r.campaña ?? cliente.campaña ?? campaña,
      };
    });

    // 2) Obtener clientes de la campaña que NO están en la colección Registro
    const clienteIdsConRegistro = registros
      .map((r) => (r.cliente_id ? String(r.cliente_id._id) : null))
      .filter(Boolean);

    const filtroClientes = { campaña };
    if (clienteIdsConRegistro.length) filtroClientes._id = { $nin: clienteIdsConRegistro };
    if (tiendaFiltro) filtroClientes.tienda = tiendaFiltro;

    const clientesSinRegistro = await Cliente.find(filtroClientes)
      .select('nombre dni telefono tienda foto isValid tienePremio fecha_registro campaña')
      .populate('tienda', 'nombre')
      .lean();

    const itemsFromClientes = clientesSinRegistro.map((c) => ({
      origen: 'cliente',
      cliente_id: c._id,
      nombre: c.nombre ?? null,
      dni: c.dni ?? null,
      telefono: c.telefono ?? null,
      tienda: c.tienda ? { _id: c.tienda._id, nombre: c.tienda.nombre } : null,
      foto: c.foto ?? null,
      premio: 'SIN CONFIRMAR',
      tienePremio: Boolean(c.tienePremio),
      isValid: c.isValid === undefined ? true : c.isValid,
      fecha_registro: c.fecha_registro ?? null,
      campaña: c.campaña ?? campaña,
    }));

    // 3) Unir y ordenar por fecha_registro descendente (fallback fecha 0 para que queden al final)
    const combinado = [...itemsFromRegistros, ...itemsFromClientes];
    combinado.sort((a, b) => {
      const ta = a.fecha_registro ? new Date(a.fecha_registro).getTime() : 0;
      const tb = b.fecha_registro ? new Date(b.fecha_registro).getTime() : 0;
      return tb - ta;
    });

    // 4) Total real: contar documentos que coinciden con filtros (registros + clientes sin registro)
    // contar registros totales que coinciden con filtroRegistros (no paginados)
    const totalRegistrosMatching = await Registro.countDocuments(filtroRegistros);
    // contar clientes totales que coinciden con cliente filtro (antes de excluir por registro)
    const filtroClientesTotal = { campaña };
    if (tiendaFiltro) filtroClientesTotal.tienda = tiendaFiltro;
    const totalClientesMatching = await Cliente.countDocuments(filtroClientesTotal);
    // estimación total combinado (no doble conteo): registros + (clientes - clientesConRegistro)
    const total = totalRegistrosMatching + Math.max(0, totalClientesMatching - clienteIdsConRegistro.length);

    return res.status(200).json({
      total,
      registros: combinado
    });
  } catch (error) {
    console.error('Error en getActividadFantaCompleta:', error);
    return res.status(500).json({ message: 'Error al obtener actividad completa de FANTA', error: error.message || error });
  }
};
