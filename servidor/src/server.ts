import express from 'express';

const app = express();

app.get('/', (req, res) => {
    res.json('Bienvenido al servidor de MAGNETO Embeddable Tool');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));