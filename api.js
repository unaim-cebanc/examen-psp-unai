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
app.use(express.json());

app.use((req, res, next) => {
    res.on('finish', () => {
        const status = res.statusCode;
        const msgStatus = http.STATUS_CODES[status];
        const statusColor = status < 400 ? 
            pc.green(pc.bold(`${status} ${msgStatus}`)) : 
            pc.red(pc.bold(`${status} ${msgStatus}`));
        
        const metodo = req.method;
        
        const url = req.url;
        
        console.log(`[${metodo}] ${url} --> ${statusColor}`)
    });
    next();
});


