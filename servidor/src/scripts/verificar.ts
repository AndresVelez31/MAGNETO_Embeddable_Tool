import connectDB from '../config/database';
import { Usuario } from '../models/Usuario';

const verificarUsuarios = async (): Promise<void> => {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...\n');

    // Conectar a la base de datos
    await connectDB();

    // Consultar todos los usuarios
    const usuarios = await Usuario.find({}).select('-contraseña'); // Excluir contraseñas por seguridad

    if (usuarios.length === 0) {
      console.log('❌ No se encontraron usuarios en la base de datos');
    } else {
      console.log(`✅ Se encontraron ${usuarios.length} usuarios:\n`);
      
      usuarios.forEach((usuario: any, index: number) => {
        console.log(`${index + 1}. ${usuario.nombre}`);
        console.log(`   Username: ${usuario.username}`);
        console.log(`   Email: ${usuario.correoElectronico}`);
        console.log(`   Documento: ${usuario.tipoDocumento} ${usuario.documento}`);
        console.log(`   Edad: ${usuario.edad} años`);
        console.log(`   Creado: ${usuario.creadoEn}`);
        console.log('   ─────────────────────────────\n');
      });
    }

    // Mostrar estadísticas
    console.log('📊 Estadísticas:');
    const estadisticas = await Usuario.aggregate([
      {
        $group: {
          _id: '$tipoDocumento',
          count: { $sum: 1 }
        }
      }
    ]);
    
    estadisticas.forEach(stat => {
      console.log(`   - ${stat._id}: ${stat.count} usuarios`);
    });

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
  } finally {
    process.exit(0);
  }
};

// Ejecutar la verificación
if (require.main === module) {
  verificarUsuarios();
}

export default verificarUsuarios;