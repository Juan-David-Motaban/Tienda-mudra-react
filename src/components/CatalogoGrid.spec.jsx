import { fireEvent, screen, within } from "@testing-library/react";
import CatalogoGrid from "./CatalogoGrid";
import { productoDe, renderizar, tiendaFalsa } from "../testing/ayudas";

const productos = [
  productoDe({ id: "A1", nombre: "Polerón", precio: 10000, precioOferta: 7000 }),
  productoDe({ id: "B2", nombre: "Gorro", precio: 3000, stock: 0 }),
  productoDe({ id: "C3", nombre: "Jeans", precio: 20000 })
];

describe("CatalogoGrid", () => {
  let tienda;
  beforeEach(() => { tienda = tiendaFalsa({ productos }); });

  describe("render y props", () => {
    it("muestra una tarjeta por cada producto del catálogo", () => {
      renderizar(<CatalogoGrid />, { tienda });
      expect(screen.getAllByRole("article").length).toBe(3);
    });

    it("la prop limite recorta la cantidad de tarjetas", () => {
      renderizar(<CatalogoGrid limite={2} />, { tienda });
      expect(screen.getAllByRole("article").length).toBe(2);
    });

    it("la prop productos reemplaza al catálogo completo", () => {
      renderizar(<CatalogoGrid productos={[productos[2]]} />, { tienda });
      expect(screen.getAllByRole("article").length).toBe(1);
      expect(screen.getByText("Jeans")).toBeTruthy();
    });

    it("muestra el mensaje recibido cuando no hay productos", () => {
      renderizar(<CatalogoGrid productos={[]} vacio="Nada por aquí" />, { tienda });
      expect(screen.queryAllByRole("article").length).toBe(0);
      expect(screen.getByText("Nada por aquí")).toBeTruthy();
    });

    it("marca con la etiqueta Oferta solo los productos con precio rebajado", () => {
      renderizar(<CatalogoGrid />, { tienda });
      expect(screen.getAllByText("Oferta").length).toBe(1);
    });

    it("deshabilita el botón de un producto agotado", () => {
      renderizar(<CatalogoGrid />, { tienda });
      expect(screen.getByRole("button", { name: "Agotado" }).disabled).toBeTrue();
      expect(screen.getAllByRole("button", { name: "Agregar al carrito" }).length).toBe(2);
    });

    it("la grilla usa las clases responsivas de Bootstrap", () => {
      const { container } = renderizar(<CatalogoGrid />, { tienda });
      const grilla = container.querySelector(".catalogo-grid");
      expect(grilla.classList.contains("row")).toBeTrue();
      expect(grilla.classList.contains("row-cols-lg-4")).toBeTrue();
    });
  });

  describe("eventos", () => {
    it("Agregar al carrito llama a la acción del contexto con el id del producto", () => {
      renderizar(<CatalogoGrid />, { tienda });
      fireEvent.click(screen.getAllByRole("button", { name: "Agregar al carrito" })[0]);
      expect(tienda.agregarAlCarrito).toHaveBeenCalledWith("A1");
    });

    it("la vista rápida se abre y muestra el detalle del producto", () => {
      renderizar(<CatalogoGrid />, { tienda });
      expect(screen.queryByRole("dialog")).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Vista rápida de Polerón" }));
      const dialogo = screen.getByRole("dialog");
      expect(within(dialogo).getByRole("heading", { name: "Polerón" })).toBeTruthy();
      expect(document.body.classList.contains("modal-abierta")).toBeTrue();
    });

    it("la vista rápida se cierra con el botón de cerrar", () => {
      renderizar(<CatalogoGrid />, { tienda });
      fireEvent.click(screen.getByRole("button", { name: "Vista rápida de Polerón" }));
      fireEvent.click(screen.getByRole("button", { name: "Cerrar vista rápida" }));
      expect(screen.queryByRole("dialog")).toBeNull();
      expect(document.body.classList.contains("modal-abierta")).toBeFalse();
    });

    it("la vista rápida se cierra con la tecla Escape", () => {
      renderizar(<CatalogoGrid />, { tienda });
      fireEvent.click(screen.getByRole("button", { name: "Vista rápida de Polerón" }));
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("desde la vista rápida se agrega la cantidad elegida (estado del input)", () => {
      renderizar(<CatalogoGrid />, { tienda });
      fireEvent.click(screen.getByRole("button", { name: "Vista rápida de Polerón" }));
      const dialogo = screen.getByRole("dialog");
      fireEvent.change(within(dialogo).getByLabelText("Cantidad"), { target: { value: "3" } });
      fireEvent.click(within(dialogo).getByRole("button", { name: "Agregar al carrito" }));
      expect(tienda.agregarAlCarrito).toHaveBeenCalledWith("A1", 3);
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
