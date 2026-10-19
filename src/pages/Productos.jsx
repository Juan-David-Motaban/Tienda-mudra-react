import CatalogoGrid from "../components/CatalogoGrid";
import { useTituloPagina } from "../lib/hooks";

export default function Productos() {
  useTituloPagina("Productos | Tienda Mudra");
  return (
    <main className="contenedor">
      <div className="titulo-catalogo-box"><h2>CATÁLOGO DE PRODUCTOS</h2></div>
      <CatalogoGrid />
    </main>
  );
}
