import express from 'express';
import 'dotenv/config';
import connectDB from './config/database';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json('Bienvenido al servidor de MAGNETO Embeddable Tool');
});

connectDB().catch((e) => {
  console.error('❌ Error conectando a MongoDB', e);
  process.exit(1);
});

app.get('/', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));