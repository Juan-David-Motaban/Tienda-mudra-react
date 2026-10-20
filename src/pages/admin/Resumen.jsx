import { Link } from "react-router-dom";
import { Boxes, CircleCheck, Package, Plus, ReceiptText, TriangleAlert, Users, Wallet } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { useAdminPagina } from "../../components/admin/AdminContext";
import { Cabecera, EnlaceAdmin, EstadoVacio, esStockBajo, precioAdmin } from "../../components/admin/ui";
import { TablaProductos, TablaOrdenes } from "./tablas";

export default function Resumen() {
  useAdminPagina("Resumen");
  const { productos, ordenes, usuarios } = useTienda();
  const pagadas = ordenes.filter((o) => o.estado === "Pagada");
  const bajos = productos.filter(esStockBajo);
  const metricas = [
    ["Productos", productos.length, "En el catálogo", Package],
    ["Unidades", productos.reduce((t, p) => t + p.stock, 0), "En inventario", Boxes],
    ["Stock bajo", bajos.length, "Productos por revisar", TriangleAlert],
    ["Órdenes", ordenes.length, `${pagadas.length} pagadas`, ReceiptText],
    ["Ventas", precioAdmin(pagadas.reduce((t, o) => t + o.total, 0)), "Órdenes pagadas", Wallet],
    ["Usuarios", usuarios.length, "Cuentas registradas", Users]
  ];
  return (
    <>
      <Cabecera titulo="Resumen de la tienda" subtitulo="Inventario y actividad reciente">
        <EnlaceAdmin to="/admin/productos/nuevo" icono={Plus} primario>Nuevo producto</EnlaceAdmin>
      </Cabecera>
      <section className="metricas" aria-label="Resumen de actividad">
        <div className="row row-cols-2 row-cols-md-3 row-cols-xl-6 g-3">
          {metricas.map(([texto, numero, descripcion, Icono]) => (
            <div className="col" key={texto}>
              <div className="metrica">
                <span><Icono aria-hidden="true" />{texto}</span>
                <strong>{numero}</strong>
                <small>{descripcion}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="seccion-titulo"><h2>Atención al inventario</h2><Link to="/admin/productos/criticos">Ver productos críticos</Link></div>
      <div className="tabla-scroll table-responsive">
        {bajos.length ? <TablaProductos productos={bajos} /> : <EstadoVacio texto="El inventario está sobre los niveles críticos." icono={CircleCheck} />}
      </div>
      <div className="seccion-titulo"><h2>Últimas órdenes</h2><Link to="/admin/ordenes">Ver órdenes</Link></div>
      <div className="tabla-scroll table-responsive">
        {ordenes.length ? <TablaOrdenes ordenes={ordenes.slice(0, 5)} /> : <EstadoVacio texto="Aún no hay órdenes registradas." icono={ReceiptText} />}
      </div>
    </>
  );
}
