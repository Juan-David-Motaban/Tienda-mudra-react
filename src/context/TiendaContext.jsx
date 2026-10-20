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
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState("");


  useEffect(() => {

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
    return true;

  const quitarDelCarrito = useCallback((idProducto) => {

  const cambiarCantidad = useCallback((idProducto, cantidad) => {
    const unidades = Math.floor(Number(cantidad));
    if (!producto || !Number.isSafeInteger(unidades)) return { ok: false };
    if (unidades < 1) {
      return { ok: true };
    }
    return { ok: true };

  const vaciarCarrito = useCallback(() => {
    db.guardarCarrito([]);

    return orden;

        return { error: "Esta cuenta no tiene acceso administrativo. Ingresa desde el inicio de sesión de la tienda." };
      }

  const cerrarSesion = useCallback(() => {

      return { ok: true };

  const esAdministrador = sesion?.rol === "Administrador";

    if (Object.keys(errores).length) return { errores };
      precio: Number(d.precio),
      precioOferta: d.precioOferta === "" || d.precioOferta == null ? null : Number(d.precioOferta),
      stock: Number(d.stock),
      stockCritico: d.stockCritico === "" ? null : Number(d.stockCritico),
    };
    return { producto };


    if (Object.keys(errores).length) return { errores };
    };
    return { usuario };


    if (Object.keys(errores).length) return { errores };
    if (idActual) {
    } else {
    }
    return { ok: true };


    const errores = erroresPerfil(d);
    if (Object.keys(errores).length) return { errores };
    return { ok: true };

  const valor = {
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