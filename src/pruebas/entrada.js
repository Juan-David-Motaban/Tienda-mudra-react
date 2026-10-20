// Punto de entrada de Karma: importa automáticamente todos los archivos de prueba (*.spec.js / *.spec.jsx).
const contexto = require.context("..", true, /\.spec\.jsx?$/);
contexto.keys().forEach(contexto);
