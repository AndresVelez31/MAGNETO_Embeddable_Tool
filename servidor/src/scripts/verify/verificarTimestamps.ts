import connectDB from '../../config/database';
import { Respuesta } from '../../infrastructure/database/models/Respuesta';

(async () => {
  try {
    await connectDB();
    const respuestas = await Respuesta.find({}).limit(5);
    
    console.log('📊 Verificando timestamps:\n');
    respuestas.forEach((r, i) => {
      const diff = r.actualizadaEn.getTime() - r.creadaEn.getTime();
      const minutos = diff / 60000;
      console.log(`${i + 1}. Creada: ${r.creadaEn.toISOString()}`);
      console.log(`   Actualizada: ${r.actualizadaEn.toISOString()}`);
      console.log(`   Diferencia: ${minutos.toFixed(2)} minutos\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
