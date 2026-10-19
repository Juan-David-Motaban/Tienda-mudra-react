import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as db from "../lib/almacen";
import { erroresCategoria, erroresPerfil, erroresProducto, erroresUsuario } from "../lib/validaciones";

const TiendaContext = createContext(null);

export function useTienda() {
  const ctx = useContext(TiendaContext);
  if (!ctx) throw new Error("useTienda debe usarse dentro de <TiendaProvider>.");
  return ctx;
}

const leerTodo = () => ({
  productos: db.obtenerProductos(),
  categorias: db.obtenerCategorias(),
  ordenes: db.obtenerOrdenes(),
  usuarios: db.obtenerUsuarios(),
  sesion: db.obtenerSesion(),
  carrito: db.obtenerCarrito()
});

const CLAVES_OBSERVADAS = [
  db.CLAVE_PRODUCTOS, db.CLAVE_CATEGORIAS, db.CLAVE_ORDENES, db.CLAVE_USUARIOS, db.CLAVE_SESION, db.CLAVE_CARRITO
];

export function TiendaProvider({ children }) {
  const [datos, setDatos] = useState(leerTodo);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState("");

  const sincronizar = useCallback(() => setDatos(leerTodo()), []);

  // Sincroniza entre pestañas (equivale al evento "storage" de la versión original).
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key === null || CLAVES_OBSERVADAS.includes(e.key)) sincronizar();
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, [sincronizar]);

  const { productos, categorias, ordenes, usuarios, sesion, carrito } = datos;

  /* ---------- Carrito ---------- */
  const resumenCarrito = useMemo(() => carrito
      .map((item) => {
        const producto = productos.find((p) => p.id === item.id);
        return producto ? { ...item, producto } : null;
      })
      .filter(Boolean), [carrito, productos]);

  const totalItems = carrito.reduce((t, i) => t + i.cant, 0);
  const totalCarrito = resumenCarrito.reduce((t, i) => t + db.precioFinal(i.producto) * i.cant, 0);

  const agregarAlCarrito = useCallback((idProducto, cantidad = 1) => {
    const producto = productos.find((p) => p.id === idProducto);
    const unidades = Number(cantidad);
    if (!producto || !Number.isSafeInteger(unidades) || unidades < 1) {
      setMensajeCarrito("Selecciona un producto disponible y una cantidad entera mayor que cero.");
      setCarritoAbierto(true);
      return false;
    }
    const actual = db.obtenerCarrito();
    const existente = actual.find((i) => i.id === idProducto);
    if (unidades + (existente?.cant || 0) > producto.stock) {
      setMensajeCarrito(`Stock disponible de ${producto.nombre}: ${producto.stock} unidades.`);
      setCarritoAbierto(true);
      return false;
    }
    if (existente) existente.cant += unidades;
    else actual.push({ id: idProducto, cant: unidades });
    db.guardarCarrito(actual);
    setMensajeCarrito("");
    setCarritoAbierto(true);
    sincronizar();
    return true;
  }, [productos, sincronizar]);

  const quitarDelCarrito = useCallback((idProducto) => {
    db.guardarCarrito(db.obtenerCarrito().filter((i) => i.id !== idProducto));
    sincronizar();
  }, [sincronizar]);

  /** Cambia la cantidad de un producto del carrito (respetando el stock disponible). */
  const cambiarCantidad = useCallback((idProducto, cantidad) => {
    const producto = db.obtenerProductos().find((p) => p.id === idProducto);
    const unidades = Math.floor(Number(cantidad));
    if (!producto || !Number.isSafeInteger(unidades)) return { ok: false };
    if (unidades < 1) {
      db.guardarCarrito(db.obtenerCarrito().filter((i) => i.id !== idProducto));
      sincronizar();
      return { ok: true };
    }
    if (unidades > producto.stock) return { ok: false, mensaje: `Stock disponible de ${producto.nombre}: ${producto.stock} unidades.` };
    db.guardarCarrito(db.obtenerCarrito().map((i) => (i.id === idProducto ? { ...i, cant: unidades } : i)));
    sincronizar();
    return { ok: true };
  }, [sincronizar]);

  const vaciarCarrito = useCallback(() => {
    db.guardarCarrito([]);
    sincronizar();
  }, [sincronizar]);

  /** Registra la compra con los datos del checkout. `exito=false` simula un pago rechazado:
   *  se guarda la orden como "Pago rechazado", no se descuenta stock y el carrito se conserva. */
  const finalizarCompra = useCallback((datosCheckout, exito = true) => {
    const orden = db.registrarOrden(datosCheckout, db.obtenerCarrito(), exito);
    if (exito) db.guardarCarrito([]);
    sincronizar();
    return orden;
  }, [sincronizar]);

  /* ---------- Sesión ---------- */
  const iniciarSesion = useCallback((correo, contrasena, soloAdministracion = false) => {
    const usuario = db.obtenerUsuarios().find((u) => u.correo === correo.trim().toLowerCase());
    if (!usuario || usuario.contrasena !== contrasena) {
      return { error: "El correo o la contraseña no coinciden con una cuenta registrada." };
    }
    if (soloAdministracion && !["Administrador", "Vendedor"].includes(usuario.rol)) {
      return { error: "Esta cuenta no tiene acceso administrativo. Ingresa desde el inicio de sesión de la tienda." };
    }
    db.guardarSesion(usuario);
    sincronizar();
    return { usuario };
  }, [sincronizar]);

  const cerrarSesion = useCallback(() => {
    db.borrarSesion();
    sincronizar();
  }, [sincronizar]);

  const registrarCliente = useCallback((d) => {
    const lista = db.obtenerUsuarios();
    const correo = d.correo.trim().toLowerCase();
    const run = d.run.trim().toUpperCase();
    const errores = {};
    if (lista.some((u) => u.correo === correo)) errores.correo = "Ya existe una cuenta con este correo.";
    if (lista.some((u) => u.run === run)) errores.run = "Ya existe una cuenta con este RUN.";
    if (Object.keys(errores).length) return { errores };
    db.guardarUsuarios([...lista, {
      run, nombre: d.nombre.trim(), apellidos: d.apellidos.trim(), correo,
      contrasena: d.contrasena, fechaNacimiento: d.fechaNacimiento,
      region: d.region, comuna: d.comuna, direccion: d.direccion.trim(), rol: "Cliente"
    }]);
    sincronizar();
    return { ok: true };
  }, [sincronizar]);

  /* ---------- Administración ---------- */
  const esAdministrador = sesion?.rol === "Administrador";
  const hayAdministrador = usuarios.some((u) => u.rol === "Administrador");

  const exigirAdministrador = () => {
    if (db.obtenerSesion()?.rol !== "Administrador") throw new Error("Tu cuenta no tiene permiso para realizar esta operación.");
  };

  const guardarProducto = useCallback((d, idActual = null) => {
    exigirAdministrador();
    const lista = db.obtenerProductos();
    const errores = erroresProducto(d, lista, db.obtenerCategorias().map((c) => c.nombre), idActual);
    if (Object.keys(errores).length) return { errores };
    const indice = lista.findIndex((p) => p.id === idActual);
    if (idActual && indice < 0) throw new Error("El producto ya no existe.");
    const producto = {
      id: idActual || d.id.trim().toUpperCase(), nombre: d.nombre.trim(),
      descripcion: d.descripcion.trim(), categoria: d.categoria,
      precio: Number(d.precio),
      precioOferta: d.precioOferta === "" || d.precioOferta == null ? null : Number(d.precioOferta),
      stock: Number(d.stock),
      stockCritico: d.stockCritico === "" ? null : Number(d.stockCritico),
      material: d.material.trim(), img: db.imagenProductoSegura(d.img.trim())
    };
    if (indice < 0) lista.push(producto);
    else lista[indice] = producto;
    db.guardarProductos(lista);
    sincronizar();
    return { producto };
  }, [sincronizar]);

  const eliminarProducto = useCallback((id) => {
    exigirAdministrador();
    db.guardarProductos(db.obtenerProductos().filter((p) => p.id !== id));
    sincronizar();
  }, [sincronizar]);

  const guardarUsuario = useCallback((d, runActual = null, inicial = false) => {
    if (inicial) {
      if (db.obtenerUsuarios().some((u) => u.rol === "Administrador")) {
        throw new Error("La administración ya está configurada. Inicia sesión.");
      }
      d = { ...d, rol: "Administrador" };
    } else exigirAdministrador();
    const lista = db.obtenerUsuarios();
    const errores = erroresUsuario(d, lista, { runActual, sesionRun: db.obtenerSesion()?.run, inicial });
    if (Object.keys(errores).length) return { errores };
    const indice = lista.findIndex((u) => u.run === runActual);
    if (runActual && indice < 0) throw new Error("El usuario ya no existe.");
    const usuario = {
      run: runActual || d.run.trim().toUpperCase(), nombre: d.nombre.trim(),
      apellidos: d.apellidos.trim(), correo: d.correo.trim().toLowerCase(),
      // Al editar sin escribir una contraseña nueva se conserva la actual.
      contrasena: d.contrasena || lista[indice]?.contrasena || "",
      fechaNacimiento: d.fechaNacimiento, rol: d.rol,
      region: d.region, comuna: d.comuna, direccion: d.direccion.trim()
    };
    if (indice < 0) lista.push(usuario);
    else lista[indice] = usuario;
    db.guardarUsuarios(lista);
    if (inicial || db.obtenerSesion()?.run === usuario.run) db.guardarSesion(usuario);
    sincronizar();
    return { usuario };
  }, [sincronizar]);

  const eliminarUsuario = useCallback((run) => {
    exigirAdministrador();
    if (db.obtenerSesion()?.run === run) throw new Error("No puedes eliminar tu propia cuenta.");
    const lista = db.obtenerUsuarios();
    const usuario = lista.find((u) => u.run === run);
    if (usuario?.rol === "Administrador" && lista.filter((u) => u.rol === "Administrador").length < 2) {
      throw new Error("Debe existir al menos un administrador.");
    }
    db.guardarUsuarios(lista.filter((u) => u.run !== run));
    sincronizar();
  }, [sincronizar]);

  /* ---------- Categorías ---------- */
  const guardarCategoria = useCallback((d, idActual = null) => {
    exigirAdministrador();
    const lista = db.obtenerCategorias();
    const errores = erroresCategoria(d, lista, idActual);
    if (Object.keys(errores).length) return { errores };
    const nombre = d.nombre.trim();
    if (idActual) {
      const indice = lista.findIndex((c) => c.id === idActual);
      if (indice < 0) throw new Error("La categoría ya no existe.");
      const anterior = lista[indice].nombre;
      lista[indice] = { ...lista[indice], nombre };
      // Los productos referencian la categoría por nombre: se actualizan al renombrarla.
      if (anterior !== nombre) {
        db.guardarProductos(db.obtenerProductos().map((p) => (p.categoria === anterior ? { ...p, categoria: nombre } : p)));
      }
    } else {
      let id = db.crearSlug(nombre) || "categoria";
      while (lista.some((c) => c.id === id)) id += "-2";
      lista.push({ id, nombre });
    }
    db.guardarCategorias(lista);
    sincronizar();
    return { ok: true };
  }, [sincronizar]);

  const eliminarCategoria = useCallback((id) => {
    exigirAdministrador();
    const lista = db.obtenerCategorias();
    const categoria = lista.find((c) => c.id === id);
    if (!categoria) return;
    const enUso = db.obtenerProductos().filter((p) => p.categoria === categoria.nombre).length;
    if (enUso) throw new Error(`No se puede eliminar: ${enUso} producto(s) usan la categoría "${categoria.nombre}".`);
    db.guardarCategorias(lista.filter((c) => c.id !== id));
    sincronizar();
  }, [sincronizar]);

  /** Edición del propio perfil (cualquier rol con sesión). */
  const actualizarPerfil = useCallback((d) => {
    const actual = db.obtenerSesion();
    if (!actual) throw new Error("Inicia sesión para editar tu perfil.");
    const errores = erroresPerfil(d);
    if (Object.keys(errores).length) return { errores };
    const lista = db.obtenerUsuarios();
    const indice = lista.findIndex((u) => u.run === actual.run);
    if (indice < 0) throw new Error("El usuario ya no existe.");
    const usuario = {
      ...lista[indice], nombre: d.nombre.trim(), apellidos: d.apellidos.trim(),
      fechaNacimiento: d.fechaNacimiento, region: d.region, comuna: d.comuna, direccion: d.direccion.trim(),
      contrasena: d.contrasena || lista[indice].contrasena
    };
    lista[indice] = usuario;
    db.guardarUsuarios(lista);
    db.guardarSesion(usuario);
    sincronizar();
    return { ok: true };
  }, [sincronizar]);

  const valor = {
    productos, categorias, ordenes, usuarios, sesion, carrito,
    resumenCarrito, totalItems, totalCarrito,
    carritoAbierto, setCarritoAbierto, mensajeCarrito, setMensajeCarrito,
    agregarAlCarrito, quitarDelCarrito, cambiarCantidad, vaciarCarrito, finalizarCompra,
    iniciarSesion, cerrarSesion, registrarCliente,
    esAdministrador, hayAdministrador,
    guardarProducto, eliminarProducto, guardarUsuario, eliminarUsuario,
    guardarCategoria, eliminarCategoria, actualizarPerfil
  };

  return <TiendaContext.Provider value={valor}>{children}</TiendaContext.Provider>;
}