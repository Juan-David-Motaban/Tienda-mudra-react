import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import { formatearPrecio, imagenProductoSegura, precioFinal } from "../lib/almacen";

const LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUClnSJzLBcPckI8kwNNCYgCJlNj1xvrsP6sBdflofMA&s=10";

export function useDestino() {
  const { pathname, search } = useLocation();
  if (pathname === "/carrito") return "carrito";
  const destino = new URLSearchParams(search).get("destino");
  return ["carrito", "admin"].includes(destino) ? destino : "";
}

export const conDestino = (ruta, destino) => (destino ? `${ruta}?destino=${destino}` : ruta);

function CuentaHeader() {
  const { sesion, cerrarSesion } = useTienda();
  const destino = useDestino();

  if (sesion) {
    return (
        <div className="header-cuenta">
          <span className="header-cuenta__saludo">Hola, {sesion.nombre || "cliente"}</span>
          {["Administrador", "Vendedor"].includes(sesion.rol) && (
              <Link className="header-cuenta__inicio" to={sesion.rol === "Administrador" ? "/admin" : "/admin/productos"}>Administración</Link>
          )}
          <button type="button" className="header-cuenta__cerrar" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
    );
  }
  return (
      <div className="header-cuenta">
        <Link className="header-cuenta__inicio" to={conDestino("/iniciosesion", destino)}>Iniciar sesión</Link>
        <Link className="header-cuenta__crear" to={conDestino("/registro", destino)}>Crear cuenta</Link>
      </div>
  );
}

function CarritoMenu() {
  const {
    totalItems, totalCarrito, resumenCarrito, quitarDelCarrito,
    carritoAbierto, setCarritoAbierto, mensajeCarrito
  } = useTienda();

  useEffect(() => {
    if (!carritoAbierto) return undefined;
    const alTecla = (e) => { if (e.key === "Escape") setCarritoAbierto(false); };
    const alClic = (e) => {
      if (!e.target.closest(".carrito-menu, .btn-agregar, .producto-modal")) setCarritoAbierto(false);
    };
    document.addEventListener("keydown", alTecla);
    document.addEventListener("click", alClic);
    return () => {
      document.removeEventListener("keydown", alTecla);
      document.removeEventListener("click", alClic);
    };
  }, [carritoAbierto, setCarritoAbierto]);

  return (
      <div className="carrito-menu">
        <button
            className="header-cart carrito-toggle" type="button"
            aria-expanded={carritoAbierto} aria-controls="carrito-desplegable"
            onClick={() => setCarritoAbierto(!carritoAbierto)}
        >
          <span aria-hidden="true">🛒</span>
          Carrito (<span className="cant-carrito" aria-live="polite">{totalItems}</span>)
        </button>
        <section className="carrito-dropdown" id="carrito-desplegable" hidden={!carritoAbierto} role="dialog" aria-modal="false" aria-labelledby="carrito-titulo">
          <div className="carrito-dropdown__encabezado">
            <h2 className="carrito-dropdown__titulo" id="carrito-titulo">Mi carrito</h2>
            <button type="button" className="carrito-dropdown__cerrar" aria-label="Cerrar carrito" onClick={() => setCarritoAbierto(false)}>&times;</button>
          </div>
          {mensajeCarrito && <p className="carrito-mensaje" role="status">{mensajeCarrito}</p>}
          <div className="carrito-dropdown__items">
            {resumenCarrito.length === 0 ? (
                <p className="carrito-vacio">Tu carrito está vacío.</p>
            ) : (
                <ul className="carrito-dropdown__lista">
                  {resumenCarrito.map(({ producto, cant }) => (
                      <li className="carrito-dropdown__item" key={producto.id}>
                        <img className="carrito-dropdown__imagen" src={imagenProductoSegura(producto.img)} alt="" />
                        <div className="carrito-dropdown__detalle">
                          <strong>{producto.nombre}</strong>
                          <span className="carrito-dropdown__precio">${formatearPrecio(precioFinal(producto))}</span>
                          <span className="carrito-dropdown__cantidad">Cantidad: {cant}</span>
                        </div>
                        <button type="button" className="carrito-dropdown__eliminar" aria-label={`Quitar ${producto.nombre} del carrito`} onClick={() => quitarDelCarrito(producto.id)}>&times;</button>
                      </li>
                  ))}
                </ul>
            )}
          </div>
          <div className="carrito-dropdown__total">
            <span>Total</span>
            <strong className="carrito-dropdown__total-valor">${formatearPrecio(totalCarrito)}</strong>
          </div>
          <div className="carrito-dropdown__acciones">
            <Link className="carrito-dropdown__comprar" to="/checkout" onClick={() => setCarritoAbierto(false)}>Comprar</Link>
            <Link className="carrito-dropdown__ver" to="/carrito" onClick={() => setCarritoAbierto(false)}>Ver carrito</Link>
          </div>
        </section>
      </div>
  );
}

function BuscadorHeader() {
  const navegar = useNavigate();
  const [texto, setTexto] = useState("");
  const buscar = (e) => {
    e.preventDefault();
    const q = texto.trim();
    navegar(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
  };
  return (
      <form className="header-buscador" role="search" onSubmit={buscar}>
        <label className="sr-only" htmlFor="buscar-header">Buscar productos</label>
        <input id="buscar-header" type="search" placeholder="Buscar" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <button type="submit">Buscar</button>
      </form>
  );
}

export default function Header() {
  return (
      <header>
        <div className="header-logo">
          <img src={LOGO} alt="Logo Tienda" className="img-logo" />
          <span>Tienda Mudra</span>
        </div>
        <nav>
          <NavLink to="/" end>Home</NavLink> |{" "}
          <NavLink to="/productos">Productos</NavLink> |{" "}
          <NavLink to="/categorias">Categorías</NavLink> |{" "}
          <NavLink to="/ofertas">Ofertas</NavLink> |{" "}
          <NavLink to="/nosotros">Nosotros</NavLink> |{" "}
          <NavLink to="/blogs">Blogs</NavLink> |{" "}
          <NavLink to="/contacto">Contacto</NavLink>
        </nav>
        <div className="header-acciones">
          <BuscadorHeader />
          <CuentaHeader />
          <CarritoMenu />
        </div>
      </header>
  );
}