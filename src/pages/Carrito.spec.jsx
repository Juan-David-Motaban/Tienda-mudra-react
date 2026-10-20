import { fireEvent, screen } from "@testing-library/react";
import Carrito from "./Carrito";
import { productoDe, renderizar, tiendaFalsa } from "../testing/ayudas";

const polero = productoDe({ id: "A1", nombre: "Polerón", precio: 10000, stock: 5 });
const gorro = productoDe({ id: "B2", nombre: "Gorro", precio: 3000, precioOferta: 2000, stock: 3 });

const conProductos = (parche = {}) => tiendaFalsa({
  resumenCarrito: [{ producto: polero, cant: 2 }, { producto: gorro, cant: 1 }],
  totalItems: 3, totalCarrito: 22000, ...parche
});

describe("Carrito", () => {
  describe("render", () => {
    it("lista cada producto con el subtotal de su línea y el total", () => {
      renderizar(<Carrito />, { tienda: conProductos() });
      expect(screen.getByRole("heading", { name: "Polerón" })).toBeTruthy();
      expect(screen.getByRole("heading", { name: "Gorro" })).toBeTruthy();
      expect(screen.getByText("$20.000")).toBeTruthy();
      expect(document.getElementById("total-pagar").textContent).toBe("$22.000");
    });

    it("con el carrito vacío informa y deshabilita las acciones", () => {
      renderizar(<Carrito />, { tienda: tiendaFalsa() });
      expect(screen.getByText(/Tu carrito está vacío/)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Comprar ahora" }).disabled).toBeTrue();
      expect(screen.getByRole("button", { name: "Limpiar carrito" }).disabled).toBeTrue();
    });

    it("sin sesión ofrece iniciar sesión o crear cuenta volviendo al carrito", () => {
      renderizar(<Carrito />, { tienda: conProductos() });
      expect(screen.getByRole("link", { name: "Iniciar sesión" }).getAttribute("href")).toBe("/iniciosesion?destino=carrito");
      expect(screen.getByRole("link", { name: "Crear cuenta" }).getAttribute("href")).toBe("/registro?destino=carrito");
    });

    it("con sesión muestra los datos del cliente", () => {
      const sesion = { nombre: "Ana", apellidos: "Pérez", correo: "ana@duoc.cl", direccion: "Calle 1", comuna: "Santiago", region: "Metropolitana" };
      renderizar(<Carrito />, { tienda: conProductos({ sesion }) });
      expect(screen.getByText("Ana Pérez")).toBeTruthy();
      expect(screen.getByText("ana@duoc.cl")).toBeTruthy();
    });

    it("deshabilita el botón + cuando la cantidad llega al stock", () => {
      const tienda = tiendaFalsa({ resumenCarrito: [{ producto: polero, cant: 5 }], totalCarrito: 50000 });
      renderizar(<Carrito />, { tienda });
      expect(screen.getByRole("button", { name: "Agregar una unidad" }).disabled).toBeTrue();
    });
  });

  describe("eventos", () => {
    it("el botón + sube la cantidad en uno", () => {
      const tienda = conProductos();
      renderizar(<Carrito />, { tienda });
      fireEvent.click(screen.getAllByRole("button", { name: "Agregar una unidad" })[0]);
      expect(tienda.cambiarCantidad).toHaveBeenCalledWith("A1", 3);
    });

    it("el botón − baja la cantidad en uno", () => {
      const tienda = conProductos();
      renderizar(<Carrito />, { tienda });
      fireEvent.click(screen.getAllByRole("button", { name: "Quitar una unidad" })[0]);
      expect(tienda.cambiarCantidad).toHaveBeenCalledWith("A1", 1);
    });

    it("escribir una cantidad la envía al contexto", () => {
      const tienda = conProductos();
      renderizar(<Carrito />, { tienda });
      fireEvent.change(screen.getAllByLabelText("Cantidad")[0], { target: { value: "4" } });
      expect(tienda.cambiarCantidad).toHaveBeenCalledWith("A1", "4");
    });

    it("Eliminar quita el producto del carrito", () => {
      const tienda = conProductos();
      renderizar(<Carrito />, { tienda });
      fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
      expect(tienda.quitarDelCarrito).toHaveBeenCalledWith("A1");
    });

    it("Limpiar carrito lo vacía", () => {
      const tienda = conProductos();
      renderizar(<Carrito />, { tienda });
      fireEvent.click(screen.getByRole("button", { name: "Limpiar carrito" }));
      expect(tienda.vaciarCarrito).toHaveBeenCalled();
    });

    it("muestra el mensaje de error cuando el contexto rechaza el cambio de cantidad", () => {
      const tienda = conProductos();
      tienda.cambiarCantidad.and.returnValue({ ok: false, mensaje: "Stock disponible de Polerón: 5 unidades." });
      renderizar(<Carrito />, { tienda });
      fireEvent.click(screen.getAllByRole("button", { name: "Agregar una unidad" })[0]);
      expect(screen.getByText("Stock disponible de Polerón: 5 unidades.")).toBeTruthy();
    });

    it("Comprar ahora lleva al checkout", () => {
      renderizar(<Carrito />, { tienda: conProductos() });
      fireEvent.click(screen.getByRole("button", { name: "Comprar ahora" }));
      expect(screen.getByTestId("ubicacion").textContent).toBe("/checkout");
    });

    it("con sesión, Cerrar sesión llama al contexto", () => {
      const sesion = { nombre: "Ana", apellidos: "Pérez", correo: "ana@duoc.cl", direccion: "Calle 1", comuna: "Santiago", region: "RM" };
      const tienda = conProductos({ sesion });
      renderizar(<Carrito />, { tienda });
      fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
      expect(tienda.cerrarSesion).toHaveBeenCalled();
    });
  });
});
