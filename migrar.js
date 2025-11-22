const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cliente = require('./models/Cliente');
const Registro = require('./models/Registro');
const Tienda = require('./models/Tienda');

dotenv.config();

// --- CONFIGURACIÓN ---
// Pega aquí el ID de tienda que copiaste antes. 
// Si no tienes uno, el script intentará buscarlo o creará uno ficticio.
const ID_TIENDA_FALLBACK = 'PEGAR_AQUI_ID_DE_UNA_TIENDA_REAL'; 

const runMigration = async () => {
    try {
        console.log('⏳ Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado.');

        // Buscamos clientes sin premio o inválidos
        const clientesSinPremio = await Cliente.find({
            $or: [{ tienePremio: false }, { isValid: false }]
        });

        console.log(`🔍 Procesando ${clientesSinPremio.length} clientes...`);

        let contador = 0;
        let errores = 0;

        // Buscar una tienda real para usar de relleno
        let tiendaDefaultId = null;
        
        // 1. Intentamos usar la constante manual
        if (ID_TIENDA_FALLBACK !== 'PEGAR_AQUI_ID_DE_UNA_TIENDA_REAL') {
            tiendaDefaultId = ID_TIENDA_FALLBACK;
        } 
        // 2. Si no, buscamos la primera que exista en la BD
        else {
            const primeraTienda = await Tienda.findOne();
            if (primeraTienda) {
                tiendaDefaultId = primeraTienda._id;
            } else {
                // 3. Si no hay NINGUNA tienda, generamos un ID válido al azar
                // (Esto evita el crash, aunque el dato no apuntará a nada real)
                tiendaDefaultId = new mongoose.Types.ObjectId();
                console.log("⚠️ No se encontraron tiendas reales. Usando ID generado.");
            }
        }

        for (const cliente of clientesSinPremio) {
            try {
                const existe = await Registro.findOne({ cliente_id: cliente._id });

                if (!existe) {
                    // LÓGICA DE RELLENO (FALLBACKS)
                    
                    // 1. Reparar Tienda
                    let tiendaFinal = cliente.tienda;
                    if (!tiendaFinal) {
                        tiendaFinal = tiendaDefaultId;
                    }

                    // 2. Reparar Campaña
                    let campañaFinal = cliente.campaña;
                    if (!campañaFinal) {
                        campañaFinal = "campaña_legacy_recuperada";
                    }

                    // Crear el objeto manualmente
                    const nuevoRegistro = new Registro({
                        cliente_id: cliente._id,
                        tienda_id: tiendaFinal, 
                        premio_id: null, // Nulo permitido
                        foto: cliente.foto || "",
                        fecha_registro: cliente.fecha_registro || new Date(),
                        campaña: campañaFinal, // Usamos el valor reparado
                        esGanador: false
                    });

                    // Guardar ignorando validaciones estrictas
                    await nuevoRegistro.save({ validateBeforeSave: false });

                    process.stdout.write('.');
                    contador++;
                }
            } catch (err) {
                console.error(`\n❌ Error irrecuperable cliente ${cliente.dni}: ${err.message}`);
                errores++;
            }
        }

        console.log('\n-----------------------------------');
        console.log(`🎉 ¡FIN!`);
        console.log(`✅ Registros rescatados: ${contador}`);
        console.log(`❌ Errores: ${errores}`);
        console.log('-----------------------------------');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error de conexión:', error);
        process.exit(1);
    }
};

runMigration();