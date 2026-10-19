import { useState } from "react";

/** Estado de formulario con validación en vivo por campo (como la versión original):
 *  al escribir o salir de un campo se muestra solo el error de ese campo;
 *  al enviar se muestran todos. `validar(valores)` devuelve { campo: mensaje }. */
export function useFormulario(inicial, validar) {
  const [valores, setValores] = useState(inicial);
  const [errores, setErrores] = useState({});

  const revisar = (nombre, nuevos) => {
    const todos = validar(nuevos);
    setErrores((prev) => ({ ...prev, [nombre]: todos[nombre] || "" }));
  };

  const propsCampo = (nombre) => ({
    id: nombre,
    name: nombre,
    value: valores[nombre],
    "aria-invalid": errores[nombre] ? "true" : "false",
    "aria-describedby": `error-${nombre}`,
    onChange: (e) => {
      const nuevos = { ...valores, [nombre]: e.target.value };
      setValores(nuevos);
      revisar(nombre, nuevos);
    },
    onBlur: () => revisar(nombre, valores)
  });

  const cambiar = (parche) => setValores((v) => ({ ...v, ...parche }));

  /** Devuelve true si no hay errores; si los hay, los muestra y enfoca el primero. */
  const validarTodo = (formulario) => {
    const todos = validar(valores);
    setErrores(todos);
    const primero = Object.keys(todos)[0];
    if (primero) formulario?.querySelector(`[name="${primero}"]`)?.focus();
    return !primero;
  };

  return { valores, setValores, errores, setErrores, propsCampo, cambiar, validarTodo };
}
