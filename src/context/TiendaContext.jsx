import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as db from "../lib/almacen";
import { erroresCategoria, erroresPerfil, erroresProducto, erroresUsuario } from "../lib/validaciones";

export const TiendaContext = createContext(null);

export function useTienda() {
  const ctx = useContext(TiendaContext);
  if (!ctx) throw new Error("useTienda debe usarse dentro de <TiendaProvider>.");
  return ctx;
}

export function TiendaProvider({ children }) {
  const [productos, setProductos] = useState(() => db.obtenerProductos());
  const [categorias, setCategorias] = useState(() => db.obtenerCategorias());
  const [usuarios, setUsuarios] = useState(() => db.obtenerUsuarios());
  const [ordenes, setOrdenes] = useState(() => db.obtenerOrdenes());
  const [carrito, setCarrito] = useState(() => db.obtenerCarrito());
  const [sesion, setSesion] = useState(() => db.obtenerSesion());
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState("");

  useEffect(() => {
    const alCambiarStorage = (e) => {
      if (!e.key || e.key === db.CLAVE_CARRITO) setCarrito(db.obtenerCarrito());
      if (!e.key || e.key === db.CLAVE_PRODUCTOS) setProductos(db.obtenerProductos());
      if (!e.key || e.key === db.CLAVE_CATEGORIAS) setCategorias(db.obtenerCategorias());
      if (!e.key || e.key === db.CLAVE_USUARIOS) setUsuarios(db.obtenerUsuarios());
      if (!e.key || e.key === db.CLAVE_ORDENES) setOrdenes(db.obtenerOrdenes());
      if (!e.key || e.key === db.CLAVE_SESION) setSesion(db.obtenerSesion());
    };
    window.addEventListener("storage", alCambiarStorage);
    return () => window.removeEventListener("storage", alCambiarStorage);
  }, []);

  /* ---------- Carrito ---------- */
  const resumenCarrito = useMemo(
    () =>
      carrito
        .map((item) => {
          const producto = productos.find((p) => p.id === item.id);
          return producto ? { ...item, producto } : null;
        })
        .filter(Boolean),
    [carrito, productos]
  );

  const totalItems = carrito.reduce((t, i) => t + i.cant, 0);
  const totalCarrito = resumenCarrito.reduce((t, i) => t + db.precioFinal(i.producto) * i.cant, 0);

  const agregarAlCarrito = useCallback(
    (idProducto, cantidad = 1) => {
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
      setCarrito(actual);
      setMensajeCarrito("");
      setCarritoAbierto(true);
      return true;
    },
    [productos]
  );

  const quitarDelCarrito = useCallback((idProducto) => {
    const actual = db.obtenerCarrito().filter((i) => i.id !== idProducto);
    db.guardarCarrito(actual);
    setCarrito(actual);
  }, []);

  const cambiarCantidad = useCallback(
    (idProducto, cantidad) => {
      const producto = productos.find((p) => p.id === idProducto);
      const unidades = Math.floor(Number(cantidad));
      if (!producto || !Number.isSafeInteger(unidades)) return { ok: false };
      if (unidades < 1) {
        quitarDelCarrito(idProducto);
        return { ok: true };
      }
      if (unidades > producto.stock) {
        return { ok: false, mensaje: `Stock disponible de ${producto.nombre}: ${producto.stock} unidades.` };
      }
      const actual = db.obtenerCarrito().map((i) => (i.id === idProducto ? { ...i, cant: unidades } : i));
      db.guardarCarrito(actual);
      setCarrito(actual);
      return { ok: true };
    },
    [productos, quitarDelCarrito]
  );

  const vaciarCarrito = useCallback(() => {
    db.guardarCarrito([]);
    setCarrito([]);
  }, []);

  const finalizarCompra = useCallback((datos, exito = true) => {
    const orden = db.registrarOrden(datos, db.obtenerCarrito(), exito);
    setProductos(db.obtenerProductos());
    setOrdenes(db.obtenerOrdenes());
    if (exito) {
      db.guardarCarrito([]);
      setCarrito([]);
    }
    return orden;
  }, []);

  /* ---------- Sesión y cuentas ---------- */
  const iniciarSesion = useCallback((correo, contrasena, soloAdmin = false) => {
    const email = String(correo || "").trim().toLowerCase();
    const usuario = db.obtenerUsuarios().find((u) => u.correo?.toLowerCase() === email && u.contrasena === contrasena);
    if (!usuario) {
      return { error: "El correo o la contraseña no coinciden con una cuenta registrada." };
    }
    if (soloAdmin && usuario.rol !== "Administrador") {
      return { error: "Esta cuenta no tiene acceso administrativo. Ingresa desde el inicio de sesión de la tienda." };
    }
    db.guardarSesion(usuario);
    const sesionActual = db.obtenerSesion();
    setSesion(sesionActual);
    return { usuario: sesionActual };
  }, []);

  const cerrarSesion = useCallback(() => {
    db.borrarSesion();
    setSesion(null);
  }, []);

  const registrarCliente = useCallback((d) => {
    const lista = db.obtenerUsuarios();
    const errores = erroresUsuario(d, lista);
    if (Object.keys(errores).length) return { errores };
    const nuevo = {
      run: d.run.trim().toUpperCase(),
      nombre: d.nombre.trim(),
      apellidos: d.apellidos.trim(),
      correo: d.correo.trim().toLowerCase(),
      contrasena: d.contrasena,
      fechaNacimiento: d.fechaNacimiento || "",
      rol: "Cliente",
      region: d.region,
      comuna: d.comuna,
      direccion: d.direccion.trim()
    };
    const actualizados = [...lista, nuevo];
    db.guardarUsuarios(actualizados);
    setUsuarios(actualizados);
    return { ok: true };
  }, []);

  const esAdministrador = sesion?.rol === "Administrador";
  const hayAdministrador = usuarios.some((u) => u.rol === "Administrador");

  const exigirAdmin = useCallback(() => {
    if (sesion?.rol !== "Administrador") {
      throw new Error("Tu cuenta no tiene permiso para realizar esta operación.");
    }
  }, [sesion]);

  /* ---------- Administración ---------- */
  const guardarProducto = useCallback(
    (d, idActual = null) => {
      exigirAdmin();
      const lista = db.obtenerProductos();
      const errores = erroresProducto(d, lista, idActual);
      if (Object.keys(errores).length) return { errores };
      const producto = {
        id: (idActual || d.id).trim().toUpperCase(),
        nombre: d.nombre.trim(),
        descripcion: (d.descripcion || "").trim(),
        categoria: d.categoria,
        precio: Number(d.precio),
        precioOferta: d.precioOferta === "" || d.precioOferta == null ? null : Number(d.precioOferta),
        stock: Number(d.stock),
        stockCritico: d.stockCritico === "" || d.stockCritico == null ? null : Number(d.stockCritico),
        material: (d.material || "").trim(),
        img: (d.img || "").trim()
      };
      const actualizados = idActual ? lista.map((p) => (p.id === idActual ? producto : p)) : [...lista, producto];
      db.guardarProductos(actualizados);
      setProductos(actualizados);
      return { producto };
    },
    [exigirAdmin]
  );

  const eliminarProducto = useCallback(
    (id) => {
      exigirAdmin();
      const actualizados = db.obtenerProductos().filter((p) => p.id !== id);
      db.guardarProductos(actualizados);
      setProductos(actualizados);
    },
    [exigirAdmin]
  );

  const guardarUsuario = useCallback(
    (d, runActual = null) => {
      exigirAdmin();
      const lista = db.obtenerUsuarios();
      const errores = erroresUsuario(d, lista, runActual);
      if (Object.keys(errores).length) return { errores };
      const existente = runActual ? lista.find((u) => u.run === runActual) : null;
      const usuario = {
        run: (runActual || d.run).trim().toUpperCase(),
        nombre: d.nombre.trim(),
        apellidos: d.apellidos.trim(),
        correo: d.correo.trim().toLowerCase(),
        contrasena: d.contrasena || existente?.contrasena || "",
        fechaNacimiento: d.fechaNacimiento || "",
        rol: d.rol || "Cliente",
        region: d.region,
        comuna: d.comuna,
        direccion: d.direccion.trim()
      };
      const actualizados = runActual ? lista.map((u) => (u.run === runActual ? usuario : u)) : [...lista, usuario];
      db.guardarUsuarios(actualizados);
      setUsuarios(actualizados);
      if (sesion?.run === usuario.run) {
        db.guardarSesion(usuario);
        setSesion(db.obtenerSesion());
      }
      return { usuario };
    },
    [exigirAdmin, sesion]
  );

  const eliminarUsuario = useCallback(
    (run) => {
      exigirAdmin();
      if (sesion?.run === run) {
        throw new Error("No puedes eliminar tu propia cuenta.");
      }
      const actualizados = db.obtenerUsuarios().filter((u) => u.run !== run);
      db.guardarUsuarios(actualizados);
      setUsuarios(actualizados);
    },
    [exigirAdmin, sesion]
  );

  const guardarCategoria = useCallback(
    (d, idActual = null) => {
      exigirAdmin();
      const lista = db.obtenerCategorias();
      const errores = erroresCategoria(d, lista, idActual);
      if (Object.keys(errores).length) return { errores };
      const nombre = d.nombre.trim();
      const id = idActual || db.crearSlug(nombre);
      let actualizadas;
      if (idActual) {
        const anterior = lista.find((c) => c.id === idActual);
        actualizadas = lista.map((c) => (c.id === idActual ? { id: idActual, nombre } : c));
        if (anterior && anterior.nombre !== nombre) {
          const prodsActualizados = db.obtenerProductos().map((p) =>
            p.categoria === anterior.nombre ? { ...p, categoria: nombre } : p
          );
          db.guardarProductos(prodsActualizados);
          setProductos(prodsActualizados);
        }
      } else {
        actualizadas = [...lista, { id, nombre }];
      }
      db.guardarCategorias(actualizadas);
      setCategorias(actualizadas);
      return { ok: true };
    },
    [exigirAdmin]
  );

  const eliminarCategoria = useCallback(
    (id) => {
      exigirAdmin();
      const cat = db.obtenerCategorias().find((c) => c.id === id);
      if (!cat) return;
      const enUso = db.obtenerProductos().filter((p) => p.categoria === cat.nombre).length;
      if (enUso > 0) {
        throw new Error(`${enUso} producto(s) usan la categoría "${cat.nombre}".`);
      }
      const actualizadas = db.obtenerCategorias().filter((c) => c.id !== id);
      db.guardarCategorias(actualizadas);
      setCategorias(actualizadas);
    },
    [exigirAdmin]
  );

  const actualizarPerfil = useCallback(
    (d) => {
      if (!sesion) return { errores: { general: "No hay sesión activa." } };
      const errores = erroresPerfil(d);
      if (Object.keys(errores).length) return { errores };
      const lista = db.obtenerUsuarios();
      const actualizados = lista.map((u) =>
        u.run === sesion.run
          ? {
              ...u,
              nombre: d.nombre.trim(),
              apellidos: d.apellidos.trim(),
              region: d.region,
              comuna: d.comuna,
              direccion: d.direccion.trim(),
              ...(d.contrasena ? { contrasena: d.contrasena } : {})
            }
          : u
      );
      db.guardarUsuarios(actualizados);
      setUsuarios(actualizados);
      const actualizado = actualizados.find((u) => u.run === sesion.run);
      if (actualizado) {
        db.guardarSesion(actualizado);
        setSesion(db.obtenerSesion());
      }
      return { ok: true };
    },
    [sesion]
  );

  const valor = {
    productos, categorias, usuarios, ordenes, carrito, sesion,
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