import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import PrecioProducto from "../components/PrecioProducto";
import { imagenProductoSegura } from "../lib/almacen";
import { useTituloPagina } from "../lib/hooks";

export default function DetalleProducto() {
  const { id } = useParams();
  const { productos, agregarAlCarrito } = useTienda();
  const [cantidad, setCantidad] = useState("1");
  const prod = productos.find((p) => p.id === id);
  const url = prod ? imagenProductoSegura(prod.img) : "";
  const noDisponible = !prod || prod.stock < 1;
  useTituloPagina(prod ? `${prod.nombre} | Tienda Mudra` : "Producto | Tienda Mudra");

  const agregar = (e) => {
    const campo = e.currentTarget.form.elements.cantidad;
    if (campo.reportValidity()) agregarAlCarrito(id, Number(cantidad));
  };

  return (
    <main className="contenedor">
      <section className="detalle-producto">
      <h2>{prod ? prod.nombre : "Producto no disponible"}</h2>
      {prod && url && <><img className="img-fluid" src={url} alt={prod.nombre} width="200" /><br /></>}
      <p><strong>Precio:</strong> {prod ? <PrecioProducto producto={prod} /> : "—"}</p>
      <p>{prod ? prod.descripcion || "Sin descripción." : "Este producto ya no está en el catálogo."}</p>
      {prod && <p>{prod.stock} unidades disponibles</p>}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="campo">
          <label className="form-label" htmlFor="p-cant">Cantidad:</label>
          <input
            className="form-control" type="number" id="p-cant" name="cantidad" min="1" max={prod?.stock}
            value={cantidad} disabled={noDisponible} onChange={(e) => setCantidad(e.target.value)}
          />
        </div>
        <button type="button" className="boton btn-agregar" disabled={noDisponible} onClick={agregar}>
          {noDisponible ? "No disponible" : "Agregar al carrito"}
        </button>
      </form>
      </section>
    </main>
  );
}
