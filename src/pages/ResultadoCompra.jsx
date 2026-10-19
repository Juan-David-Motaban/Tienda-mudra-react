import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CircleCheck, CircleX } from "lucide-react";
import Boleta from "../components/Boleta";
import { useTienda } from "../context/TiendaContext";
import { useTituloPagina } from "../lib/hooks";

/** Resultado del pago: `exito` muestra la compra realizada (con boleta); si no, el pago rechazado. */
export default function ResultadoCompra({ exito }) {
    const { id } = useParams();
    const { state } = useLocation();
    const { ordenes } = useTienda();
    const [aviso, setAviso] = useState("");
    const orden = ordenes.find((o) => o.id === id);
    useTituloPagina(exito ? "Compra realizada | Tienda Mudra" : "Pago no realizado | Tienda Mudra");

    if (!orden) {
        return (
            <main className="contenedor resultado-pagina">
                <section className="resultado">
                    <h1>No encontramos esta compra</h1>
                    <p>Puede que el código sea incorrecto.</p>
                    <Link className="boton" to="/productos">Volver a los productos</Link>
                </section>
            </main>
        );
    }

    const enviarPorCorreo = () =>
        setAviso(`Boleta enviada a ${orden.cliente.correo} (simulado: esta demostración no tiene servidor de correo).`);

    return (
        <main className="contenedor resultado-pagina">
            <section className={`resultado resultado--${exito ? "exito" : "error"}`} aria-labelledby="titulo-resultado">
                <h1 id="titulo-resultado">
                    {exito ? <CircleCheck aria-hidden="true" /> : <CircleX aria-hidden="true" />}
                    {exito ? "Se ha realizado la compra" : "No se pudo realizar el pago"} nro #{orden.id}
                </h1>
                {!exito && (
                    <>
                        <p>Tu pago fue rechazado. No se te cobró nada y tu carrito sigue guardado.</p>
                        <Link className="boton resultado__reintentar" to="/checkout" state={{ datos: state?.datos }}>Volver a realizar el pago</Link>
                    </>
                )}
                {exito && <p>Gracias por tu compra, {orden.cliente.nombre}. Este es el resumen de tu pedido.</p>}

                <Boleta orden={orden} />

                {exito && (
                    <div className="resultado__acciones">
                        <button type="button" className="boton-peligro" onClick={() => window.print()}>Imprimir boleta en PDF</button>
                        <button type="button" className="boton" onClick={enviarPorCorreo}>Enviar boleta por email</button>
                        <Link className="boton-secundario" to="/productos">Seguir comprando</Link>
                    </div>
                )}
                <p className="mensaje-compra mensaje-compra--exito" role="status" hidden={!aviso}>{aviso}</p>
            </section>
        </main>
    );
}