import { fireEvent, screen } from "@testing-library/react";
import Registro from "./Registro";
import { MSG_CORREO } from "../lib/validaciones";
import { renderizar, tiendaFalsa } from "../testing/ayudas";

const escribir = (etiqueta, valor) => fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });

function completarFormulario() {
  escribir("RUN", "123456785");
  escribir("Nombre", "Ana");
  escribir("Apellidos", "Pérez");
  escribir("Correo electrónico", "ana@duoc.cl");
  escribir("Contraseña", "abcd");
  escribir("Región", "Región Metropolitana");
  escribir("Comuna", "Santiago");
  escribir("Dirección", "Calle 1");
}

describe("Registro", () => {
  let tienda;
  beforeEach(() => { tienda = tiendaFalsa(); });

  it("muestra los campos del formulario y el acceso a iniciar sesión", () => {
    renderizar(<Registro />, { tienda });
    ["RUN", "Nombre", "Apellidos", "Correo electrónico", "Contraseña", "Región", "Comuna", "Dirección"]
      .forEach((etiqueta) => expect(screen.getByLabelText(etiqueta)).toBeTruthy());
    expect(screen.getByRole("link", { name: "Inicia sesión" })).toBeTruthy();
  });

  it("al enviar vacío muestra un error por campo obligatorio y no registra", () => {
    const { container } = renderizar(<Registro />, { tienda });
    fireEvent.submit(container.querySelector("form"));
    expect(screen.getAllByRole("alert").length).toBe(8);
    expect(tienda.registrarCliente).not.toHaveBeenCalled();
    expect(document.activeElement.name).toBe("run");
  });

  it("valida el RUN mientras se escribe", () => {
    renderizar(<Registro />, { tienda });
    escribir("RUN", "123");
    expect(screen.getByText("Ingresa un RUN válido, sin puntos ni guión.")).toBeTruthy();
    expect(screen.getByLabelText("RUN").getAttribute("aria-invalid")).toBe("true");
    escribir("RUN", "123456785");
    expect(screen.queryByText("Ingresa un RUN válido, sin puntos ni guión.")).toBeNull();
  });

  it("rechaza correos de dominios no permitidos", () => {
    renderizar(<Registro />, { tienda });
    escribir("Correo electrónico", "ana@hotmail.com");
    expect(screen.getByText(MSG_CORREO)).toBeTruthy();
  });

  it("al elegir una región carga sus comunas", () => {
    renderizar(<Registro />, { tienda });
    expect(screen.getByText("Selecciona una región primero")).toBeTruthy();
    escribir("Región", "Región Metropolitana");
    expect(screen.getByRole("option", { name: "Maipú" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Valparaíso" })).toBeNull();
  });

  it("al cambiar de región se reinicia la comuna elegida", () => {
    const { container } = renderizar(<Registro />, { tienda });
    completarFormulario();
    escribir("Región", "Región de Valparaíso");
    // El estado debe quedar sin comuna: al enviar se exige elegir una de la nueva región.
    fireEvent.submit(container.querySelector("form"));
    expect(screen.getByText("Selecciona una comuna.")).toBeTruthy();
    expect(tienda.registrarCliente).not.toHaveBeenCalled();
  });

  it("con datos válidos registra al cliente y redirige al inicio de sesión", () => {
    const { container } = renderizar(<Registro />, { tienda });
    completarFormulario();
    fireEvent.submit(container.querySelector("form"));
    expect(tienda.registrarCliente).toHaveBeenCalledWith(jasmine.objectContaining({
      run: "123456785", correo: "ana@duoc.cl", region: "Región Metropolitana", comuna: "Santiago"
    }));
    expect(screen.getByTestId("ubicacion").textContent).toBe("/iniciosesion?registro=ok");
  });

  it("muestra el error que devuelve el contexto (por ejemplo, correo ya registrado)", () => {
    tienda.registrarCliente.and.returnValue({ errores: { correo: "Ya existe una cuenta con este correo." } });
    const { container } = renderizar(<Registro />, { tienda });
    completarFormulario();
    fireEvent.submit(container.querySelector("form"));
    expect(screen.getByText("Ya existe una cuenta con este correo.")).toBeTruthy();
    expect(screen.getByTestId("ubicacion").textContent).toBe("/");
  });
});
