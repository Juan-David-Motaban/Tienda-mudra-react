import { fireEvent, screen, within } from "@testing-library/react";
import Header from "./Header";
import { productoDe, renderizar, tiendaFalsa } from "../testing/ayudas";

describe("Header", () => {
  describe("render y props del contexto", () => {
    it("muestra los siete enlaces de navegación", () => {
      renderizar(<Header />);
      const menu = screen.getByRole("navigation", { name: "Principal" });
      const textos = within(menu).getAllByRole("link").map((enlace) => enlace.textContent);
      expect(textos).toEqual(["Home", "Productos", "Categorías", "Ofertas", "Nosotros", "Blogs", "Contacto"]);
    });

    it("sin sesión ofrece iniciar sesión y crear cuenta", () => {
      renderizar(<Header />);
      expect(screen.getByRole("link", { name: "Iniciar sesión" }).getAttribute("href")).toBe("/iniciosesion");
      expect(screen.getByRole("link", { name: "Crear cuenta" }).getAttribute("href")).toBe("/registro");
    });

    it("con sesión de cliente saluda por su nombre y no muestra Administración", () => {
      renderizar(<Header />, { tienda: tiendaFalsa({ sesion: { nombre: "Ana", rol: "Cliente" } }) });
      expect(screen.getByText("Hola, Ana")).toBeTruthy();
      expect(screen.queryByRole("link", { name: "Administración" })).toBeNull();
    });

    it("con sesión de administrador muestra el enlace al panel", () => {
      renderizar(<Header />, { tienda: tiendaFalsa({ sesion: { nombre: "Ana", rol: "Administrador" } }) });
      expect(screen.getByRole("link", { name: "Administración" }).getAttribute("href")).toBe("/admin");
    });

    it("el contador del carrito refleja la cantidad de ítems", () => {
      renderizar(<Header />, { tienda: tiendaFalsa({ totalItems: 3 }) });
      expect(screen.getByRole("button", { name: /Carrito \(3\)/ })).toBeTruthy();
    });
  });

  describe("estado y eventos", () => {
    it("el botón hamburguesa abre y cierra el menú colapsable de Bootstrap", () => {
      renderizar(<Header />);
      const boton = screen.getByRole("button", { name: "Mostrar u ocultar el menú" });
      const menu = document.getElementById("menu-principal");

      expect(boton.getAttribute("aria-expanded")).toBe("false");
      expect(menu.classList.contains("show")).toBeFalse();

      fireEvent.click(boton);
      expect(boton.getAttribute("aria-expanded")).toBe("true");
      expect(menu.classList.contains("show")).toBeTrue();

      fireEvent.click(boton);
      expect(menu.classList.contains("show")).toBeFalse();
    });

    it("Cerrar sesión llama a la acción del contexto", () => {
      const tienda = tiendaFalsa({ sesion: { nombre: "Ana", rol: "Cliente" } });
      renderizar(<Header />, { tienda });
      fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
      expect(tienda.cerrarSesion).toHaveBeenCalled();
    });

    it("el botón del carrito pide abrir el desplegable", () => {
      const tienda = tiendaFalsa();
      renderizar(<Header />, { tienda });
      fireEvent.click(screen.getByRole("button", { name: /Carrito \(0\)/ }));
      expect(tienda.setCarritoAbierto).toHaveBeenCalledWith(true);
    });

    it("el carrito abierto lista los productos y permite quitarlos", () => {
      const tienda = tiendaFalsa({
        carritoAbierto: true, totalItems: 2, totalCarrito: 20000,
        resumenCarrito: [{ producto: productoDe(), cant: 2 }]
      });
      renderizar(<Header />, { tienda });
      const carrito = screen.getByRole("dialog");
      expect(within(carrito).getByText("Cantidad: 2")).toBeTruthy();
      expect(within(carrito).getByText("$20.000")).toBeTruthy();
      fireEvent.click(within(carrito).getByRole("button", { name: "Quitar Polerón de prueba del carrito" }));
      expect(tienda.quitarDelCarrito).toHaveBeenCalledWith("T001");
    });

    it("muestra el mensaje de stock cuando el contexto lo informa", () => {
      renderizar(<Header />, { tienda: tiendaFalsa({ carritoAbierto: true, mensajeCarrito: "Stock disponible de Gorro: 1 unidades." }) });
      expect(screen.getByText("Stock disponible de Gorro: 1 unidades.")).toBeTruthy();
    });

    it("el buscador lleva a /productos con el texto escrito", () => {
      renderizar(<Header />);
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "polerón" } });
      fireEvent.submit(screen.getByRole("search"));
      expect(screen.getByTestId("ubicacion").textContent).toBe("/productos?q=poler%C3%B3n");
    });

    it("el buscador sin texto lleva a /productos", () => {
      renderizar(<Header />);
      fireEvent.submit(screen.getByRole("search"));
      expect(screen.getByTestId("ubicacion").textContent).toBe("/productos");
    });
  });
});
