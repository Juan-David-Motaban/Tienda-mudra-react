import { enOferta, formatearPrecio, precioFinal } from "../lib/almacen";

/** Muestra el precio vigente; si hay oferta, tacha el precio normal. */
export default function PrecioProducto({ producto }) {
    if (!enOferta(producto)) return <>${formatearPrecio(producto.precio)}</>;
    return (
        <>
            <del className="precio-tachado" aria-label="Precio normal">${formatearPrecio(producto.precio)}</del>{" "}
            <span className="precio-oferta" aria-label="Precio de oferta">${formatearPrecio(precioFinal(producto))}</span>
        </>
    );
}