import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import PrecioProducto from "../components/PrecioProducto";
import { formatearPrecio, imagenProductoSegura, precioFinal } from "../lib/almacen";
import { useTituloPagina } from "../lib/hooks";

export default function Carrito() {
  useTituloPagina("Carrito | Tienda Mudra");
  const { sesion, cerrarSesion, resumenCarrito, totalCarrito, cambiarCantidad, quitarDelCarrito, vaciarCarrito } = useTienda();
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "info" });
  const navegar = useNavigate();

  const cambiar = (id, cantidad) => {
    const r = cambiarCantidad(id, cantidad);
    setMensaje(r.ok ? { texto: "", tipo: "info" } : { texto: r.mensaje || "Cantidad no válida.", tipo: "error" });
  };

  const comprar = () => {
    if (resumenCarrito.length === 0) {
      setMensaje({ texto: "Agrega productos al carrito antes de continuar con la compra.", tipo: "error" });
      return;
    }
    navegar("/checkout");
  };

  return (
    <main className="contenedor carrito-pagina">
      <section className="carrito-pagina__encabezado">
        <p className="cuenta-intro__etiqueta">Compra</p>
        <h1>Tu carrito</h1>
      </section>

      <section className="estado-compra" id="estado-compra" aria-live="polite">
        {sesion ? (
          <>
            <h2 className="estado-compra__titulo">Datos para la compra</h2>
            <p className="estado-compra__cliente">{sesion.nombre} {sesion.apellidos}</p>
            <p className="estado-compra__texto">{sesion.correo}</p>
            <p className="estado-compra__texto">{sesion.direccion}, {sesion.comuna}, {sesion.region}</p>
            <button type="button" className="boton-secundario estado-compra__cerrar" onClick={cerrarSesion}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <h2 className="estado-compra__titulo">¿Ya tienes cuenta?</h2>
            <p className="estado-compra__texto">Inicia sesión y completaremos tus datos de entrega automáticamente. También puedes comprar como invitado.</p>
            <div className="estado-compra__acciones">
              <Link className="boton estado-compra__accion" to="/iniciosesion?destino=carrito">Iniciar sesión</Link>
              <Link className="boton-secundario estado-compra__accion" to="/registro?destino=carrito">Crear cuenta</Link>
            </div>
          </>
        )}
      </section>

      <section className="carrito-pagina__productos" aria-label="Productos del carrito">
        <div id="items-carrito">
          {resumenCarrito.length === 0 ? (
            <p className="carrito-pagina__vacio">Tu carrito está vacío. <Link to="/productos">Ver productos</Link></p>
          ) : resumenCarrito.map(({ producto, cant }) => (
            <article className="carrito-pagina__fila carrito-pagina__item--editable" key={producto.id}>
              <div className="row g-3 align-items-center">
              <div className="col-3 col-md-2">
                <img className="carrito-pagina__imagen img-fluid" src={imagenProductoSegura(producto.img) || undefined} alt={producto.nombre} />
              </div>
              <div className="carrito-pagina__detalle col-9 col-md-7">
                <h2 className="carrito-pagina__nombre">{producto.nombre}</h2>
                <p className="carrito-pagina__cantidad">Precio unitario: <PrecioProducto producto={producto} /></p>
                <div className="cantidad-control" role="group" aria-label={`Cantidad de ${producto.nombre}`}>
                  <button type="button" aria-label="Quitar una unidad" onClick={() => cambiar(producto.id, cant - 1)}>−</button>
                  <input
                    type="number" min="1" max={producto.stock} value={cant} aria-label="Cantidad"
                    onChange={(e) => e.target.value !== "" && cambiar(producto.id, e.target.value)}
                  />
                  <button type="button" aria-label="Agregar una unidad" onClick={() => cambiar(producto.id, cant + 1)} disabled={cant >= producto.stock}>+</button>
                  <button type="button" className="boton-peligro" onClick={() => quitarDelCarrito(producto.id)}>Eliminar</button>
                </div>
              </div>
              <div className="col-12 col-md-3 text-md-end">
                <strong className="carrito-pagina__precio">${formatearPrecio(precioFinal(producto) * cant)}</strong>
              </div>
              </div>
            </article>
          ))}
        </div>
        <div className="carrito-pagina__total">
          <span>Total</span>
          <strong id="total-pagar">${formatearPrecio(totalCarrito)}</strong>
        </div>
        <p className={`mensaje-compra mensaje-compra--${mensaje.tipo}`} role="status" hidden={!mensaje.texto}>{mensaje.texto}</p>
        <div className="carrito-pagina__botones">
          <button type="button" className="boton-secundario" disabled={resumenCarrito.length === 0} onClick={vaciarCarrito}>Limpiar carrito</button>
          <button id="pagar" className="boton carrito-pagina__pagar" type="button" disabled={resumenCarrito.length === 0} onClick={comprar}>
            Comprar ahora
          </button>
        </div>
      </section>
    </main>
  );
}
