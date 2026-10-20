import { Children, cloneElement, isValidElement } from "react";

/** Campo de formulario de la tienda: etiqueta + control + mensaje de error accesible.
 *  Usa clases de Bootstrap: `form-label` en la etiqueta y `form-control` / `form-select` en el control.
 *  `col` recibe las clases de columna (p. ej. "col-12 col-md-6") cuando el campo vive dentro de un `.row`. */
export default function Campo({ id, etiqueta, opcional, error, completo, col = "", children }) {
  const control = Children.map(children, (hijo) => {
    if (!isValidElement(hijo)) return hijo;
    const clase = hijo.type === "select" ? "form-select" : hijo.type === "input" || hijo.type === "textarea" ? "form-control" : "";
    return clase ? cloneElement(hijo, { className: `${hijo.props.className || ""} ${clase}`.trim() }) : hijo;
  });
  const columna = completo ? "col-12" : col;
  return (
    <div className={`campo${columna ? ` ${columna}` : ""}`}>
      <label className="form-label" htmlFor={id}>{etiqueta}{opcional && <> <span>Opcional</span></>}</label>
      {control}
      <p className="campo-error" id={`error-${id}`} role="alert" hidden={!error}>{error}</p>
    </div>
  );
}
