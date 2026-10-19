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
