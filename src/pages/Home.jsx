import { Link } from "react-router-dom";
import CatalogoGrid from "../components/CatalogoGrid";
import { useTituloPagina } from "../lib/hooks";

export default function Home() {
  useTituloPagina("Tienda Mudra | Home");
  return (
    <main className="contenedor">
      <div className="banner-home">
        <div className="banner-info">
          <h2>ROPA URBANA & STREETWEAR</h2>
          <p>Encuentra las mejores prendas de vestir, polerones oversize, pantalones cargo y accesorios de moda urbana.</p>
          <Link to="/productos" className="boton">⬇ ver productos</Link>
        </div>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8QwHp9bQQ_XVJaEzw4t_azJ4v8dVbRPuYJs78risM4A&s=10"
          alt="Ropa Urbana" className="banner-img"
        />
      </div>
      <CatalogoGrid limite={4} />
    </main>
  );
}
