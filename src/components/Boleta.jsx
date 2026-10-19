import { formatearPrecio, imagenProductoSegura } from "../lib/almacen";

const fecha = (iso) => new Date(iso).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });

/** Detalle de una orden (datos del cliente, entrega, productos y total). Sirve de boleta imprimible. */
export default function Boleta({ orden }) {
    const { cliente } = orden;
    return (
        <div className="boleta">
            <dl className="boleta__datos">
                <div><dt>Código de orden</dt><dd>{orden.id}</dd></div>
                <div><dt>Fecha</dt><dd>{fecha(orden.fecha)}</dd></div>
                <div><dt>Estado</dt><dd>{orden.estado}</dd></div>
                <div><dt>Cliente</dt><dd>{cliente.nombre} {cliente.apellidos}</dd></div>
                <div><dt>Correo</dt><dd>{cliente.correo}</dd></div>
                <div><dt>Dirección de entrega</dt><dd>{[cliente.direccion, cliente.comuna, cliente.region].filter(Boolean).join(", ")}</dd></div>
                {cliente.indicaciones ? <div><dt>Indicaciones</dt><dd>{cliente.indicaciones}</dd></div> : null}
            </dl>

            <table className="boleta__tabla">
                <thead>
                <tr><th>Imagen</th><th>Nombre</th><th className="numero">Precio</th><th className="numero">Cantidad</th><th className="numero">Subtotal</th></tr>
                </thead>
                <tbody>
                {orden.items.map((item) => (
                    <tr key={item.id}>
                        <td>{imagenProductoSegura(item.img) && <img src={imagenProductoSegura(item.img)} alt="" width="40" height="40" />}</td>
                        <td>{item.nombre}</td>
                        <td className="numero">${formatearPrecio(item.precio)}</td>
                        <td className="numero">{item.cantidad}</td>
                        <td className="numero">${formatearPrecio(item.precio * item.cantidad)}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <p className="boleta__total">Total {orden.estado === "Pagada" ? "pagado" : "a pagar"}: ${formatearPrecio(orden.total)}</p>
        </div>
    );
}