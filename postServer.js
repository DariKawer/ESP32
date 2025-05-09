const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Configuración básica
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

// Guardar eventos
function guardarEventos() {
  try {
    const filePath = path.join(__dirname, 'eventos.json');
    fs.writeFileSync(filePath, JSON.stringify(eventos, null, 2));
  } catch (error) {
    console.log('Error al guardar eventos:', error.message);
  }
}

// Servir archivos estáticos permitidos
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

// Bloquear acceso a chart.html y events.html
app.get(['/chart.html', '/events.html'], (req, res) => {
  res.status(403).send('Acceso denegado: Este servidor solo permite acceso a index.html');
});

// Ruta POST
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

// Redirigir raíz a index.html
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// Manejar rutas no permitidas
app.use((req, res) => {
  res.status(404).send('Recurso no encontrado');
});

// Iniciar servidor
cargarEventos();
app.listen(PORT, () => {
  console.log(`Servidor POST listo en http://localhost:${PORT}`);
});