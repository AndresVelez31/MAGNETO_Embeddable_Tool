import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/database';
import encuestasRoutes from './routes/encuestas';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
    res.json('Bienvenido al servidor de MAGNETO Embeddable Tool');
});

app.use('/api/encuestas', encuestasRoutes);

connectDB().catch((e) => {
  console.error('❌ Error conectando a MongoDB', e);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));