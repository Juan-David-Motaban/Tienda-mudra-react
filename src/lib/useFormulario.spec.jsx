import { act, renderHook } from "@testing-library/react";
import { useFormulario } from "./useFormulario";

const inicial = { nombre: "", edad: "" };
const validar = (v) => {
  const e = {};
  if (!v.nombre.trim()) e.nombre = "Obligatorio";
  if (v.edad !== "" && Number(v.edad) < 18) e.edad = "Debe ser mayor de edad";
  return e;
};
const montar = () => renderHook(() => useFormulario(inicial, validar));

describe("useFormulario (estado y eventos de formulario)", () => {
  it("parte con los valores iniciales y sin errores", () => {
    const { result } = montar();
    expect(result.current.valores).toEqual(inicial);
    expect(result.current.errores).toEqual({});
  });

  it("propsCampo entrega los atributos que enlazan un control con el estado", () => {
    const { result } = montar();
    const props = result.current.propsCampo("nombre");
    expect(props.id).toBe("nombre");
    expect(props.name).toBe("nombre");
    expect(props.value).toBe("");
    expect(props["aria-invalid"]).toBe("false");
    expect(props["aria-describedby"]).toBe("error-nombre");
  });

  it("onChange actualiza el valor y valida solo ese campo", () => {
    const { result } = montar();
    act(() => { result.current.propsCampo("edad").onChange({ target: { value: "10" } }); });
    expect(result.current.valores.edad).toBe("10");
    expect(result.current.errores.edad).toBe("Debe ser mayor de edad");
    expect(result.current.errores.nombre).toBeUndefined();
  });

  it("el error desaparece cuando el valor pasa a ser válido", () => {
    const { result } = montar();
    act(() => { result.current.propsCampo("edad").onChange({ target: { value: "10" } }); });
    act(() => { result.current.propsCampo("edad").onChange({ target: { value: "30" } }); });
    expect(result.current.errores.edad).toBe("");
    expect(result.current.propsCampo("edad")["aria-invalid"]).toBe("false");
  });

  it("onBlur muestra el error de un campo obligatorio vacío", () => {
    const { result } = montar();
    act(() => { result.current.propsCampo("nombre").onBlur(); });
    expect(result.current.errores.nombre).toBe("Obligatorio");
    expect(result.current.propsCampo("nombre")["aria-invalid"]).toBe("true");
  });

  it("cambiar aplica un parche sobre varios valores a la vez", () => {
    const { result } = montar();
    act(() => { result.current.cambiar({ nombre: "Ana", edad: "20" }); });
    expect(result.current.valores).toEqual({ nombre: "Ana", edad: "20" });
  });

  it("validarTodo devuelve false, muestra todos los errores y enfoca el primer campo inválido", () => {
    const { result } = montar();
    const formulario = document.createElement("form");
    const campo = document.createElement("input");
    campo.name = "nombre";
    formulario.appendChild(campo);
    spyOn(campo, "focus");

    let valido;
    act(() => { valido = result.current.validarTodo(formulario); });

    expect(valido).toBeFalse();
    expect(result.current.errores.nombre).toBe("Obligatorio");
    expect(campo.focus).toHaveBeenCalled();
  });

  it("validarTodo devuelve true cuando los datos son válidos", () => {
    const { result } = montar();
    act(() => { result.current.cambiar({ nombre: "Ana" }); });
    let valido;
    act(() => { valido = result.current.validarTodo(null); });
    expect(valido).toBeTrue();
    expect(result.current.errores).toEqual({});
  });
});
