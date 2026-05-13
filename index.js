const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

// JSON
app.use(express.json());

// Cargar datos desde cities.json 
const data = JSON.parse(fs.readFileSync('./cities.json', 'utf-8'));

// Mostrar en consola los datos cargados
console.log(data);

//  documentación de la API
app.get('/', (req, res) => {
    res.json({
        status: 200,
        message: 'API de localidades de Buenos Aires',
        endpoints: {
            '/localidades': 'Lista completa de localidades',
            '/localidades?desde=6': 'Localidades desde el ID 6 en adelante',
            '/localidades?desde=6&hasta=10': 'Localidades del ID 6 al 10',
            '/localidades/:id': 'Localidad por ID (parámetro de ruta)',
            '/localidades/buscar?nombre=xxx': 'Buscar localidad por nombre (query)',
        },
    });
});

//  localidades o filtrar por rango de ID
app.get('/localidades', (req, res) => {
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

// Ruta para buscar localidad x nombre
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

// Ruta para obtener una localidad x ID
app.get('/localidades/:id', (req, res) => {
    const id = Number(req.params.id);
    const localidad = data.find((loc) => Number(loc.id) === id);

    if (!localidad) {
        return res.status(404).json({ status: 404, message: 'Recurso no encontrado' });
    }

    res.json({ status: 200, data: localidad });
});

//  rutas no definidas
app.use((req, res) => {
    res.status(404).json({ status: 404, message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
