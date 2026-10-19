import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";
import { formatearPrecio } from "../lib/almacen";
import { useTituloPagina } from "../lib/hooks";

export default function Carrito() {
  useTituloPagina("Carrito | Tienda Mudra");
  const { sesion, cerrarSesion, resumenCarrito, totalCarrito, finalizarCompra } = useTienda();
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "info" });
  const [procesando, setProcesando] = useState(false);
  const navegar = useNavigate();

  // Al llegar con #pagar (desde "Comprar"), lleva la vista a la sección de pago.
  useEffect(() => {
    if (window.location.hash === "#pagar") document.getElementById("pagar")?.scrollIntoView({ block: "center" });
  }, []);

  const pagar = () => {
    if (resumenCarrito.length === 0) {
      setMensaje({ texto: "Agrega productos al carrito antes de finalizar la compra.", tipo: "error" });
      return;
    }
    setProcesando(true);
    try {
      const orden = finalizarCompra();
      setMensaje({ texto: `Compra ${orden.id} registrada para ${sesion.nombre}. Gracias por preferir Tienda Mudra.`, tipo: "exito" });
    } catch (error) {
      setMensaje({
        texto: error.name === "QuotaExceededError" ? "No hay espacio disponible para registrar la compra." : error.message,
        tipo: "error"
      });
    } finally {
      setProcesando(false);
    }
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
            <button
              type="button" className="boton-secundario estado-compra__cerrar"
              onClick={() => { cerrarSesion(); setMensaje({ texto: "La sesión se cerró. Inicia sesión para finalizar la compra.", tipo: "info" }); }}
            >Cerrar sesión</button>
          </>
        ) : (
          <>
            <h2 className="estado-compra__titulo">Identificación para la compra</h2>
            <p className="estado-compra__texto">Inicia sesión o crea tu cuenta antes de finalizar la compra.</p>
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
            <p className="carrito-pagina__vacio">Tu carrito está vacío.</p>
          ) : resumenCarrito.map(({ producto, cant }) => (
            <article className="carrito-pagina__item" key={producto.id}>
              <img className="carrito-pagina__imagen" src={producto.img} alt={producto.nombre} />
              <div className="carrito-pagina__detalle">
                <h2 className="carrito-pagina__nombre">{producto.nombre}</h2>
                <p className="carrito-pagina__cantidad">Cantidad: {cant}</p>
              </div>
              <strong className="carrito-pagina__precio">${formatearPrecio(producto.precio * cant)}</strong>
            </article>
          ))}
        </div>
        <div className="carrito-pagina__total">
          <span>Total</span>
          <strong id="total-pagar">${formatearPrecio(totalCarrito)}</strong>
        </div>
        <p className={`mensaje-compra mensaje-compra--${mensaje.tipo}`} role="status" hidden={!mensaje.texto}>{mensaje.texto}</p>
        <button
          id="pagar" className="boton carrito-pagina__pagar" type="button"
          disabled={resumenCarrito.length === 0 || procesando}
          onClick={() => { if (!sesion) navegar("/iniciosesion?destino=carrito"); else pagar(); }}
        >Finalizar compra</button>
      </section>
    </main>
  );
}
