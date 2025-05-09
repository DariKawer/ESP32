const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Configuración básica
app.use(cors());
app.use(express.json());

// Datos de eventos
let eventos = [];

// Cargar eventos guardados
function cargarEventos() {
  try {
    const filePath = path.join(__dirname, 'eventos.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      eventos = JSON.parse(data);
      console.log(`Eventos cargados: ${eventos.length}`);
    }
  } catch (error) {
    console.log('Error al cargar eventos:', error.message);
  }
}

// Servir archivos estáticos permitidos
app.get('/chart.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chart.html'));
});

app.get('/events.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

// Bloquear acceso a index.html
app.get('/index.html', (req, res) => {
  res.status(403).send('Acceso denegado: Este servidor solo permite acceso a chart.html y events.html');
});

// Rutas GET
app.get('/api/eventos', (req, res) => {
  cargarEventos(); // Reload eventos.json
  const limit = Number(req.query.limit) || 10;
  const eventosRecientes = eventos.slice(-limit).reverse();

  res.json({
    total: eventos.length,
    eventos: eventosRecientes
  });
});

app.get('/api/status', (req, res) => {
  cargarEventos(); // Reload eventos.json
  res.json({
    status: 'ok',
    eventos: eventos.length,
    ultimoEvento: eventos.length > 0 ? eventos[eventos.length - 1].timestamp : 'Ninguno'
  });
});

app.get('/api/max-contador', (req, res) => {
  cargarEventos(); // Reload eventos.json
  if (eventos.length === 0) {
    return res.json({ maxContador: 0 });
  }
  
  const maxContador = Math.max(...eventos.map(evento => evento.contador || 0));
  res.json({ maxContador });
});

// Redirigir raíz a events.html
app.get('/', (req, res) => {
  res.redirect('/events.html');
});

// Manejar rutas no permitidas
app.use((req, res) => {
  res.status(404).send('Recurso no encontrado');
});

// Iniciar servidor
cargarEventos();
app.listen(PORT, () => {
  console.log(`Servidor GET listo en http://localhost:${PORT}`);
});