import { Link } from "react-router-dom";
import { ArrowLeft as ArrowLeftIcon, Image } from "lucide-react";
import { imagenProductoSegura } from "../../lib/almacen";

export const precioAdmin = (precio) =>
  "$" + Number(precio).toLocaleString("es-CL", { maximumFractionDigits: 2 });

export const fechaAdmin = (fecha) =>
  new Date(fecha).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

export function EnlaceAdmin({ to, icono: Icono, primario, children }) {
  return (
    <Link className={`boton-admin${primario ? " boton-admin--primario" : ""}`} to={to}>
      {Icono && <Icono aria-hidden="true" />}{children}
    </Link>
  );
}

export function AccionIcono({ to, texto, icono: Icono }) {
  return (
    <Link className="boton-icono" to={to} aria-label={texto} data-tooltip={texto}>
      <Icono aria-hidden="true" />
    </Link>
  );
}

export function Cabecera({ titulo, subtitulo, children }) {
  return (
    <div className="encabezado-pagina">
      <div>
        <h1>{titulo}</h1>
        {subtitulo ? <p>{subtitulo}</p> : null}
      </div>
      <div className="encabezado-acciones">{children}</div>
    </div>
  );
}

export function ImagenAdmin({ producto, grande }) {
  const url = imagenProductoSegura(producto.img);
  return url
    ? <img src={url} alt={producto.nombre} loading={grande ? undefined : "lazy"} />
    : <span className="imagen-vacia"><Image aria-hidden="true" /></span>;
}

export function EstadoVacio({ texto, icono: Icono }) {
  return (
    <div className="estado-vacio">
      <Icono aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}

export function EstadoStock({ producto }) {
  if (producto.stock === 0) return <span className="etiqueta etiqueta--rojo">Agotado</span>;
  if (producto.stockCritico != null && producto.stock <= producto.stockCritico) return <span className="etiqueta etiqueta--amarillo">Stock bajo</span>;
  return <span className="etiqueta etiqueta--verde">Disponible</span>;
}

export const esStockBajo = (p) => p.stock === 0 || (p.stockCritico != null && p.stock <= p.stockCritico);

export function DatosDetalle({ pares }) {
  return (
    <dl className="detalle-datos">
      {pares.map(([etiqueta, valor]) => (
        <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor || "Sin información"}</dd></div>
      ))}
    </dl>
  );
}

export function NoEncontrado({ tipo, volver }) {
  return (
    <Cabecera titulo="Registro no encontrado" subtitulo={`Este ${tipo} ya no está disponible.`}>
      <EnlaceAdmin to={volver} icono={ArrowLeftIcon}>Volver al listado</EnlaceAdmin>
    </Cabecera>
  );
}

/** Campo de formulario del panel (etiqueta + control + error). */
export function CampoAdmin({ nombre, etiqueta, error, opcional, ancho, nota, children }) {
  const id = `admin-${nombre}`;
  return (
    <div className={`campo-admin${ancho ? " campo-admin--ancho" : ""}`}>
      <label htmlFor={id}>
        {etiqueta}
        {opcional && <small>Opcional</small>}
        {nota && <small>{nota}</small>}
      </label>
      {children}
      <p className="campo-error" id={`error-${id}`} hidden={!error}>{error}</p>
    </div>
  );
}

/** Props comunes de un control de formulario del panel, enlazadas a useFormulario. */
export const propsControl = (f, nombre, extra = {}) => ({
  ...f.propsCampo(nombre),
  id: `admin-${nombre}`,
  "aria-describedby": `error-admin-${nombre}`,
  className: "control",
  ...extra
});
