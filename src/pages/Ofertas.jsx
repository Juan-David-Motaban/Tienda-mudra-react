import CatalogoGrid from "../components/CatalogoGrid";
import { useTienda } from "../context/TiendaContext";
import { enOferta } from "../lib/almacen";
import { useTituloPagina } from "../lib/hooks";

export default function Ofertas() {
  useTituloPagina("Ofertas | Tienda Mudra");
  const { productos } = useTienda();
  return (
    <main className="contenedor">
      <div className="titulo-catalogo-box"><h2>OFERTAS</h2></div>
      <CatalogoGrid productos={productos.filter(enOferta)} vacio="Por ahora no hay productos en oferta." />
    </main>
  );
}
