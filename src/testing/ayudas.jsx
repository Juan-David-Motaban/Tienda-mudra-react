// Utilidades compartidas por las pruebas: almacenamiento falso (mock de localStorage),
// contexto de tienda simulado y renderizado dentro de un router en memoria.
import { MemoryRouter, useLocation } from "react-router-dom";
import { render } from "@testing-library/react";
import { TiendaContext } from "../context/TiendaContext";

/** Sustituye localStorage por un Map en memoria usando espías de Jasmine (se restauran solos al terminar cada prueba).
 *  Así las pruebas no leen ni modifican los datos reales del navegador. Devuelve el Map para poder inspeccionarlo. */
export function instalarAlmacenFalso(inicial = {}) {
  const datos = new Map(Object.entries(inicial));
  spyOn(Storage.prototype, "getItem").and.callFake((clave) => (datos.has(String(clave)) ? datos.get(String(clave)) : null));
  spyOn(Storage.prototype, "setItem").and.callFake((clave, valor) => { datos.set(String(clave), String(valor)); });
  spyOn(Storage.prototype, "removeItem").and.callFake((clave) => { datos.delete(String(clave)); });
  spyOn(Storage.prototype, "clear").and.callFake(() => datos.clear());
  return datos;
}

/** Producto de ejemplo; `parche` sobrescribe los campos que cada prueba necesite. */
export const productoDe = (parche = {}) => ({
  id: "T001", nombre: "Polerón de prueba", precio: 10000, precioOferta: null, stock: 5, stockCritico: 1,
  descripcion: "Descripción de prueba", material: "Algodón", img: "", categoria: "Polerones", ...parche
});

/** Valor de TiendaContext con todas las acciones como espías: permite probar un componente sin el proveedor real. */
export function tiendaFalsa(parche = {}) {
  const espia = (nombre, retorno) => jasmine.createSpy(nombre).and.returnValue(retorno);
  return {
    productos: [], categorias: [{ id: "polerones", nombre: "Polerones" }], ordenes: [], usuarios: [],
    sesion: null, carrito: [], resumenCarrito: [], totalItems: 0, totalCarrito: 0,
    carritoAbierto: false, mensajeCarrito: "",
    setCarritoAbierto: espia("setCarritoAbierto"), setMensajeCarrito: espia("setMensajeCarrito"),
    agregarAlCarrito: espia("agregarAlCarrito", true),
    quitarDelCarrito: espia("quitarDelCarrito"),
    cambiarCantidad: espia("cambiarCantidad", { ok: true }),
    vaciarCarrito: espia("vaciarCarrito"),
    finalizarCompra: espia("finalizarCompra"),
    iniciarSesion: espia("iniciarSesion", { usuario: {} }),
    cerrarSesion: espia("cerrarSesion"),
    registrarCliente: espia("registrarCliente", { ok: true }),
    esAdministrador: false, hayAdministrador: true,
    ...parche
  };
}

/** Muestra la ruta actual para comprobar redirecciones (leer con getByTestId("ubicacion")). */
function UbicacionActual() {
  const { pathname, search } = useLocation();
  return <div hidden data-testid="ubicacion">{pathname + search}</div>;
}

/** Renderiza `ui` dentro de un MemoryRouter y de un TiendaContext simulado. */
export function renderizar(ui, { tienda = tiendaFalsa(), ruta = "/" } = {}) {
  const vista = render(
    <MemoryRouter initialEntries={[ruta]}>
      <TiendaContext.Provider value={tienda}>{ui}</TiendaContext.Provider>
      <UbicacionActual />
    </MemoryRouter>
  );
  return { ...vista, tienda };
}
