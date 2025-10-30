const { validationResult } = require('express-validator');
const Cliente = require('../models/Cliente');
const axios = require('axios');
const campañasConDniUnico = ['cocacola', 'fantaauto'];

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

    // ✅ Notificación solo para campaña fanta
    if (campaña === 'fanta') {
      const tiendaNombre = tienda?.nombre || 'Sin tienda';
      const mensaje = `🎃 Nuevo cliente FANTA registrado:\n👤 ${nombre}\n🆔 DNI: ${dni}\n📞 Teléfono: ${telefono}\n🏪 Tienda: ${tiendaNombre}`;

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
    res.status(500).json({ message: 'Error al registrar cliente', error });
  }
};


// Función para obtener los últimos clientes registrados con el nombre de la tienda
exports.getClientes = async (req, res) => {
  const { limit = 10, campaña } = req.query;

  try {
    const filtro = campaña ? { campaña } : {};

    const clientes = await Cliente.find(filtro)
      .sort({ fecha_registro: -1 })
      .limit(Number(limit))
      .populate('tienda', 'nombre');

    res.status(200).json({ clientes });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes', error });
  }
};

// Obtener un cliente por su ID
exports.getClientePorId = async (req, res) => {
  const { id } = req.params;

  try {
    const cliente = await Cliente.findById(id).populate('tienda', 'nombre');
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.status(200).json({ cliente });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cliente', error });
  }
};

exports.getClientesPendientes = async (req, res) => {
  const { campaña } = req.query;

  try {
    const filtro = {
      isValid: true,
      tienePremio: false,
      tienda: { $ne: null },
      ...(campaña && { campaña })
    };

    const clientes = await Cliente.find(filtro).populate('tienda', 'nombre');
    res.status(200).json({ clientes });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes pendientes', error });
  }
};

exports.getClientesCancelados = async (req, res) => {
  const { campaña } = req.query;

  try {
    const filtro = {
      isValid: false,
      ...(campaña && { campaña })
    };

    const clientes = await Cliente.find(filtro).populate('tienda', 'nombre');
    res.status(200).json({ clientes });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener clientes cancelados', error });
  }
};

