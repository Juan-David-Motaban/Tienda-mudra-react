# Tienda Mudra — versión React

Migración del proyecto HTML/CSS/JS (Evaluación 1, Desarrollo Full Stack) a **React 18 + Vite + React Router**.
El aspecto es el mismo (se reutilizan `estilo.css` y `admin.css`) y los datos se guardan en `localStorage`
con las **mismas claves** que la versión original.

## Ejecutar

```bash
npm install
npm run dev      # desarrollo → http://localhost:5173
npm run build    # compilación de producción en /dist
npm run preview  # probar la compilación
```

Cuentas de demostración (las mismas de antes): `admin@duoc.cl` / `Admin123` y `cliente@duoc.cl` / `Cliente1`.

## Equivalencias

| Original | React |
|---|---|
| `index.html` | `/` → `pages/Home.jsx` |
| `productos.html` | `/productos` → `pages/Productos.jsx` |
| `detalledelproducto.html?id=` | `/productos/:id` → `pages/DetalleProducto.jsx` |
| `nosotros.html`, `contacto.html` | `/nosotros`, `/contacto` |
| `blogs.html`, `detalleblog1/2.html` | `/blogs`, `/blogs/:slug` (datos en `pages/Blogs.jsx`) |
| `iniciosesion.html`, `registrousuario.html` | `/iniciosesion`, `/registro` |
| `carrito.html` | `/carrito` |
| `adminlogin.html` | `/admin/login` |
| `admin.html` (+ `?configurar=1`) | `/admin` (+ `/admin/configurar`) |
| `adminproductos / productonuevo / productoeditar / mostrarproducto` | `/admin/productos`, `/nuevo`, `/:id/editar`, `/:id` |
| `adminusuario / usuarionuevo / usuarioeditar / usuariomostrar` | `/admin/usuarios`, `/nuevo`, `/:run/editar`, `/:run` |
| `adminordenes / adminordendetalle` | `/admin/ordenes`, `/admin/ordenes/:id` |

| Original (JS) | React |
|---|---|
| `datos.js` | `src/data/datos.js` |
| `almacen.js`, parte de `autenticacion.js`, `carritoylogica.js` | `src/lib/almacen.js` + `src/context/TiendaContext.jsx` |
| `validaciones.js` + validaciones sueltas | `src/lib/validaciones.js` |
| `catalogo.js`, `producto-modal.js` | `components/CatalogoGrid.jsx` |
| `carritoylogica.js` (menú) | `components/Header.jsx` |
| `carrito-pagina.js` | `pages/Carrito.jsx` |
| `admin*.js` | `components/admin/*` y `pages/admin/*` |

## Cómo está organizado

- **`TiendaContext`** concentra productos, órdenes, usuarios, sesión y carrito, y los sincroniza entre pestañas
  (evento `storage`). Reemplaza los `document.dispatchEvent(...)` y los `innerHTML` de la versión original.
- **Layouts**: `TiendaLayout` (header + footer) y `AdminLayout` (sidebar, control de acceso por rol, diálogo de eliminación).
  Cada uno inyecta solo su CSS (`estilo.css` / `admin.css`) para que no se pisen entre sí.
- **Roles**: Administrador ve todo; Vendedor solo productos (lectura) y órdenes, igual que antes.

## Correcciones respecto al original

- Los enlaces de la tabla de productos y de órdenes del panel estaban mal formados (`<a href=ID"../html/...">`); ahora navegan bien.
- `admin-modelo.js` llamaba a `generarHashContrasena`, que no existe, y además **no guardaba la contraseña**:
  crear o editar un usuario desde el panel fallaba o lo dejaba sin clave. Ahora se guarda, y al editar sin escribir
  una nueva se conserva la actual.
- `estilo.css` tenía un comentario HTML (`<!-- -->`) dentro de una declaración CSS; se eliminó.
- La comuna se reinicia al cambiar de región en el registro.

## Evaluación 2: vistas y funciones añadidas

**Tienda**
| Ruta | Qué hace |
|---|---|
| `/categorias`, `/categorias/:id` | Tarjetas de categorías y productos agrupados; una categoría por separado. |
| `/ofertas` | Productos con precio de oferta. |
| `/productos` | Ahora con búsqueda, filtro por categoría y orden (los filtros quedan en la URL). El buscador del header lleva aquí. |
| `/carrito` | Cantidades editables (+/−), eliminar, limpiar. Se puede comprar como invitado. |
| `/checkout` | Datos del cliente y dirección de entrega (se rellenan solos si hay sesión). Pago **simulado**: eliges "aprobado" o "rechazado". |
| `/compra/exitosa/:id` | Resumen y boleta; imprimir (PDF desde el navegador) y envío por email simulado. |
| `/compra/error/:id` | Pago rechazado, con "Volver a realizar el pago" (conserva los datos y el carrito). |

**Administración**
| Ruta | Qué hace |
|---|---|
| `/admin` | Resumen con productos, unidades, stock bajo, órdenes, ventas y usuarios. |
| `/admin/categorias` (+ `/nueva`, `/:id/editar`) | CRUD de categorías. No deja eliminar una categoría con productos; al renombrarla actualiza sus productos. |
| `/admin/productos/criticos` | Productos agotados o bajo su stock crítico. |
| `/admin/reportes` | Ventas totales, por categoría y por producto, e inventario crítico. |
| `/admin/perfil` | Cada usuario edita sus datos y contraseña. |
| `/admin/ordenes/:id` | Boleta imprimible. |
| `/admin/usuarios/:run` | Historial de compras del usuario (por correo). |

Los productos tienen un campo nuevo, **precio de oferta** (opcional, debe ser menor al precio normal).
Una orden con pago rechazado se guarda como "Pago rechazado" y no descuenta stock.