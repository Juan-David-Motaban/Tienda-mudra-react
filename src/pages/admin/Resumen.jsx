import { Link } from "react-router-dom";
import { Boxes, CircleCheck, Package, Plus, ReceiptText, TriangleAlert } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { useAdminPagina } from "../../components/admin/AdminContext";
import { Cabecera, EnlaceAdmin, EstadoVacio, esStockBajo } from "../../components/admin/ui";
import { TablaProductos, TablaOrdenes } from "./tablas";

export default function Resumen() {
  useAdminPagina("Resumen");
  const { productos, ordenes } = useTienda();
  const bajos = productos.filter(esStockBajo);
  const metricas = [
    ["Productos", productos.length, "En el catálogo", Package],
    ["Unidades", productos.reduce((t, p) => t + p.stock, 0), "En inventario", Boxes],
    ["Stock bajo", bajos.length, "Productos por revisar", TriangleAlert],
    ["Órdenes", ordenes.length, "Compras registradas", ReceiptText]
  ];
  return (
    <>
      <Cabecera titulo="Resumen de la tienda" subtitulo="Inventario y actividad reciente">
        <EnlaceAdmin to="/admin/productos/nuevo" icono={Plus} primario>Nuevo producto</EnlaceAdmin>
      </Cabecera>
      <section className="metricas" aria-label="Resumen de actividad">
        {metricas.map(([texto, numero, descripcion, Icono]) => (
          <div className="metrica" key={texto}>
            <span><Icono aria-hidden="true" />{texto}</span>
            <strong>{numero}</strong>
            <small>{descripcion}</small>
          </div>
        ))}
      </section>
      <div className="seccion-titulo"><h2>Atención al inventario</h2><Link to="/admin/productos">Ver productos</Link></div>
      <div className="tabla-scroll">
        {bajos.length ? <TablaProductos productos={bajos} /> : <EstadoVacio texto="El inventario está sobre los niveles críticos." icono={CircleCheck} />}
      </div>
      <div className="seccion-titulo"><h2>Últimas órdenes</h2><Link to="/admin/ordenes">Ver órdenes</Link></div>
      <div className="tabla-scroll">
        {ordenes.length ? <TablaOrdenes ordenes={ordenes.slice(0, 5)} /> : <EstadoVacio texto="Aún no hay órdenes registradas." icono={ReceiptText} />}
      </div>
    </>
  );
}
