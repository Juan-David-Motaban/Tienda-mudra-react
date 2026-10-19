import { useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { useAdminPagina } from "../../components/admin/AdminContext";
import {
  Cabecera, DatosDetalle, EnlaceAdmin, EstadoStock, ImagenAdmin, NoEncontrado, fechaAdmin, precioAdmin
} from "../../components/admin/ui";

export function DetalleProductoAdmin() {
  useAdminPagina("Detalle de producto");
  const { id } = useParams();
  const { productos, esAdministrador } = useTienda();
  const p = productos.find((x) => x.id === id);
  if (!p) return <NoEncontrado tipo="producto" volver="/admin/productos" />;
  return (
    <>
      <Cabecera titulo={p.nombre} subtitulo={p.id}>
        <EnlaceAdmin to="/admin/productos" icono={ArrowLeft}>Volver</EnlaceAdmin>
        {esAdministrador && <EnlaceAdmin to={`/admin/productos/${encodeURIComponent(p.id)}/editar`} icono={Pencil} primario>Editar producto</EnlaceAdmin>}
      </Cabecera>
      <div className="detalle-layout">
        <div className="imagen-preview"><ImagenAdmin producto={p} grande /></div>
        <section>
          <EstadoStock producto={p} />
          <DatosDetalle pares={[
            ["Precio", precioAdmin(p.precio)], ["Categoría", p.categoria], ["Stock", String(p.stock)],
            ["Stock crítico", p.stockCritico == null ? "No definido" : String(p.stockCritico)], ["Material", p.material]
          ]} />
          <p className="texto-detalle">{p.descripcion || "Sin descripción."}</p>
        </section>
      </div>
    </>
  );
}

export function DetalleUsuarioAdmin() {
  useAdminPagina("Detalle de usuario");
  const { run } = useParams();
  const { usuarios } = useTienda();
  const u = usuarios.find((x) => x.run === run);
  if (!u) return <NoEncontrado tipo="usuario" volver="/admin/usuarios" />;
  return (
    <>
      <Cabecera titulo={`${u.nombre} ${u.apellidos}`} subtitulo={u.rol || "Cliente"}>
        <EnlaceAdmin to="/admin/usuarios" icono={ArrowLeft}>Volver</EnlaceAdmin>
        <EnlaceAdmin to={`/admin/usuarios/${encodeURIComponent(u.run)}/editar`} icono={Pencil} primario>Editar usuario</EnlaceAdmin>
      </Cabecera>
      <DatosDetalle pares={[
        ["RUN", u.run], ["Correo", u.correo], ["Fecha de nacimiento", u.fechaNacimiento || "No indicada"],
        ["Perfil", u.rol || "Cliente"], ["Región", u.region], ["Comuna", u.comuna], ["Dirección", u.direccion]
      ]} />
    </>
  );
}

export function DetalleOrdenAdmin() {
  useAdminPagina("Detalle de orden");
  const { id } = useParams();
  const { ordenes } = useTienda();
  const o = ordenes.find((x) => x.id === id);
  if (!o) return <NoEncontrado tipo="orden" volver="/admin/ordenes" />;
  return (
    <>
      <Cabecera titulo={o.id} subtitulo={fechaAdmin(o.fecha)}>
        <EnlaceAdmin to="/admin/ordenes" icono={ArrowLeft}>Volver</EnlaceAdmin>
      </Cabecera>
      <DatosDetalle pares={[
        ["Cliente", `${o.cliente.nombre} ${o.cliente.apellidos}`], ["Correo", o.cliente.correo],
        ["Entrega", [o.cliente.direccion, o.cliente.comuna, o.cliente.region].join(", ")], ["Estado", o.estado]
      ]} />
      <div className="seccion-titulo"><h2>Productos</h2><strong>Total: {precioAdmin(o.total)}</strong></div>
      <div className="tabla-scroll">
        <table>
          <thead>
            <tr><th>Producto</th><th className="numero">Precio</th><th className="numero">Cantidad</th><th className="numero">Subtotal</th></tr>
          </thead>
          <tbody>
            {o.items.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td className="numero">{precioAdmin(item.precio)}</td>
                <td className="numero">{item.cantidad}</td>
                <td className="numero">{precioAdmin(item.precio * item.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
