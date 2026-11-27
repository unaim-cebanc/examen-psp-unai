// Librerias
const express = require('express');
const pc = require('picocolors');
const fs = require('node:fs');
const http = require('http');
const path = require('path');

// Jsons + Paths
const compras = require('./BBDD/compras.json');
const pathCompras = path.join(__dirname, 'BBDD', 'compras.json');

const juegos = require('./BBDD/juegos.json');
const pathJuegos = path.join(__dirname, 'BBDD', 'juegos.json');

// Config servidor
const app = express();
const port = 4567;
const errorMsgNotFound = { error: 'Elemento no encontrado' };
const errorMsgConflict = { error: 'Operacion no se puede realizar por un conflicto' };
const confirmMsgDelete = { mensaje: 'Elemento eliminado correctamente' };
app.use(express.json());

// Fuciones
function juegoTieneCompras(juegoId) {
    const compra = compras.find(c => c.juegoId === juegoId);
    
    if (!compra) {
        return false;
    }
    
    if (compra.estado === 'Activa') {
        return true;
    }
    
    return false;
}

// Logger
app.use((req, res, next) => {
    res.on('finish', () => {
        const status = res.statusCode;
        const msgStatus = http.STATUS_CODES[status];
        const statusColor = status < 400 ? 
            pc.green(pc.bold(`${status} ${msgStatus}`)) : 
            pc.red(pc.bold(`${status} ${msgStatus}`));
        
        const metodo = pc.cyan(pc.bold(req.method));
        
        const url = pc.gray(pc.bold(req.url));
        
        console.log(`[${metodo}] ${url} --> ${statusColor}`)
    });
    next();
});

// --- --- Juegos --- ---

// --- Metodos GET ---
app.get('/api/juegos', (req, res) => {
    res.json(juegos);
});

app.get('/api/juegos/:id', (req, res) => {
    const id = Number(req.params.id);
    const juego = juegos.find(j => j.id === id);
    
    if (!juego) {
        return res.status(404).json(errorMsgNotFound);
    }
    
    res.json(juego);
});

// --- Metodos POST ---
app.post('/api/juegos', (req, res) => {
    const ultimoJuego = juegos.findLast(c => c.id != null);
    const id = ultimoJuego.id + 1;
    
    const nuevoJuego = {
        id: id,
        titulo: req.body.titulo,
        desarrollador: req.body.desarrollador,
        anio: req.body.anio,
        genero: req.body.genero, 
        precio: req.body.precio,
        retirado: false,
        copiasVendidas: 0
    };
    
    juegos.push(nuevoJuego);
    fs.writeFileSync(pathJuegos, JSON.stringify(juegos, null, 4));
    
    res.status(201).json(nuevoJuego);
});

// --- Metodos PUT ---
app.put('/api/juegos/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = juegos.findIndex(j => j.id === id);
    
    if (index === -1) {
        return res.status(404).json(errorMsgNotFound);
    }
    
    juegos[index] = {
        id: juegos[index].id,
        titulo: req.body.titulo || juegos[index].titulo,
        desarrollador: req.body.desarrollador || juegos[index].desarrollador,
        anio: req.body.anio || juegos[index].anio,
        genero: req.body.genero || juegos[index].genero,
        precio: req.body.precio || juegos[index].precio,
        retirado: juegos[index].retirado,
        copiasVendidas: juegos[index].copiasVendidas
    };
    
    fs.writeFileSync(pathJuegos, JSON.stringify(juegos, null, 4));
    res.json(juegos[index]);
});

// --- Metodos DELETE ---
app.delete('/api/juegos/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = juegos.findIndex(j => j.id === id);
    
    if (index === -1) {
        return res.status(404).json(errorMsgNotFound);
    }
    if (juegoTieneCompras(id)) {
        return res.status(409).json(errorMsgConflict);
    }
    
    juegos.splice(index, 1);
    fs.writeFileSync(pathJuegos, JSON.stringify(juegos, null, 4));
    
    res.json(confirmMsgDelete);
});

app.delete('/api/juegos/titulo/:titulo', (req, res) => {
    const titulo = String(req.params.titulo);
    const index = juegos.findIndex(j => j.titulo === titulo);
    
    if (index === -1) {
        return res.status(404).json(errorMsgNotFound);
    }
    const id = juegos[index].id;
    if (juegoTieneCompras(id)) {
        return res.status(409).json(errorMsgConflict);
    }
    
    juegos.splice(index, 1);
    fs.writeFileSync(pathJuegos, JSON.stringify(juegos, null, 4));
    res.json(confirmMsgDelete);
});

// --- --- Compras --- ---

// --- Metodos GET ---
app.get('/api/compras', (req, res) => {
    res.json(compras);
});

app.get('/api/compras/:titulo', (req, res) => {
    const titulo = String(req.params.titulo);
    const compra = compras.find(c => c.titulo === titulo);
    
    if (!titulo) {
        res.status(404).json(errorMsgNotFound);
    }
    
    res.json(compra);
});

// Listen server
app.listen(port, () => {
    console.log(pc.yellow(pc.bold(`Servidor escuhando en: ${port}`)));
});