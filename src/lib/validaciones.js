import { regionesData } from "../data/datos";
import { imagenProductoSegura } from "./almacen";

export const MSG_CORREO = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";

export function validarRUN(run) {
  if (!/^[0-9]{6,8}[0-9kK]{1}$/.test(run)) return false;
  const cuerpo = run.slice(0, -1);
  const dv = run.slice(-1).toUpperCase();
  let suma = 0;
  let mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += mul * parseInt(cuerpo.charAt(i), 10);
    mul = mul < 7 ? mul + 1 : 2;
  }
  let esperado = 11 - (suma % 11);
  if (esperado === 11) esperado = "0";
  else if (esperado === 10) esperado = "K";
  else esperado = esperado.toString();
  return dv === esperado;
}

export function validarCorreo(correo) {
  return correo.length <= 100 && /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/.test(correo);
}

export function validarTextoObligatorio(valor, maximo) {
  return valor.trim().length > 0 && valor.trim().length <= maximo;
}

export function validarFechaNacimiento(fecha) {
  if (!fecha) return true;
  const ingresada = new Date(`${fecha}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return !Number.isNaN(ingresada.getTime()) && ingresada <= hoy;
}

export function validarContrasena(valor) {
  return valor.length >= 4 && valor.length <= 10;
}

/* Cada validador devuelve un objeto { campo: mensaje } solo con los campos inválidos. */

export function erroresRegistro(d) {
  const e = {};
  if (!validarRUN(d.run.trim().toUpperCase())) e.run = "Ingresa un RUN válido, sin puntos ni guión.";
  if (!validarTextoObligatorio(d.nombre, 50)) e.nombre = "El nombre es obligatorio y admite hasta 50 caracteres.";
  if (!validarTextoObligatorio(d.apellidos, 100)) e.apellidos = "Los apellidos son obligatorios y admiten hasta 100 caracteres.";
  if (!validarCorreo(d.correo.trim().toLowerCase())) e.correo = MSG_CORREO;
  if (!validarContrasena(d.contrasena)) e.contrasena = "La contraseña debe tener entre 4 y 10 caracteres.";
  if (!validarFechaNacimiento(d.fechaNacimiento)) e.fechaNacimiento = "La fecha de nacimiento no puede ser futura.";
  if (!d.region) e.region = "Selecciona una región.";
  if (!d.comuna) e.comuna = "Selecciona una comuna.";
  if (!validarTextoObligatorio(d.direccion, 300)) e.direccion = "La dirección es obligatoria y admite hasta 300 caracteres.";
  return e;
}

export function erroresLogin(d) {
  const e = {};
  if (!validarCorreo(d.correo.trim().toLowerCase())) e.correo = MSG_CORREO;
  if (!validarContrasena(d.contrasena)) e.contrasena = "La contraseña debe tener entre 4 y 10 caracteres.";
  return e;
}

export function erroresContacto(d) {
  const e = {};
  if (!validarTextoObligatorio(d.nombre, 100)) e.nombre = "El nombre es obligatorio y admite hasta 100 caracteres.";
  if (!validarCorreo(d.correo.trim().toLowerCase())) e.correo = MSG_CORREO;
  if (!validarTextoObligatorio(d.comentario, 500)) e.comentario = "El comentario es obligatorio y admite hasta 500 caracteres.";
  return e;
}

export function erroresProducto(d, productos, categorias, idActual = null) {
  const e = {};
  if (d.id.trim().length < 3) e.id = "Escribe un código de al menos 3 caracteres.";
  else if (productos.some((p) => p.id.toUpperCase() === d.id.trim().toUpperCase() && p.id !== idActual)) e.id = "Este código ya está registrado.";
  if (!d.nombre.trim() || d.nombre.trim().length > 100) e.nombre = "Ingresa un nombre de hasta 100 caracteres.";
  if (d.descripcion.length > 500) e.descripcion = "La descripción admite hasta 500 caracteres.";
  if (!categorias.includes(d.categoria)) e.categoria = "Selecciona una categoría.";
  if (d.precio === "" || !Number.isFinite(Number(d.precio)) || Number(d.precio) < 0) e.precio = "Ingresa un precio igual o mayor que 0.";
  if (d.stock === "" || !Number.isSafeInteger(Number(d.stock)) || Number(d.stock) < 0) e.stock = "El stock debe ser un número entero igual o mayor que 0.";
  if (d.stockCritico !== "" && (!Number.isSafeInteger(Number(d.stockCritico)) || Number(d.stockCritico) < 0)) e.stockCritico = "Ingresa un entero igual o mayor que 0, o deja el campo vacío.";
  if (d.precioOferta !== "" && d.precioOferta !== undefined) {
    const oferta = Number(d.precioOferta);
    if (!Number.isFinite(oferta) || oferta < 0) e.precioOferta = "Ingresa un precio de oferta igual o mayor que 0, o deja el campo vacío.";
    else if (Number.isFinite(Number(d.precio)) && oferta >= Number(d.precio)) e.precioOferta = "La oferta debe ser menor que el precio normal.";
  }
  if (d.img && !imagenProductoSegura(d.img)) e.img = "Usa una dirección de imagen HTTP o HTTPS válida.";
  return e;
}

export function erroresUsuario(d, usuarios, { runActual = null, sesionRun = null, inicial = false } = {}) {
  const e = {};
  const run = d.run.trim().toUpperCase();
  if (!validarRUN(run)) e.run = "Ingresa un RUN válido de 7 a 9 caracteres, sin puntos ni guion.";
  else if (usuarios.some((u) => u.run === run && u.run !== runActual)) e.run = "Este RUN ya está registrado.";
  if (!d.nombre.trim() || d.nombre.trim().length > 50) e.nombre = "Ingresa un nombre de hasta 50 caracteres.";
  if (!d.apellidos.trim() || d.apellidos.trim().length > 100) e.apellidos = "Ingresa apellidos de hasta 100 caracteres.";
  if (!validarCorreo(d.correo.trim().toLowerCase())) e.correo = "Usa un correo @duoc.cl, @profesor.duoc.cl o @gmail.com de hasta 100 caracteres.";
  else if (usuarios.some((u) => u.correo.toLowerCase() === d.correo.trim().toLowerCase() && u.run !== runActual)) e.correo = "Este correo ya está registrado.";
  if ((!runActual || d.contrasena) && !validarContrasena(d.contrasena)) e.contrasena = "La contraseña debe tener entre 4 y 10 caracteres.";
  if (!validarFechaNacimiento(d.fechaNacimiento)) e.fechaNacimiento = "Ingresa una fecha válida que no sea futura.";
  if (!["Administrador", "Vendedor", "Cliente"].includes(d.rol)) e.rol = "Selecciona un tipo de usuario.";
  const region = regionesData.find((r) => r.region === d.region);
  if (!region) e.region = "Selecciona una región.";
  if (!region?.comunas.includes(d.comuna)) e.comuna = "Selecciona una comuna de la región.";
  if (!d.direccion.trim() || d.direccion.trim().length > 300) e.direccion = "Ingresa una dirección de hasta 300 caracteres.";
  if (!inicial && runActual && sesionRun === runActual && d.rol !== "Administrador") e.rol = "Conserva el rol administrador de tu propia cuenta.";
  return e;
}

export function erroresCategoria(d, categorias, idActual = null) {
  const e = {};
  const nombre = d.nombre.trim();
  if (!nombre || nombre.length > 40) e.nombre = "Ingresa un nombre de hasta 40 caracteres.";
  else if (categorias.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== idActual)) e.nombre = "Ya existe una categoría con este nombre.";
  return e;
}

/** Datos de entrega y contacto del checkout. */
export function erroresCheckout(d) {
  const e = {};
  if (!validarTextoObligatorio(d.nombre, 50)) e.nombre = "El nombre es obligatorio y admite hasta 50 caracteres.";
  if (!validarTextoObligatorio(d.apellidos, 100)) e.apellidos = "Los apellidos son obligatorios y admiten hasta 100 caracteres.";
  if (!validarCorreo(d.correo.trim().toLowerCase())) e.correo = MSG_CORREO;
  if (!validarTextoObligatorio(d.calle, 200)) e.calle = "La calle es obligatoria y admite hasta 200 caracteres.";
  if (d.departamento.length > 30) e.departamento = "El departamento admite hasta 30 caracteres.";
  if (!d.region) e.region = "Selecciona una región.";
  if (!d.comuna) e.comuna = "Selecciona una comuna.";
  if (d.indicaciones.length > 300) e.indicaciones = "Las indicaciones admiten hasta 300 caracteres.";
  return e;
}

/** Edición del propio perfil (sin RUN, correo ni rol). */
export function erroresPerfil(d) {
  const e = {};
  if (!validarTextoObligatorio(d.nombre, 50)) e.nombre = "Ingresa un nombre de hasta 50 caracteres.";
  if (!validarTextoObligatorio(d.apellidos, 100)) e.apellidos = "Ingresa apellidos de hasta 100 caracteres.";
  if (!validarFechaNacimiento(d.fechaNacimiento)) e.fechaNacimiento = "Ingresa una fecha válida que no sea futura.";
  if (d.contrasena && !validarContrasena(d.contrasena)) e.contrasena = "La contraseña debe tener entre 4 y 10 caracteres.";
  const region = regionesData.find((r) => r.region === d.region);
  if (!region) e.region = "Selecciona una región.";
  if (!region?.comunas.includes(d.comuna)) e.comuna = "Selecciona una comuna de la región.";
  if (!validarTextoObligatorio(d.direccion, 300)) e.direccion = "La dirección es obligatoria y admite hasta 300 caracteres.";
  return e;
}