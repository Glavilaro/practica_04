const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

// JSON
app.use(express.json());

// cities.json 
const data = JSON.parse(fs.readFileSync('./cities.json', 'utf-8'));

console.log(data);

// 
app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'API de localidades de Buenos Aires',
        endpoints: {
            "Todas las localidades": "/localidades",
            "Localidades desde un ID": "/localidades?desde=6",
            "Localidades en rango": "/localidades?desde=6&hasta=10",
            "Localidad por ID": "/localidades/:id",
            "Buscar por nombre": "/localidades/buscar?nombre=xxx"
        }
    });
});

// filtrar por rango de ID
app.get('/localidades', (req, res) => {
    if (data.length === 0) {
        return res.status(404).json({
            status: 404,
            message: 'No hay localidades cargadas',
            data: []
        });
    }

    const desde = req.query.desde ? Number(req.query.desde) : null;
    const hasta = req.query.hasta ? Number(req.query.hasta) : null;

    if ((req.query.desde && Number.isNaN(desde)) || (req.query.hasta && Number.isNaN(hasta))) {
        return res.status(400).json({ status: 400, message: 'Los parámetros desde y hasta deben ser números válidos' });
    }

    let resultado = data;
    if (desde !== null) resultado = resultado.filter((loc) => Number(loc.id) >= desde);
    if (hasta !== null) resultado = resultado.filter((loc) => Number(loc.id) <= hasta);

    res.json({ status: 200, total: resultado.length, data: resultado });
});

// localidad por nombre
app.get('/localidades/buscar', (req, res) => {
    const nombre = req.query.nombre?.toLowerCase();
    if (!nombre) {
        return res.status(400).json({ status: 400, message: 'Debe ingresar un nombre' });
    }

    const resultado = data.filter((loc) => loc.nombre.toLowerCase().includes(nombre));

    if (resultado.length === 0) {
        return res.status(404).json({ status: 404, message: 'Localidad no encontrada' });
    }

    res.json({ status: 200, total: resultado.length, data: resultado });
});

// Ruta de localidad por ID
app.get('/localidades/:id', (req, res) => {
    const id = Number(req.params.id);
    const localidad = data.find((loc) => Number(loc.id) === id);

    if (!localidad) {
        return res.status(404).json({ status: 404, message: 'Recurso no encontrado' });
    }

    res.json({ status: 200, data: localidad });
});

app.use((req, res) => {
    res.status(404).json({ status: 404, message: 'Ruta no encontrada' });
});

// Iniciar serv
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
