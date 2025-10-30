const express = require('express');
const router = express.Router();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const numeroDestino = process.env.WSP_DESTINO; // +51XXXXXXXXX

router.post('/', async (req, res) => {
  const { clientes } = req.body;

  if (!Array.isArray(clientes)) {
    return res.status(400).json({ error: 'Formato de clientes inválido' });
  }

  try {
    const clientesFanta = clientes.filter(c => c.campaña === 'fanta');

    for (const cliente of clientesFanta) {
      const mensaje = `🎃 Nuevo cliente FANTA:\n${cliente.nombre} (${cliente.dni})\nTienda: ${cliente.tienda?.nombre}`;
      await client.messages.create({
        from: 'whatsapp:+51969491079', // Twilio sandbox
        to: `whatsapp:${numeroDestino}`,
        body: mensaje,
      });
    }

    res.status(200).json({ ok: true, enviados: clientesFanta.length });
  } catch (err) {
    console.error('Error al enviar notificación:', err);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
});

module.exports = router;
