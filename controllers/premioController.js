const mongoose = require('mongoose');
const Premio = require('../models/Premio');
const Tienda = require('../models/Tienda');
const Cliente = require('../models/Cliente');
const Registro = require('../models/Registro');
const axios = require('axios'); // Necesario para Telegram

// --- CONFIGURACIÓN ---
// Lista de campañas que EXIGEN DNI ÚNICO (No se puede repetir)
const campañasConDniUnico = ['cocacola', 'fantaauto', 'sanluis', 'cclibertadores', ];

// ==========================================
// 1. LÓGICA PRINCIPAL: SORTEO / JUGAR
// ==========================================
exports.entregarPremio = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { dni, nombre, telefono, foto, campaña } = req.body;
    // Soporte para ambos nombres de variable por compatibilidad
    const id_tienda = req.body.id_tienda || req.body.tienda_id;

    // 1. Validaciones Básicas
    if (!dni || !campaña || !id_tienda) {
      throw new Error("Faltan datos: DNI, Campaña o Tienda son obligatorios.");
    }

    const tienda = await Tienda.findById(id_tienda).session(session);
    if (!tienda) throw new Error("Tienda no encontrada");

    // 2. Buscar o Crear Cliente (Upsert)
    // Siempre mantenemos los datos del cliente actualizados
    const cliente = await Cliente.findOneAndUpdate(
      { dni, campaña },
      { 
        nombre, 
        telefono, 
        tienda: id_tienda, 
        foto: foto || "", 
        isValid: true,
        fecha_registro: new Date()
      },
      { new: true, upsert: true, session }
    );

    // 3. VALIDACIÓN DE DUPLICADOS (Tu lógica original)
    // Solo verificamos duplicidad si la campaña está en la lista estricta.
    if (campañasConDniUnico.includes(campaña)) {
        const yaJugo = await Registro.findOne({ cliente_id: cliente._id, campaña }).session(session);
        
        if (yaJugo) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                message: 'Este DNI ya fue registrado en esta campaña',
                error_code: 'dni_duplicado_en_campaña'
            });
        }
    }

    // 4. SELECCIÓN DEL PREMIO (Lógica de Ruleta)
    const premiosDisponibles = await Premio.find({ 
        id_tienda: id_tienda, 
        campaña: campaña,
        stock_disponible: { $gt: 0 } 
    }).session(session);

    let premioGanado = null;
    let esGanador = false;

    if (premiosDisponibles.length > 0) {
        // Algoritmo de Ruleta Ponderada
        const totalStock = premiosDisponibles.reduce((sum, p) => sum + p.stock_disponible, 0);
        let random = Math.random() * totalStock;
        let seleccionado = null;

        for (const p of premiosDisponibles) {
            if (random < p.stock_disponible) {
                seleccionado = p;
                break;
            }
            random -= p.stock_disponible;
        }

        // 5. INTENTO DE RESERVA ATÓMICA
        if (seleccionado) {
            const premioActualizado = await Premio.findOneAndUpdate(
                { _id: seleccionado._id, stock_disponible: { $gt: 0 } },
                { $inc: { stock_disponible: -1 } },
                { new: true, session }
            );

            if (premioActualizado) {
                premioGanado = premioActualizado;
                esGanador = true;
                
                // Actualizamos contadores visuales
                await Tienda.findByIdAndUpdate(id_tienda, { $inc: { premios_disponibles: -1 } }, { session });
                await Cliente.findByIdAndUpdate(cliente._id, { tienePremio: true }, { session });
            }
        }
    }

    // 6. CREAR REGISTRO
    const nuevoRegistroArray = await Registro.create([{
        cliente_id: cliente._id,
        tienda_id: id_tienda,
        premio_id: esGanador ? premioGanado._id : null,
        campaña: campaña,
        foto: cliente.foto,
        esGanador: esGanador,
        fecha_registro: new Date()
    }], { session });

    // 7. COMMIT FINAL (Guardar cambios en BD)
    await session.commitTransaction();
    session.endSession();

    // 8. NOTIFICACIÓN TELEGRAM (Post-Proceso)
    // Solo para campaña 'fanta' (o las que tú quieras configurar)
    if (campaña === 'fanta' && process.env.TELEGRAM_BOT_TOKEN) {
        const nombreTienda = tienda.nombre || 'Sin tienda';
        const mensaje = `Nuevo registro FANTA:\n👤 ${nombre}\n🆔 DNI: ${dni}\n📞 Tel: ${telefono}\n🏪 Tienda: ${nombreTienda}\n🏆 Ganó: ${esGanador ? 'SÍ' : 'NO'}`;

        // Fire and forget (No esperamos la respuesta para responder al usuario)
        axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: mensaje,
        }).catch(err => console.error("Error Telegram:", err.message));
    }

    // Respuesta al Frontend
    return res.status(201).json({
        message: esGanador ? '¡Premio entregado correctamente!' : 'Registro exitoso (Sin premio)',
        premio: esGanador ? premioGanado.nombre : null,
        cliente: {
            nombre: cliente.nombre,
            dni: cliente.dni,
            tienda: tienda.nombre
        },
        esGanador: esGanador
    });

  } catch (error) {
    // Si la sesión sigue activa, abortamos
    if (session.inTransaction()) {
        await session.abortTransaction();
    }
    session.endSession();
    console.error("Error en entregarPremio:", error);
    return res.status(500).json({ message: 'Error interno al procesar', error: error.message });
  }
};

// ==========================================
// 2. GESTIÓN DE CLIENTES (INVALIDAR)
// ==========================================
exports.cancelarCliente = async (req, res) => {
  const { id_cliente } = req.body;

  try {
    const cliente = await Cliente.findByIdAndUpdate(
        id_cliente, 
        { isValid: false, mensaje: 'Registro anulado manualmente' },
        { new: true }
    );

    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });

    await Registro.updateMany(
        { cliente_id: id_cliente },
        { esGanador: false, premio_id: null }
    );

    return res.json({
      message: 'Cliente invalidado correctamente',
      cliente: cliente.nombre
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cancelar', error: error.message });
  }
};

// ==========================================
// 3. CRUD DE PREMIOS
// ==========================================
exports.crearPremio = async (req, res) => {
  const { nombre, stock_inicial, stock_disponible, id_tienda, campaña } = req.body;
  try {
    const tienda = await Tienda.findById(id_tienda);
    if (!tienda) return res.status(404).json({ message: 'Tienda no encontrada' });

    const premio = new Premio({ nombre, stock_inicial, stock_disponible, id_tienda, campaña });
    await premio.save();
    
    // Actualizar contador tienda
    tienda.premios_disponibles = (tienda.premios_disponibles || 0) + parseInt(stock_disponible);
    await tienda.save();

    res.status(201).json({ message: 'Premio creado', premio });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear premio', error });
  }
};

exports.getPremiosByIdTienda = async (req, res) => {
  const { id_tienda } = req.params;
  try {
    const premios = await Premio.find({ id_tienda }).lean();
    res.json({ message: 'Premios obtenidos', premios });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener premios', error });
  }
};

exports.actualizarPremio = async (req, res) => {
  const { nombre, stock_inicial, stock_disponible, id_tienda } = req.body;
  const { id } = req.params;

  try {
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (stock_inicial !== undefined) updateData.stock_inicial = stock_inicial;
    if (stock_disponible !== undefined) updateData.stock_disponible = stock_disponible;
    if (id_tienda !== undefined) updateData.id_tienda = id_tienda;

    const premio = await Premio.findByIdAndUpdate(id, updateData, { new: true });
    if (!premio) return res.status(404).json({ message: 'Premio no encontrado' });

    res.status(200).json({ message: 'Premio actualizado', premio });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar', error });
  }
};

exports.getPremiosPorCampaña = async (req, res) => {
  const { campaña } = req.query;
  try {
    const premios = await Premio.find({ campaña }).lean();
    return res.json(premios);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener premios', error });
  }
};