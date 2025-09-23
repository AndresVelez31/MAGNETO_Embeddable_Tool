import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        // URL de conexión local de MongoDB (cambia esto por tu URL)
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/magneto_embeddable_tool';
        
        await mongoose.connect(mongoURI);
        
        console.log('✅ MongoDB conectado exitosamente');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

// Manejar eventos de conexión
mongoose.connection.on('disconnected', () => {
    console.log('📡 MongoDB desconectado');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ Error en la conexión de MongoDB:', error);
});

export default connectDB;