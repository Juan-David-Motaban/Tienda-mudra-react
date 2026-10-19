/** Campo de formulario de la tienda: etiqueta + control + mensaje de error accesible. */
export default function Campo({ id, etiqueta, opcional, error, completo, children }) {
  return (
    <div className={`campo${completo ? " campo--completo" : ""}`}>
      <label htmlFor={id}>{etiqueta}{opcional && <> <span>Opcional</span></>}</label>
      {children}
      <p className="campo-error" id={`error-${id}`} role="alert" hidden={!error}>{error}</p>
    </div>
  );
}
