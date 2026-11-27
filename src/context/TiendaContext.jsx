import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, guardarToken, limpiarToken, obtenerToken } from "../lib/api";
import { crearSlug, guardarCarrito, imagenProductoSegura, obtenerCarrito, precioFinal } from "../lib/almacen";
import { erroresCategoria, erroresPerfil, erroresProducto, erroresUsuario } from "../lib/validaciones";

export const TiendaContext = createContext(null);

export function useTienda() {
  const ctx = useContext(TiendaContext);
  if (!ctx) throw new Error("useTienda debe usarse dentro de <TiendaProvider>.");
  return ctx;
}

const ROLES_ADMIN = ["Administrador", "Vendedor"];
const lista = (valor) => (Array.isArray(valor) ? valor : []);

export function TiendaProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [mensajesContacto, setMensajesContacto] = useState([]);
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [listo, setListo] = useState(false);
  const [carrito, setCarrito] = useState(() => {
    try {
      return lista(obtenerCarrito());
    } catch {
      return [];
    }
  });
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState("");

  useEffect(() => {
    try {
      guardarCarrito(carrito);
    } catch {
      return;
    }
  }, [carrito]);

  const cargarDatosPublicos = useCallback(async () => {
    const [prods, cats] = await Promise.all([
      apiFetch("/productos").catch(() => []),
      apiFetch("/categorias").catch(() => [])
    ]);
    setProductos(lista(prods));
    setCategorias(lista(cats));
  }, []);

  const cargarDatosPrivados = useCallback(async (usuario) => {
    if (!usuario) {
      setOrdenes([]);
      setUsuarios([]);
      setMensajesContacto([]);
      return;
    }
    setOrdenes(lista(await apiFetch("/ordenes").catch(() => [])));
    if (usuario.rol === "Administrador") {
      const [users, msgs] = await Promise.all([
        apiFetch("/usuarios").catch(() => []),
        apiFetch("/contacto").catch(() => [])
      ]);
      setUsuarios(lista(users));
      setMensajesContacto(lista(msgs));
    } else {
      setUsuarios([]);
      setMensajesContacto([]);
    }
  }, []);

  const inicializar = useCallback(async () => {
    setCargando(true);
    await cargarDatosPublicos();
    if (obtenerToken()) {
      try {
        const perfil = await apiFetch("/auth/perfil");
        const usuario = perfil?.usuario;
        if (perfil?.token) guardarToken(perfil.token);
        if (usuario?.correo) {
          setSesion(usuario);
          await cargarDatosPrivados(usuario);
        } else {
          limpiarToken();
          setSesion(null);
        }
      } catch {
        limpiarToken();
        setSesion(null);
      }
    } else {
      setSesion(null);
    }
    setCargando(false);
    setListo(true);
  }, [cargarDatosPublicos, cargarDatosPrivados]);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  const resumenCarrito = useMemo(() => carrito
      .map((item) => {
        const producto = productos.find((p) => p.id === item.id);
        return producto ? { ...item, producto } : null;
      })
      .filter(Boolean), [carrito, productos]);

  const totalItems = carrito.reduce((t, i) => t + (Number(i.cant) || 0), 0);
  const totalCarrito = resumenCarrito.reduce((t, i) => t + precioFinal(i.producto) * i.cant, 0);

  const agregarAlCarrito = useCallback((idProducto, cantidad = 1) => {
    const producto = productos.find((p) => p.id === idProducto);
    const unidades = Number(cantidad);
    if (!producto || !Number.isSafeInteger(unidades) || unidades < 1) {
      setMensajeCarrito("Selecciona un producto disponible y una cantidad entera mayor que cero.");
      setCarritoAbierto(true);
      return false;
    }
    const existente = carrito.find((i) => i.id === idProducto);
    if (unidades + (existente?.cant || 0) > producto.stock) {
      setMensajeCarrito(`Stock disponible de ${producto.nombre}: ${producto.stock} unidades.`);
      setCarritoAbierto(true);
      return false;
    }
    setCarrito((prev) => (prev.some((i) => i.id === idProducto)
        ? prev.map((i) => (i.id === idProducto ? { ...i, cant: i.cant + unidades } : i))
        : [...prev, { id: idProducto, cant: unidades }]));
    setMensajeCarrito("");
    setCarritoAbierto(true);
    return true;
  }, [productos, carrito]);

  const quitarDelCarrito = useCallback((idProducto) => {
    setCarrito((prev) => prev.filter((i) => i.id !== idProducto));
  }, []);

  const cambiarCantidad = useCallback((idProducto, cantidad) => {
    const producto = productos.find((p) => p.id === idProducto);
    const unidades = Math.floor(Number(cantidad));
    if (!producto || !Number.isSafeInteger(unidades)) return { ok: false };
    if (unidades < 1) {
      setCarrito((prev) => prev.filter((i) => i.id !== idProducto));
      return { ok: true };
    }
    if (unidades > producto.stock) {
      return { ok: false, mensaje: `Stock disponible de ${producto.nombre}: ${producto.stock} unidades.` };
    }
    setCarrito((prev) => prev.map((i) => (i.id === idProducto ? { ...i, cant: unidades } : i)));
    return { ok: true };
  }, [productos]);

  const vaciarCarrito = useCallback(() => setCarrito([]), []);

  const finalizarCompra = useCallback(async (datosCheckout, exito = true) => {
    if (!carrito.length) throw new Error("El carrito está vacío.");
    const orden = await apiFetch("/ordenes", {
      method: "POST",
      body: JSON.stringify({
        datos: datosCheckout,
        carrito: carrito.map(({ id, cant }) => ({ id, cant })),
        exito
      })
    });
    setOrdenes((prev) => [orden, ...prev.filter((o) => o.id !== orden.id)]);
    if (exito) setCarrito([]);
    await cargarDatosPublicos();
    return orden;
  }, [carrito, cargarDatosPublicos]);

  const iniciarSesion = useCallback(async (correo, contrasena, soloAdministracion = false) => {
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ correo: correo.trim().toLowerCase(), contrasena })
      });
      const usuario = data?.usuario;
      if (!usuario || !data?.token) return { error: "No fue posible obtener los datos de sesión." };
      if (soloAdministracion && !ROLES_ADMIN.includes(usuario.rol)) {
        return { error: "Esta cuenta no tiene acceso administrativo. Ingresa desde el inicio de sesión de la tienda." };
      }
      guardarToken(data.token);
      setSesion(usuario);
      await cargarDatosPrivados(usuario);
      return { usuario };
    } catch (err) {
      return { error: err?.message || "El correo o la contraseña no coinciden con una cuenta registrada." };
    }
  }, [cargarDatosPrivados]);

  const cerrarSesion = useCallback(() => {
    limpiarToken();
    setSesion(null);
    setOrdenes([]);
    setUsuarios([]);
    setMensajesContacto([]);
    return { ok: true };
  }, []);

  const registrarCliente = useCallback(async (d) => {
    try {
      await apiFetch("/auth/registro", {
        method: "POST",
        body: JSON.stringify({
          run: d.run.trim().toUpperCase(),
          nombre: d.nombre.trim(),
          apellidos: d.apellidos.trim(),
          correo: d.correo.trim().toLowerCase(),
          contrasena: d.contrasena,
          fechaNacimiento: d.fechaNacimiento,
          region: d.region,
          comuna: d.comuna,
          direccion: d.direccion.trim()
        })
      });
      return { ok: true };
    } catch (err) {
      const mensaje = err?.message || "";
      if (mensaje.includes("RUN")) return { errores: { run: "Ya existe una cuenta con este RUN." } };
      if (mensaje.includes("correo")) return { errores: { correo: "Ya existe una cuenta con este correo." } };
      throw err;
    }
  }, []);

  const esAdministrador = sesion?.rol === "Administrador";

  const exigirAdministrador = useCallback(() => {
    if (sesion?.rol !== "Administrador") throw new Error("Tu cuenta no tiene permiso para realizar esta operación.");
  }, [sesion]);

  const guardarProducto = useCallback(async (d, idActual = null) => {
    exigirAdministrador();
    const errores = erroresProducto(d, productos, categorias.map((c) => c.nombre), idActual);
    if (Object.keys(errores).length) return { errores };
    const producto = {
      id: idActual || d.id.trim().toUpperCase(),
      nombre: d.nombre.trim(),
      descripcion: d.descripcion.trim(),
      categoria: d.categoria,
      precio: Number(d.precio),
      precioOferta: d.precioOferta === "" || d.precioOferta == null ? null : Number(d.precioOferta),
      stock: Number(d.stock),
      stockCritico: d.stockCritico === "" || d.stockCritico == null ? null : Number(d.stockCritico),
      material: d.material.trim(),
      img: imagenProductoSegura(d.img.trim())
    };
    const guardado = await apiFetch(idActual ? `/productos/${encodeURIComponent(idActual)}` : "/productos", {
      method: idActual ? "PUT" : "POST",
      body: JSON.stringify(producto)
    });
    await cargarDatosPublicos();
    return { producto: guardado };
  }, [exigirAdministrador, productos, categorias, cargarDatosPublicos]);

  const eliminarProducto = useCallback(async (id) => {
    exigirAdministrador();
    await apiFetch(`/productos/${encodeURIComponent(id)}`, { method: "DELETE" });
    await cargarDatosPublicos();
  }, [exigirAdministrador, cargarDatosPublicos]);

  const guardarUsuario = useCallback(async (d, runActual = null, inicial = false) => {
    if (inicial) throw new Error("La administración ya está configurada. Inicia sesión.");
    exigirAdministrador();
    const errores = erroresUsuario(d, usuarios, { runActual, sesionRun: sesion?.run, inicial });
    if (Object.keys(errores).length) return { errores };
    const usuario = {
      run: runActual || d.run.trim().toUpperCase(),
      nombre: d.nombre.trim(),
      apellidos: d.apellidos.trim(),
      correo: d.correo.trim().toLowerCase(),
      contrasena: d.contrasena || "",
      fechaNacimiento: d.fechaNacimiento,
      rol: d.rol,
      region: d.region,
      comuna: d.comuna,
      direccion: d.direccion.trim()
    };
    const guardado = await apiFetch(runActual ? `/usuarios/${encodeURIComponent(runActual)}` : "/usuarios", {
      method: runActual ? "PUT" : "POST",
      body: JSON.stringify(usuario)
    });
    if (sesion?.run === guardado?.run) setSesion(guardado);
    await cargarDatosPrivados(sesion);
    return { usuario: guardado };
  }, [exigirAdministrador, usuarios, sesion, cargarDatosPrivados]);

  const eliminarUsuario = useCallback(async (run) => {
    exigirAdministrador();
    if (sesion?.run === run) throw new Error("No puedes eliminar tu propia cuenta.");
    const usuario = usuarios.find((u) => u.run === run);
    if (usuario?.rol === "Administrador" && usuarios.filter((u) => u.rol === "Administrador").length < 2) {
      throw new Error("Debe existir al menos un administrador.");
    }
    await apiFetch(`/usuarios/${encodeURIComponent(run)}`, { method: "DELETE" });
    await cargarDatosPrivados(sesion);
  }, [exigirAdministrador, sesion, usuarios, cargarDatosPrivados]);

  const guardarCategoria = useCallback(async (d, idActual = null) => {
    exigirAdministrador();
    const errores = erroresCategoria(d, categorias, idActual);
    if (Object.keys(errores).length) return { errores };
    const nombre = d.nombre.trim();
    if (idActual) {
      const anterior = categorias.find((c) => c.id === idActual)?.nombre;
      await apiFetch(`/categorias/${encodeURIComponent(idActual)}`, {
        method: "PUT",
        body: JSON.stringify({ id: idActual, nombre })
      });
      if (anterior && anterior !== nombre) {
        await Promise.all(productos
            .filter((p) => p.categoria === anterior)
            .map((p) => apiFetch(`/productos/${encodeURIComponent(p.id)}`, {
              method: "PUT",
              body: JSON.stringify({ ...p, categoria: nombre })
            })));
      }
    } else {
      await apiFetch("/categorias", {
        method: "POST",
        body: JSON.stringify({ id: crearSlug(nombre) || "categoria", nombre })
      });
    }
    await cargarDatosPublicos();
    return { ok: true };
  }, [exigirAdministrador, categorias, productos, cargarDatosPublicos]);

  const eliminarCategoria = useCallback(async (id) => {
    exigirAdministrador();
    const categoria = categorias.find((c) => c.id === id);
    if (!categoria) return;
    const enUso = productos.filter((p) => p.categoria === categoria.nombre).length;
    if (enUso) throw new Error(`No se puede eliminar: ${enUso} producto(s) usan la categoría "${categoria.nombre}".`);
    await apiFetch(`/categorias/${encodeURIComponent(id)}`, { method: "DELETE" });
    await cargarDatosPublicos();
  }, [exigirAdministrador, categorias, productos, cargarDatosPublicos]);

  const actualizarPerfil = useCallback(async (d) => {
    if (!sesion) throw new Error("Inicia sesión para editar tu perfil.");
    const errores = erroresPerfil(d);
    if (Object.keys(errores).length) return { errores };
    const guardado = await apiFetch(`/usuarios/${encodeURIComponent(sesion.run)}`, {
      method: "PUT",
      body: JSON.stringify({
        ...sesion,
        nombre: d.nombre.trim(),
        apellidos: d.apellidos.trim(),
        fechaNacimiento: d.fechaNacimiento,
        region: d.region,
        comuna: d.comuna,
        direccion: d.direccion.trim(),
        contrasena: d.contrasena || ""
      })
    });
    setSesion(guardado);
    return { ok: true };
  }, [sesion]);

  const valor = {
    productos, categorias, ordenes, usuarios, mensajesContacto, sesion, carrito,
    cargando, cargandoSesion: cargando,
    resumenCarrito, totalItems, totalCarrito,
    carritoAbierto, setCarritoAbierto, mensajeCarrito, setMensajeCarrito,
    agregarAlCarrito, quitarDelCarrito, cambiarCantidad, vaciarCarrito, finalizarCompra,
    iniciarSesion, cerrarSesion, registrarCliente,
    esAdministrador, hayAdministrador: true,
    guardarProducto, eliminarProducto, guardarUsuario, eliminarUsuario,
    guardarCategoria, eliminarCategoria, actualizarPerfil,
    recargarTodo: inicializar
  };

  return (
      <TiendaContext.Provider value={valor}>
        {listo ? children : <div className="container py-5 text-center">Cargando tienda...</div>}
      </TiendaContext.Provider>
  );
}