import { fireEvent, render, screen } from "@testing-library/react";
import Campo from "./Campo";

describe("Campo (render, props y eventos)", () => {
  it("asocia la etiqueta con su control", () => {
    render(<Campo id="nombre" etiqueta="Nombre"><input id="nombre" /></Campo>);
    expect(screen.getByLabelText("Nombre").tagName).toBe("INPUT");
  });

  it("agrega las clases de Bootstrap según el tipo de control", () => {
    render(
      <>
        <Campo id="a" etiqueta="Texto"><input id="a" /></Campo>
        <Campo id="b" etiqueta="Opciones"><select id="b"><option>uno</option></select></Campo>
        <Campo id="c" etiqueta="Largo"><textarea id="c" /></Campo>
      </>
    );
    expect(screen.getByLabelText("Texto").classList.contains("form-control")).toBeTrue();
    expect(screen.getByLabelText("Opciones").classList.contains("form-select")).toBeTrue();
    expect(screen.getByLabelText("Largo").classList.contains("form-control")).toBeTrue();
  });

  it("conserva las clases que el control ya tenía", () => {
    render(<Campo id="a" etiqueta="Texto"><input id="a" className="mi-clase" /></Campo>);
    const control = screen.getByLabelText("Texto");
    expect(control.classList.contains("mi-clase")).toBeTrue();
    expect(control.classList.contains("form-control")).toBeTrue();
  });

  it("muestra el mensaje de error en un aviso accesible", () => {
    render(<Campo id="correo" etiqueta="Correo" error="Correo inválido"><input id="correo" /></Campo>);
    const aviso = screen.getByRole("alert");
    expect(aviso.textContent).toBe("Correo inválido");
    expect(aviso.id).toBe("error-correo");
  });

  it("oculta el aviso cuando no hay error", () => {
    render(<Campo id="correo" etiqueta="Correo"><input id="correo" /></Campo>);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("indica cuando el campo es opcional", () => {
    render(<Campo id="fecha" etiqueta="Fecha" opcional><input id="fecha" /></Campo>);
    expect(screen.getByText("Opcional")).toBeTruthy();
  });

  it("usa las clases de columna recibidas por la prop col", () => {
    const { container } = render(<Campo id="a" etiqueta="A" col="col-12 col-md-6"><input id="a" /></Campo>);
    expect(container.firstChild.classList.contains("col-md-6")).toBeTrue();
  });

  it("ocupa todo el ancho (col-12) cuando es completo", () => {
    const { container } = render(<Campo id="a" etiqueta="A" completo><input id="a" /></Campo>);
    expect(container.firstChild.classList.contains("col-12")).toBeTrue();
  });

  it("el control sigue enviando sus eventos al manejador recibido", () => {
    const alCambiar = jasmine.createSpy("alCambiar");
    render(<Campo id="a" etiqueta="Texto"><input id="a" onChange={alCambiar} /></Campo>);
    fireEvent.change(screen.getByLabelText("Texto"), { target: { value: "hola" } });
    expect(alCambiar).toHaveBeenCalledTimes(1);
  });
});
