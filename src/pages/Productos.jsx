import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CatalogoGrid from "../components/CatalogoGrid";
import { useTienda } from "../context/TiendaContext";
import { precioFinal } from "../lib/almacen";
import { useTituloPagina } from "../lib/hooks";

const ORDENES = {
    "": "Orden original",
    "precio-asc": "Precio: menor a mayor",
    "precio-desc": "Precio: mayor a menor",
    nombre: "Nombre (A-Z)"
};
const norm = (t) => String(t ?? "").toLocaleLowerCase("es");

/** Catálogo completo con búsqueda, filtro por categoría y orden (los filtros viven en la URL). */
export default function Productos() {
    useTituloPagina("Productos | Tienda Mudra");
    const { productos, categorias } = useTienda();
    const [params, setParams] = useSearchParams();
    const q = params.get("q") || "";
    const categoria = params.get("categoria") || "";
    const orden = params.get("orden") || "";

    const cambiar = (clave, valor) => {
        const nuevos = new URLSearchParams(params);
        if (valor) nuevos.set(clave, valor); else nuevos.delete(clave);
        setParams(nuevos, { replace: true });
    };

    const visibles = useMemo(() => {
        const t = norm(q.trim());
        const lista = productos.filter((p) =>
            (!t || norm(`${p.nombre} ${p.id} ${p.material} ${p.descripcion}`).includes(t)) && (!categoria || p.categoria === categoria));
        if (orden === "precio-asc") lista.sort((a, b) => precioFinal(a) - precioFinal(b));
        if (orden === "precio-desc") lista.sort((a, b) => precioFinal(b) - precioFinal(a));
        if (orden === "nombre") lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
        return lista;
    }, [productos, q, categoria, orden]);

    return (
        <main className="contenedor">
            <div className="titulo-catalogo-box"><h2>CATÁLOGO DE PRODUCTOS</h2></div>

            <form className="filtros-catalogo" onSubmit={(e) => e.preventDefault()} aria-label="Filtros del catálogo">
                <div className="campo">
                    <label htmlFor="filtro-q">Buscar</label>
                    <input id="filtro-q" type="search" placeholder="Nombre, código o material" value={q} onChange={(e) => cambiar("q", e.target.value)} />
                </div>
                <div className="campo">
                    <label htmlFor="filtro-categoria">Categoría</label>
                    <select id="filtro-categoria" value={categoria} onChange={(e) => cambiar("categoria", e.target.value)}>
                        <option value="">Todas</option>
                        {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                </div>
                <div className="campo">
                    <label htmlFor="filtro-orden">Ordenar por</label>
                    <select id="filtro-orden" value={orden} onChange={(e) => cambiar("orden", e.target.value)}>
                        {Object.entries(ORDENES).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                    </select>
                </div>
                <p className="filtros-catalogo__conteo" role="status">{visibles.length} producto{visibles.length === 1 ? "" : "s"}</p>
            </form>

            <CatalogoGrid productos={visibles} vacio="Ningún producto coincide con tu búsqueda." />
        </main>
    );
}