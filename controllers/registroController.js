const Registro = require('../models/Registro'); // Importar el modelo Registro

// Función para obtener todos los registros con los detalles relacionados
exports.getRegistros = async (req, res) => {
    try {
        // Obtener los registros de los clientes y poblar las relaciones
        const registros = await Registro.find()
            .populate('cliente_id', 'nombre dni')  // Poblar cliente_id y obtener solo nombre y dni
            .populate('tienda_id', 'nombre')      // Poblar tienda_id y obtener solo el nombre de la tienda
            .populate('premio_id', 'nombre')      // Poblar premio_id y obtener solo el nombre del premio
            .exec();

        // Responder con los registros encontrados
        res.status(200).json({ registros });
    } catch (error) {
        // Manejar el error y devolver una respuesta con estado 500
        res.status(500).json({ message: 'Error al obtener registros', error });
    }
};