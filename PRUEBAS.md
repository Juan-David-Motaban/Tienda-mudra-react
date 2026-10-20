# Pruebas unitarias – Tienda Mudra

Jasmine (framework de pruebas) + Karma (ejecutor en Chrome sin ventana) + Testing Library (render de componentes React).

## Cómo ejecutarlas
```bash
npm install        # la primera vez (instala Jasmine, Karma, webpack, Babel y Testing Library)
npm test           # ejecuta todas las pruebas una vez y genera la cobertura
npm run test:watch # las repite cada vez que guardas un archivo
```
Requiere Google Chrome instalado. Si Karma no lo encuentra, define la variable `CHROME_BIN` con la ruta de `chrome.exe`.

El informe de cobertura queda en `coverage/index.html` (ábrelo en el navegador) y un resumen sale en la consola.

## Qué se prueba (139 pruebas)
| Archivo | Qué comprueba |
|---|---|
| `lib/validaciones.spec.js` | RUN, correo, contraseña, fecha y validadores de formularios |
| `lib/almacen.spec.js` | Precios y ofertas, categorías, carrito, sesión y registro de órdenes (stock, pago rechazado, error de almacenamiento) |
| `lib/useFormulario.spec.jsx` | Estado del hook de formularios: valores, errores en vivo, `onBlur`, `validarTodo` |
| `components/Campo.spec.jsx` | Render, props (`col`, `completo`, `opcional`, `error`), clases de Bootstrap y eventos |
| `components/PrecioProducto.spec.jsx` | Render según props: precio normal o con oferta |
| `components/CatalogoGrid.spec.jsx` | Props (`limite`, `productos`, `vacio`), botones, vista rápida (estado y eventos) |
| `components/Header.spec.jsx` | Menú colapsable (estado), contador del carrito, sesión, buscador |
| `pages/Registro.spec.jsx` | Validación en vivo, comunas por región, envío y errores del contexto |
| `pages/Carrito.spec.jsx` | Totales, cambio de cantidades, eliminar, vaciar, ir al checkout |
| `context/TiendaContext.spec.jsx` | Integración del contexto: carrito, compra aprobada/rechazada, sesión, permisos y CRUD |

## Mocks usados
- **localStorage falso** (`testing/ayudas.jsx → instalarAlmacenFalso`): espías de Jasmine sobre `Storage.prototype` con un `Map`; las pruebas no tocan los datos reales.
- **Contexto simulado** (`tiendaFalsa`): todas las acciones son espías (`jasmine.createSpy`), para probar componentes sin el proveedor real.
- **Router en memoria** (`MemoryRouter`) para probar navegación sin cambiar la URL del navegador.
- **Error de almacenamiento lleno** simulado con `spy.and.callFake` para comprobar que el inventario se restaura.

## Estructura
- `karma.conf.cjs`: configuración de Karma (Jasmine, webpack + Babel, cobertura con Istanbul).
- `src/testing/indice.js`: reúne automáticamente todos los `*.spec.js(x)`.
- `src/testing/ayudas.jsx`: utilidades y mocks compartidos.
- Los `*.spec.js(x)` están junto al archivo que prueban.

## Error encontrado gracias a las pruebas
Al cambiar de región en los formularios, la comuna anterior seguía guardada en el estado (el cambio de región pisaba el reinicio de la comuna).
La prueba «al cambiar de región se reinicia la comuna elegida» lo detectó y se corrigió en `Registro`, `Checkout`, `FormUsuario` y `Perfil`.
