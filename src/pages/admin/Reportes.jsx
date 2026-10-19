import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { useAdminPagina } from "../../components/admin/AdminContext";
import { Cabecera, EstadoVacio, EstadoStock, esStockBajo, precioAdmin } from "../../components/admin/ui";

/** Reportes calculados a partir de las órdenes pagadas y el inventario. */
export default function Reportes() {
    useAdminPagina("Reportes");
    const { ordenes, productos } = useTienda();

    const { pagadas, ventasTotal, porProducto, porCategoria, rechazadas } = useMemo(() => {
        const pagadas = ordenes.filter((o) => o.estado === "Pagada");
        const categoriaDe = new Map(productos.map((p) => [p.id, p.categoria || "Sin categoría"]));
        const prod = new Map();
        const cat = new Map();
        pagadas.forEach((o) => o.items.forEach((i) => {
            const monto = i.precio * i.cantidad;
            const a = prod.get(i.id) || { id: i.id, nombre: i.nombre, unidades: 0, monto: 0 };
            a.unidades += i.cantidad; a.monto += monto; prod.set(i.id, a);
            const c = categoriaDe.get(i.id) || "Sin categoría";
            const b = cat.get(c) || { nombre: c, unidades: 0, monto: 0 };
            b.unidades += i.cantidad; b.monto += monto; cat.set(c, b);
        }));
        const ordenar = (m) => [...m.values()].sort((x, y) => y.monto - x.monto);
        return {
            pagadas, ventasTotal: pagadas.reduce((t, o) => t + o.total, 0),
            porProducto: ordenar(prod), porCategoria: ordenar(cat),
            rechazadas: ordenes.length - pagadas.length
        };
    }, [ordenes, productos]);

    const criticos = productos.filter(esStockBajo);
    const ticket = pagadas.length ? ventasTotal / pagadas.length : 0;

    const tabla = (filas, titulo) => (
        <>
            <div className="seccion-titulo"><h2>{titulo}</h2></div>
            <div className="tabla-scroll">
                {!filas.length ? <EstadoVacio texto="Aún no hay ventas registradas." icono={BarChart3} /> : (
                    <table>
                        <thead><tr><th>Nombre</th><th className="numero">Unidades</th><th className="numero">Ventas</th></tr></thead>
                        <tbody>
                        {filas.map((f) => (
                            <tr key={f.id || f.nombre}><td>{f.nombre}</td><td className="numero">{f.unidades}</td><td className="numero">{precioAdmin(f.monto)}</td></tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );

    return (
        <>
            <Cabecera titulo="Reportes" subtitulo="Ventas e inventario según los datos registrados" />
            <section className="metricas" aria-label="Indicadores de ventas">
                <div className="metrica"><span>Ventas totales</span><strong>{precioAdmin(ventasTotal)}</strong><small>Órdenes pagadas</small></div>
                <div className="metrica"><span>Órdenes pagadas</span><strong>{pagadas.length}</strong><small>{rechazadas} con pago rechazado</small></div>
                <div className="metrica"><span>Ticket promedio</span><strong>{precioAdmin(Math.round(ticket))}</strong><small>Por orden pagada</small></div>
                <div className="metrica"><span>Productos críticos</span><strong>{criticos.length}</strong><small>Stock bajo o agotado</small></div>
            </section>
            {tabla(porCategoria, "Ventas por categoría")}
            {tabla(porProducto, "Ventas por producto")}
            <div className="seccion-titulo"><h2>Productos con stock crítico</h2></div>
            <div className="tabla-scroll">
                {!criticos.length ? <EstadoVacio texto="No hay productos con stock crítico." icono={BarChart3} /> : (
                    <table>
                        <thead><tr><th>Producto</th><th className="numero">Stock</th><th className="numero">Stock crítico</th><th>Estado</th></tr></thead>
                        <tbody>
                        {criticos.map((p) => (
                            <tr key={p.id}><td>{p.nombre}</td><td className="numero">{p.stock}</td><td className="numero">{p.stockCritico ?? "—"}</td><td><EstadoStock producto={p} /></td></tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}