const Cliente = require('../models/Cliente');

const expirarClientes = async () => {
  const haceDosMinutos = new Date(Date.now() - 2 * 60 * 1000);

  try {
    const expirados = await Cliente.updateMany(
      {
        isValid: true,
        tienePremio: false,
        fecha_registro: { $lt: haceDosMinutos },
      },
      {
        $set: {
          isValid: false,
          mensaje: 'Validación expirada automáticamente',
        },
      }
    );

    console.log(`Clientes expirados: ${expirados.modifiedCount}`);
  } catch (error) {
    console.error('Error expirando clientes:', error);
  }
};

module.exports = expirarClientes;
