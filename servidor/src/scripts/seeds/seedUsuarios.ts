import connectDB from '../../config/database';
import { Usuario } from '../../infrastructure/database/models/Usuario';

// Usuarios de prueba
const usuariosPrueba = [
  {
    nombre: "Juan Pérez",
    username: "juan.perez",
    edad: 28,
    tipoDocumento: "CC",
    documento: "12345678",
    correoElectronico: "juan.perez@ejemplo.com",
    contraseña: "123456"
  },
  {
    nombre: "María García",
    username: "maria.garcia",
    edad: 32,
    tipoDocumento: "CC",
    documento: "87654321",
    correoElectronico: "maria.garcia@ejemplo.com",
    contraseña: "123456"
  },
  {
    nombre: "Carlos López",
    username: "carlos.lopez",
    edad: 25,
    tipoDocumento: "CE",
    documento: "11223344",
    correoElectronico: "carlos.lopez@ejemplo.com",
    contraseña: "123456"
  },
  {
    nombre: "Ana Rodríguez",
    username: "ana.rodriguez",
    edad: 29,
    tipoDocumento: "CC",
    documento: "44332211",
    correoElectronico: "ana.rodriguez@ejemplo.com",
    contraseña: "123456"
  },
  {
    nombre: "Luis Martínez",
    username: "luis.martinez",
    edad: 35,
    tipoDocumento: "PAS",
    documento: "A1B2C3D4",
    correoElectronico: "luis.martinez@ejemplo.com",
    contraseña: "123456"
  },
  {
    nombre: "Sandra Fernández",
    username: "sandra.fernandez",
    edad: 27,
    tipoDocumento: "CC",
    documento: "55667788",
    correoElectronico: "sandra.fernandez@ejemplo.com",
    contraseña: "123456"
  },
  {
    nombre: "Pedro Jiménez",
    username: "pedro.jimenez",
    edad: 31,
    tipoDocumento: "CC",
    documento: "99887766",
    correoElectronico: "pedro.jimenez@ejemplo.com",
    contraseña: "123456"
  },
  {
    nombre: "Laura Morales",
    username: "laura.morales",
    edad: 26,
    tipoDocumento: "CC",
    documento: "13579246",
    correoElectronico: "laura.morales@ejemplo.com",
    contraseña: "123456"
  },
  {
    nombre: "Administrador Sistema",
    username: "admin",
    edad: 40,
    tipoDocumento: "CC",
    documento: "00000001",
    correoElectronico: "admin@magneto.com",
    contraseña: "admin123"
  },
  {
    nombre: "Usuario Demo",
    username: "demo",
    edad: 30,
    tipoDocumento: "CC",
    documento: "11111111",
    correoElectronico: "demo@magneto.com",
    contraseña: "demo123"
  }
];

const seedUsuarios = async (): Promise<void> => {
  try {
    console.log('🌱 Iniciando seed de usuarios...');

    // Conectar a la base de datos
    await connectDB();

    // Limpiar la colección de usuarios (opcional)
    console.log('🗑️ Limpiando usuarios existentes...');
    await Usuario.deleteMany({});

    // Insertar usuarios de prueba
    console.log('👥 Insertando usuarios de prueba...');
    const usuariosCreados = await Usuario.insertMany(usuariosPrueba);

    console.log(`✅ Se crearon ${usuariosCreados.length} usuarios de prueba exitosamente:`);
    usuariosCreados.forEach((usuario: any) => {
      console.log(`   - ${usuario.nombre} (${usuario.username}) - ${usuario.correoElectronico}`);
    });

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    // Cerrar la conexión
    process.exit(0);
  }
};

// Ejecutar el seed si el archivo se ejecuta directamente
if (require.main === module) {
  seedUsuarios();
}

export default seedUsuarios;
