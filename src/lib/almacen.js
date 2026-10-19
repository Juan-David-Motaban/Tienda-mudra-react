// Capa de persistencia sobre localStorage. Usa las mismas claves que la versión
// HTML/JS original, por lo que los datos ya guardados siguen funcionando.
import { productosIniciales } from "../data/datos";

export const CLAVE_PRODUCTOS = "mudraProductos";
export const CLAVE_ORDENES = "mudraOrdenes";
export const CLAVE_CARRITO = "carrito";
export const CLAVE_USUARIOS = "usuariosRegistrados";
export const CLAVE_SESION = "sesionUsuario";
export const CLAVE_CUENTAS_DEMO = "mudraCuentasDemoV2";
export const CLAVE_MENSAJES_CONTACTO = "mudraMensajesContacto";

export const CUENTAS_DEMOSTRACION = [
  {
    run: "123456785", nombre: "Administrador", apellidos: "Demo", correo: "admin@duoc.cl",
    fechaNacimiento: "1990-01-01", rol: "Administrador", region: "Región Metropolitana",
    comuna: "Santiago", direccion: "Avenida Demo 123", contrasena: "Admin123"
  },
  {
    run: "111111111", nombre: "Cliente", apellidos: "Demo", correo: "cliente@duoc.cl",
    fechaNacimiento: "1995-01-01", rol: "Cliente", region: "Región Metropolitana",
    comuna: "Santiago", direccion: "Avenida Demo 456", contrasena: "Cliente1"
  }
];

function leerColeccion(clave, iniciales = []) {
  const contenido = localStorage.getItem(clave);
  if (contenido === null) return iniciales.map((item) => ({ ...item }));
  const datos = JSON.parse(contenido);
  if (!Array.isArray(datos)) throw new Error("Los datos guardados no tienen un formato válido.");
  return datos;
}

/* ---------- Productos ---------- */
export function obtenerProductos() {
  try {
    return leerColeccion(CLAVE_PRODUCTOS, productosIniciales);
  } catch {
    return productosIniciales.map((p) => ({ ...p }));
  }
}

export function guardarProductos(productos) {
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
}

/* ---------- Órdenes ---------- */
export function obtenerOrdenes() {
  try {
    return leerColeccion(CLAVE_ORDENES);
  } catch {
    return [];
  }
}

export function registrarOrden(cliente, carrito) {
  const productos = obtenerProductos();
  if (!carrito.length) throw new Error("El carrito está vacío.");
  const cantidades = new Map();
  carrito.forEach((item) => {
    if (!Number.isSafeInteger(item.cant) || item.cant < 1) throw new Error("Revisa las cantidades del carrito.");
    cantidades.set(item.id, (cantidades.get(item.id) || 0) + item.cant);
  });
  const items = [...cantidades].map(([id, cant]) => {
    const producto = productos.find((actual) => actual.id === id);
    if (!producto || cant > producto.stock) {
      throw new Error(`Revisa la disponibilidad de ${producto?.nombre || id}.`);
    }
    return { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: cant, img: producto.img };
  });
  const orden = {
    id: `MUD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    fecha: new Date().toISOString(),
    estado: "Registrada",
    cliente: {
      nombre: cliente.nombre, apellidos: cliente.apellidos, correo: cliente.correo,
      direccion: cliente.direccion, comuna: cliente.comuna, region: cliente.region
    },
    items,
    total: items.reduce((total, item) => total + item.precio * item.cantidad, 0)
  };
  if (!Number.isFinite(orden.total)) throw new Error("El total de la compra excede el límite numérico.");

  // Se conserva el inventario anterior para recuperar una escritura incompleta.
  const inventarioAnterior = localStorage.getItem(CLAVE_PRODUCTOS);
  productos.forEach((producto) => {
    producto.stock -= items.filter((item) => item.id === producto.id).reduce((t, item) => t + item.cantidad, 0);
  });
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
  try {
    localStorage.setItem(CLAVE_ORDENES, JSON.stringify([orden, ...obtenerOrdenes()]));
  } catch (error) {
    if (inventarioAnterior === null) localStorage.removeItem(CLAVE_PRODUCTOS);
    else localStorage.setItem(CLAVE_PRODUCTOS, inventarioAnterior);
    throw error;
  }
  return orden;
}

/* ---------- Usuarios ---------- */
function instalarCuentasDemostracion(usuarios) {
  if (localStorage.getItem(CLAVE_CUENTAS_DEMO) === "1") return usuarios;
  const nuevas = CUENTAS_DEMOSTRACION.filter((cuenta) => !usuarios.some((u) =>
    u.run === cuenta.run || u.correo?.toLowerCase() === cuenta.correo));
  const cuentas = [...usuarios, ...nuevas];
  try {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(cuentas));
    localStorage.setItem(CLAVE_CUENTAS_DEMO, "1");
  } catch {
    // Si el navegador bloquea el almacenamiento, las cuentas siguen disponibles en esta carga.
  }
  return cuentas;
}

export function obtenerUsuarios() {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIOS);
    const usuarios = guardado === null ? [] : JSON.parse(guardado);
    return Array.isArray(usuarios) ? instalarCuentasDemostracion(usuarios) : [];
  } catch {
    return [];
  }
}

export function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
  localStorage.setItem(CLAVE_CUENTAS_DEMO, "1");
}

/* ---------- Sesión ---------- */
export function obtenerSesion() {
  try {
    const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
    if (!sesion || typeof sesion.correo !== "string") return null;
    const usuario = obtenerUsuarios().find((item) => (sesion.run ? item.run === sesion.run : item.correo === sesion.correo));
    if (!usuario) return null;
    // eslint-disable-next-line no-unused-vars
    const { contrasena, ...datos } = usuario;
    return { ...datos, rol: usuario.rol || "Cliente" };
  } catch {
    return null;
  }
}

export function guardarSesion(usuario) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify({
    run: usuario.run, rol: usuario.rol || "Cliente", nombre: usuario.nombre, apellidos: usuario.apellidos,
    correo: usuario.correo, region: usuario.region, comuna: usuario.comuna, direccion: usuario.direccion
  }));
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}

/* ---------- Carrito ---------- */
export function obtenerCarrito() {
  try {
    const carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    if (!Array.isArray(carrito)) return [];
    return carrito
      .filter((item) => item && typeof item.id === "string" && Number(item.cant) > 0)
      .map((item) => ({ id: item.id, cant: Number.parseInt(item.cant, 10) }));
  } catch {
    return [];
  }
}

export function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

/* ---------- Mensajes de contacto ---------- */
export function obtenerMensajesContacto() {
  try {
    const mensajes = JSON.parse(localStorage.getItem(CLAVE_MENSAJES_CONTACTO));
    return Array.isArray(mensajes) ? mensajes : [];
  } catch {
    return [];
  }
}

export function guardarMensajeContacto(mensaje) {
  localStorage.setItem(CLAVE_MENSAJES_CONTACTO, JSON.stringify([mensaje, ...obtenerMensajesContacto()]));
}

/* ---------- Utilidades ---------- */
export function imagenProductoSegura(valor) {
  if (!valor) return "";
  if (/^data:image\/(png|jpeg|webp|gif);base64,/i.test(valor)) return valor;
  try {
    const url = new URL(valor, window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export function formatearPrecio(valor) {
  return Number(valor).toLocaleString("es-CL");
}
