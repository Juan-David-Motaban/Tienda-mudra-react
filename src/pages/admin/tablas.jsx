import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { useAdmin } from "../../components/admin/AdminContext";
import { AccionIcono, EstadoStock, ImagenAdmin, fechaAdmin, precioAdmin } from "../../components/admin/ui";

export function TablaProductos({ productos }) {
    const { esAdministrador } = useTienda();
    const { pedirEliminacion } = useAdmin();
    return (
        <table>
            <thead>
            <tr>
                <th>Producto</th><th>Categoría</th><th className="numero">Precio</th>
                <th className="numero">Stock</th><th>Disponibilidad</th><th className="numero">Acciones</th>
            </tr>
            </thead>
            <tbody>
            {productos.map((p) => {
                const id = encodeURIComponent(p.id);
                return (
                    <tr key={p.id}>
                        <td>
                            <div className="tabla-producto">
                                <ImagenAdmin producto={p} />
                                <div>
                                    <strong><Link to={`/admin/productos/${id}`}>{p.nombre}</Link></strong>
                                    <small>{p.id}</small>
                                </div>
                            </div>
                        </td>
                        <td>{p.categoria}</td>
                        <td className="numero">{precioAdmin(p.precio)}</td>
                        <td className="numero">{p.stock}</td>
                        <td><EstadoStock producto={p} /></td>
                        <td>
                            <div className="acciones-fila">
                                <AccionIcono to={`/admin/productos/${id}`} texto="Ver producto" icono={Eye} />
                                {esAdministrador && (
                                    <>
                                        <AccionIcono to={`/admin/productos/${id}/editar`} texto="Editar producto" icono={Pencil} />
                                        <button
                                            type="button" className="boton-icono boton-icono--peligro" aria-label="Eliminar producto"
                                            data-tooltip="Eliminar producto" onClick={(e) => pedirEliminacion("producto", p.id, e.currentTarget)}
                                        ><Trash2 aria-hidden="true" /></button>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}

export function TablaUsuarios({ usuarios }) {
    const { sesion } = useTienda();
    const { pedirEliminacion } = useAdmin();
    return (
        <table>
            <thead>
            <tr><th>Usuario</th><th>RUN</th><th>Correo</th><th>Perfil</th><th className="numero">Acciones</th></tr>
            </thead>
            <tbody>
            {usuarios.map((u) => {
                const run = encodeURIComponent(u.run);
                return (
                    <tr key={u.run}>
                        <td>
                            <div className="tabla-producto">
                                <span className="avatar">{u.nombre.slice(0, 1).toUpperCase()}</span>
                                <strong>{u.nombre} {u.apellidos}</strong>
                            </div>
                        </td>
                        <td>{u.run}</td>
                        <td>{u.correo}</td>
                        <td><span className="etiqueta etiqueta--azul">{u.rol || "Cliente"}</span></td>
                        <td>
                            <div className="acciones-fila">
                                <AccionIcono to={`/admin/usuarios/${run}`} texto="Ver usuario" icono={Eye} />
                                <AccionIcono to={`/admin/usuarios/${run}/editar`} texto="Editar usuario" icono={Pencil} />
                                {sesion?.run !== u.run && (
                                    <button
                                        className="boton-icono boton-icono--peligro" type="button" aria-label="Eliminar usuario"
                                        data-tooltip="Eliminar usuario" onClick={(e) => pedirEliminacion("usuario", u.run, e.currentTarget)}
                                    ><Trash2 aria-hidden="true" /></button>
                                )}
                            </div>
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}

export function TablaOrdenes({ ordenes }) {
    return (
        <table>
            <thead>
            <tr>
                <th>Orden</th><th>Cliente</th><th>Fecha</th><th>Estado</th>
                <th className="numero">Total</th><th className="numero">Detalle</th>
            </tr>
            </thead>
            <tbody>
            {ordenes.map((o) => (
                <tr key={o.id}>
                    <td><Link to={`/admin/ordenes/${encodeURIComponent(o.id)}`}>{o.id}</Link></td>
                    <td>{o.cliente.nombre} {o.cliente.apellidos}</td>
                    <td>{fechaAdmin(o.fecha)}</td>
                    <td><span className={`etiqueta etiqueta--${o.estado === "Pagada" ? "verde" : "rojo"}`}>{o.estado}</span></td>
                    <td className="numero">{precioAdmin(o.total)}</td>
                    <td className="numero"><AccionIcono to={`/admin/ordenes/${encodeURIComponent(o.id)}`} texto="Ver orden" icono={Eye} /></td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}