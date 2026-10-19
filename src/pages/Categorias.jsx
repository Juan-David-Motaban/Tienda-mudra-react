import { Link, useParams } from "react-router-dom";
import CatalogoGrid from "../components/CatalogoGrid";
import { useTienda } from "../context/TiendaContext";
import { useTituloPagina } from "../lib/hooks";

/** /categorias → tarjetas de categorías y sus productos; /categorias/:id → una sola categoría. */
export default function Categorias() {
    const { id } = useParams();
    const { categorias, productos } = useTienda();
    const seleccionada = id ? categorias.find((c) => c.id === id) : null;
    useTituloPagina(seleccionada ? `${seleccionada.nombre} | Tienda Mudra` : "Categorías | Tienda Mudra");

    const deCategoria = (nombre) => productos.filter((p) => p.categoria === nombre);
    const mostradas = seleccionada ? [seleccionada] : categorias;

    return (
        <main className="contenedor">
            <div className="titulo-catalogo-box"><h2>{seleccionada ? seleccionada.nombre.toUpperCase() : "CATEGORÍAS"}</h2></div>

            <nav className="categorias-nav" aria-label="Categorías">
                <Link className={`categoria-tarjeta${!seleccionada ? " categoria-tarjeta--activa" : ""}`} to="/categorias">
                    <strong>Todas</strong><small>{productos.length} productos</small>
                </Link>
                {categorias.map((c) => (
                    <Link
                        key={c.id} to={`/categorias/${c.id}`} aria-current={seleccionada?.id === c.id ? "page" : undefined}
                        className={`categoria-tarjeta${seleccionada?.id === c.id ? " categoria-tarjeta--activa" : ""}`}
                    >
                        <strong>{c.nombre}</strong><small>{deCategoria(c.nombre).length} productos</small>
                    </Link>
                ))}
            </nav>

            {id && !seleccionada && (
                <p className="categorias-aviso">Esta categoría no existe. <Link to="/categorias">Ver todas las categorías</Link></p>
            )}

            {mostradas.map((c) => (
                <section key={c.id} className="categoria-seccion" aria-labelledby={`cat-${c.id}`}>
                    <h3 id={`cat-${c.id}`} className="categoria-seccion__titulo">{c.nombre}</h3>
                    <CatalogoGrid productos={deCategoria(c.nombre)} vacio="Aún no hay productos en esta categoría." />
                </section>
            ))}
        </main>
    );
}