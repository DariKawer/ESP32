const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Configuración básica
app.use(express.json());
app.use(express.static('public')); // Para servir archivos estáticos

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

// Guardar eventos
function guardarEventos() {
  try {
    const filePath = path.join(__dirname, 'eventos.json');
    fs.writeFileSync(filePath, JSON.stringify(eventos, null, 2));
  } catch (error) {
    console.log('Error al guardar eventos:', error.message);
  }
}

// Rutas
app.post('/api/evento', (req, res) => {
  const { boton } = req.body;

  if (!boton) {
    return res.status(400).json({ error: 'Falta el ID del botón' });
  }

  const nuevoEvento = {
    ...req.body,
    timestamp: new Date().toISOString()
  };

  eventos.push(nuevoEvento);
  guardarEventos();

  res.json({
    mensaje: 'Evento guardado',
    evento: nuevoEvento
  });
});

app.get('/api/eventos', (req, res) => {
  
  const limit = Number(req.query.limit) || 10;
  const eventosRecientes = eventos.slice(-limit).reverse();

  res.json({
    total: eventos.length,
    eventos: eventosRecientes
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    eventos: eventos.length,
    ultimoEvento: eventos.length > 0 ? eventos[eventos.length - 1].timestamp : 'Ninguno'
  });
});

app.get('/api/max-contador', (req, res) => {
  if (eventos.length === 0) {
    return res.json({ maxContador: 0 });
  }
  
  const maxContador = Math.max(...eventos.map(evento => evento.contador || 0));
  res.json({ maxContador });
});

// Iniciar servidor
cargarEventos();
app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});