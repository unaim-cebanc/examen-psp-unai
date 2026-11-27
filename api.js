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

app.use(express.json());

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
    const id = req.params.id;
    const juego = juegos.find(j => j.id === id);
    
    if (!juego) {
        return res.status(404).json(errorMsgNotFound);
    }
    
    res.json(juego);
});

// Listen server
app.listen(port, () => {
    console.log(pc.yellow(pc.bold(`Servidor escuhando en: ${port}`)));
});