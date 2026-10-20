import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useTienda } from "../context/TiendaContext";
import { enOferta, imagenProductoSegura } from "../lib/almacen";
import PrecioProducto from "./PrecioProducto";
import { useClaseBody } from "../lib/hooks";

function VistaRapida({ producto, onCerrar }) {
  const { agregarAlCarrito } = useTienda();
  const [cantidad, setCantidad] = useState("1");
  const cerrarRef = useRef(null);
  const enfocadoAntes = useRef(document.activeElement);
  const agotado = producto.stock < 1;
  const url = imagenProductoSegura(producto.img);

  useClaseBody("modal-abierta");

  useEffect(() => {
    cerrarRef.current?.focus();
    const previo = enfocadoAntes.current;
    const alTecla = (e) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", alTecla);
    return () => {
      document.removeEventListener("keydown", alTecla);
      if (previo && document.contains(previo)) previo.focus();
    };
  }, [onCerrar]);

  const agregar = (e) => {
    const campo = e.currentTarget.form?.elements.cantidad;
    if (campo && !campo.reportValidity()) return;
    if (!cantidad || !Number.isInteger(Number(cantidad))) return;
    onCerrar();
    agregarAlCarrito(producto.id, Number(cantidad));
  };

  return (
    <div className="producto-modal" id="producto-modal">
      <div className="producto-modal__fondo" onClick={onCerrar} aria-hidden="true" />
      <section className="producto-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="producto-modal-titulo">
        <button ref={cerrarRef} className="producto-modal__cerrar" type="button" onClick={onCerrar} aria-label="Cerrar vista rápida">
          <X aria-hidden="true" />
        </button>
        <div className="producto-modal__contenido">
          <div className="producto-modal__imagen">
            <img className="img-fluid" src={url || undefined} alt={producto.nombre} />
          </div>
          <form className="producto-modal__informacion" onSubmit={(e) => e.preventDefault()}>
            <p className="producto-modal__codigo">Código: {producto.id}</p>
            <h2 id="producto-modal-titulo">{producto.nombre}</h2>
            <p className="producto-modal__precio"><PrecioProducto producto={producto} /></p>
            <p className="producto-modal__detalle">{producto.descripcion || "Sin descripción."}</p>
            <dl className="producto-modal__datos">
              <div><dt>Material</dt><dd>{producto.material || "No especificado"}</dd></div>
              <div><dt>Disponibilidad</dt><dd>{producto.stock} unidades disponibles</dd></div>
            </dl>
            <label className="producto-modal__cantidad-label" htmlFor="producto-modal-cantidad">Cantidad</label>
            <input
              id="producto-modal-cantidad" name="cantidad" type="number" min="1" max={producto.stock}
              value={cantidad} disabled={agotado} onChange={(e) => setCantidad(e.target.value)}
            />
            <button className="boton btn-agregar producto-modal__agregar" type="button" disabled={agotado} onClick={agregar}>
              {agotado ? "Agotado" : "Agregar al carrito"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

/** Grilla de productos con tarjeta, botón de agregar y vista rápida (modal). */
/** `productos` (opcional) permite mostrar una lista ya filtrada; por defecto, todo el catálogo. */
export default function CatalogoGrid({ limite, productos: lista, vacio = "No hay productos disponibles." }) {
  const { productos: todos, agregarAlCarrito } = useTienda();
  const productos = lista ?? todos;
  const [vistaId, setVistaId] = useState(null);
  const visibles = limite ? productos.slice(0, limite) : productos;
  const enVista = todos.find((p) => p.id === vistaId);

  return (
    <>
      <section className="catalogo-grid row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 mb-5">
        {visibles.map((p) => {
          const url = imagenProductoSegura(p.img);
          return (
            <div className="col" key={p.id}>
            <article className="producto-card h-100">
              <div className="img-box">
                {enOferta(p) && <span className="etiqueta-oferta">Oferta</span>}
                <img src={url || undefined} alt={p.nombre} />
                <button
                  type="button" className="btn-vista-rapida" data-tooltip="Vista rápida"
                  aria-label={`Vista rápida de ${p.nombre}`} onClick={() => setVistaId(p.id)}
                >
                  <Search aria-hidden="true" />
                </button>
              </div>
              <h4><Link to={`/productos/${encodeURIComponent(p.id)}`}>{p.nombre}</Link></h4>
              <div className="detalles-card">
                <span className="attributes">{p.material || p.categoria}</span>
                <span className="precio"><PrecioProducto producto={p} /></span>
              </div>
              <button className="btn-agregar" type="button" disabled={p.stock < 1} onClick={() => agregarAlCarrito(p.id)}>
                {p.stock < 1 ? "Agotado" : "Agregar al carrito"}
              </button>
            </article>
            </div>
          );
        })}
        {!productos.length && <div className="col-12 w-100"><p className="catalogo-vacio">{vacio}</p></div>}
      </section>
      {enVista && <VistaRapida producto={enVista} onCerrar={() => setVistaId(null)} />}
    </>
  );
}
