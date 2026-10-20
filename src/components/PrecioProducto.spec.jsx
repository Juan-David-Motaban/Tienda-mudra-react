import { render, screen } from "@testing-library/react";
import PrecioProducto from "./PrecioProducto";

describe("PrecioProducto (render según props)", () => {
  it("muestra solo el precio normal cuando no hay oferta", () => {
    const { container } = render(<PrecioProducto producto={{ precio: 29990, precioOferta: null }} />);
    expect(container.textContent).toBe("$29.990");
    expect(container.querySelector("del")).toBeNull();
  });

  it("tacha el precio normal y destaca el de oferta", () => {
    render(<PrecioProducto producto={{ precio: 34990, precioOferta: 27990 }} />);
    expect(screen.getByLabelText("Precio normal").tagName).toBe("DEL");
    expect(screen.getByLabelText("Precio normal").textContent).toBe("$34.990");
    expect(screen.getByLabelText("Precio de oferta").textContent).toBe("$27.990");
  });

  it("ignora una oferta que no es menor que el precio normal", () => {
    const { container } = render(<PrecioProducto producto={{ precio: 10000, precioOferta: 10000 }} />);
    expect(container.textContent).toBe("$10.000");
  });
});
