// Utilidades compartidas por las pruebas unitarias (Jasmine + Karma).
// Renderizan componentes con React 18 (createRoot + act) y simulan eventos del navegador.
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { TiendaContext } from "../context/TiendaContext";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const montados = [];

/** Monta un elemento React en el documento y devuelve su contenedor. */
export function renderizar(ui) {
  const contenedor = document.createElement("div");
  document.body.appendChild(contenedor);
  const raiz = createRoot(contenedor);
  act(() => raiz.render(ui));
  montados.push({ raiz, contenedor });
  return contenedor;
}

/** Desmonta todo lo renderizado (usar en afterEach). */
export function limpiar() {
  montados.splice(0).forEach(({ raiz, contenedor }) => {
    act(() => raiz.unmount());
    contenedor.remove();
  });
  document.body.className = "";
}

/* ---------- Eventos ---------- */
export const clic = (el) => act(() => { el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })); });

/** Cambia el valor de un input, textarea o select como lo haría el usuario (dispara onChange de React). */
export function escribir(el, valor) {
  const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype
    : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, valor);
  act(() => { el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? "change" : "input", { bubbles: true })); });
}

export const salirDelCampo = (el) => act(() => { el.dispatchEvent(new FocusEvent("focusout", { bubbles: true })); });
export const enviar = (form) => act(() => { form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
export const teclaEnDocumento = (key) => act(() => { document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true })); });

/* ---------- Búsquedas ---------- */
/** Primer elemento que cumple el selector y contiene el texto indicado. */
export const conTexto = (raiz, selector, texto) =>
  [...raiz.querySelectorAll(selector)].find((el) => el.textContent.includes(texto)) || null;

/* ---------- Datos y mocks ---------- */
export const productoDemo = (extra = {}) => ({
  id: "T001", nombre: "Polerón Test", descripcion: "Descripción de prueba", categoria: "Polerones",
  precio: 10000, precioOferta: null, stock: 5, stockCritico: 2, material: "Algodón", img: "", ...extra
});

/** Contexto de tienda falso: datos vacíos y funciones espía de Jasmine (mock de useTienda). */
export function contextoFalso(sobreescribir = {}) {
  const espia = (nombre, retorno) => jasmine.createSpy(nombre).and.returnValue(retorno);
  return {
    productos: [], categorias: [], ordenes: [], usuarios: [], sesion: null, carrito: [], resumenCarrito: [],
    totalItems: 0, totalCarrito: 0, carritoAbierto: false, mensajeCarrito: "",
    esAdministrador: false, hayAdministrador: true,
    setCarritoAbierto: espia("setCarritoAbierto"),
    setMensajeCarrito: espia("setMensajeCarrito"),
    agregarAlCarrito: espia("agregarAlCarrito", true),
    quitarDelCarrito: espia("quitarDelCarrito"),
    cambiarCantidad: espia("cambiarCantidad", { ok: true }),
    vaciarCarrito: espia("vaciarCarrito"),
    finalizarCompra: espia("finalizarCompra"),
    iniciarSesion: espia("iniciarSesion", {}),
    cerrarSesion: espia("cerrarSesion"),
    registrarCliente: espia("registrarCliente", { ok: true }),
    ...sobreescribir
  };
}

/** Renderiza dentro de un TiendaContext falso y un MemoryRouter. Devuelve { contenedor, tienda }. */
export function renderizarConTienda(ui, { contexto = {}, ruta = "/" } = {}) {
  const tienda = contextoFalso(contexto);
  const contenedor = renderizar(
    <TiendaContext.Provider value={tienda}>
      <MemoryRouter initialEntries={[ruta]}>{ui}</MemoryRouter>
    </TiendaContext.Provider>
  );
  return { contenedor, tienda };
}
