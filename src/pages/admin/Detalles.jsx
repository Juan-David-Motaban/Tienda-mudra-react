import { useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import Boleta from "../../components/Boleta";
import { TablaOrdenes } from "./tablas";
import { useTienda } from "../../context/TiendaContext";
import { useAdminPagina } from "../../components/admin/AdminContext";
import {
  Cabecera, DatosDetalle, EnlaceAdmin, EstadoStock, EstadoVacio, ImagenAdmin, NoEncontrado, fechaAdmin, precioAdmin
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
      <div className="row g-4">
        <div className="col-12 col-md-5 col-lg-4"><div className="imagen-preview"><ImagenAdmin producto={p} grande /></div></div>
        <section className="col-12 col-md-7 col-lg-8">
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
  const { usuarios, ordenes } = useTienda();
  const u = usuarios.find((x) => x.run === run);
  if (!u) return <NoEncontrado tipo="usuario" volver="/admin/usuarios" />;
  // Las órdenes guardan el correo del comprador: así se relacionan con la cuenta.
  const historial = ordenes.filter((o) => o.cliente.correo?.toLowerCase() === u.correo.toLowerCase());
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
      <div className="seccion-titulo"><h2>Historial de compras</h2><strong>{historial.length} orden{historial.length === 1 ? "" : "es"}</strong></div>
      <div className="tabla-scroll table-responsive">
        {historial.length ? <TablaOrdenes ordenes={historial} /> : <EstadoVacio texto="Este usuario aún no tiene compras." icono={ReceiptText} />}
      </div>
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
      <Cabecera titulo={o.id} subtitulo={`Boleta · ${fechaAdmin(o.fecha)}`}>
        <EnlaceAdmin to="/admin/ordenes" icono={ArrowLeft}>Volver</EnlaceAdmin>
        <button type="button" className="boton-admin boton-admin--primario" onClick={() => window.print()}>
          <Printer aria-hidden="true" />Imprimir boleta
        </button>
      </Cabecera>
      <Boleta orden={o} />
    </>
  );
}
