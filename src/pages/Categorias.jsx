import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Campo from "../components/Campo";
import { useTienda } from "../context/TiendaContext";
import { regionesData } from "../data/datos";
import { formatearPrecio, imagenProductoSegura, precioFinal } from "../lib/almacen";
import { erroresCheckout } from "../lib/validaciones";
import { useFormulario } from "../lib/useFormulario";
import { useTituloPagina } from "../lib/hooks";

/** Paso de pago: datos del cliente, dirección de entrega y confirmación (pago simulado). */
export default function Checkout() {
    useTituloPagina("Pagar | Tienda Mudra");
    const { sesion, resumenCarrito, totalCarrito, finalizarCompra } = useTienda();
    const { state } = useLocation();
    const navegar = useNavigate();
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [resultadoSimulado, setResultadoSimulado] = useState("aprobado");

    // Si el usuario inició sesión, sus datos se completan solos; al reintentar un pago se reutilizan los ya escritos.
    const inicial = state?.datos || {
        nombre: sesion?.nombre || "", apellidos: sesion?.apellidos || "", correo: sesion?.correo || "",
        calle: sesion?.direccion || "", departamento: "", region: sesion?.region || "",
        comuna: sesion?.comuna || "", indicaciones: ""
    };
    const f = useFormulario(inicial, erroresCheckout);
    const comunas = regionesData.find((r) => r.region === f.valores.region)?.comunas || [];

    // Si inicia sesión en otra pestaña con el formulario vacío, se rellena.
    useEffect(() => {
        if (sesion && !state?.datos) {
            f.setValores((v) => ({
                ...v,
                nombre: v.nombre || sesion.nombre, apellidos: v.apellidos || sesion.apellidos, correo: v.correo || sesion.correo,
                calle: v.calle || sesion.direccion, region: v.region || sesion.region, comuna: v.comuna || sesion.comuna
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sesion?.run]);

    if (resumenCarrito.length === 0 && !enviando) return <Navigate to="/carrito" replace />;

    const propsRegion = f.propsCampo("region");
    const cambiarRegion = (e) => {
        f.cambiar({ region: e.target.value, comuna: "" });
        propsRegion.onChange(e);
    };

    const pagar = (e) => {
        e.preventDefault();
        setError("");
        if (enviando || !f.validarTodo(e.currentTarget)) return;
        setEnviando(true);
        try {
            const exito = resultadoSimulado === "aprobado";
            const orden = finalizarCompra({
                ...f.valores, nombre: f.valores.nombre.trim(), apellidos: f.valores.apellidos.trim(),
                correo: f.valores.correo.trim().toLowerCase(), calle: f.valores.calle.trim(),
                departamento: f.valores.departamento.trim(), indicaciones: f.valores.indicaciones.trim()
            }, exito);
            navegar(exito ? `/compra/exitosa/${orden.id}` : `/compra/error/${orden.id}`, { state: { datos: f.valores }, replace: true });
        } catch (err) {
            setEnviando(false);
            setError(err.name === "QuotaExceededError" ? "No hay espacio disponible para registrar la compra." : err.message);
        }
    };

    return (
        <main className="contenedor checkout-pagina">
            <form className="cuenta-formulario checkout-formulario" onSubmit={pagar} noValidate>
                <div className="checkout-encabezado">
                    <div>
                        <h1>Carrito de compra</h1>
                        <p>Completa la siguiente información.</p>
                    </div>
                    <p className="checkout-total">Total a pagar: <strong>${formatearPrecio(totalCarrito)}</strong></p>
                </div>

                <div className="boleta-scroll">
                    <table className="boleta__tabla">
                        <thead>
                        <tr><th>Imagen</th><th>Nombre</th><th className="numero">Precio</th><th className="numero">Cantidad</th><th className="numero">Subtotal</th></tr>
                        </thead>
                        <tbody>
                        {resumenCarrito.map(({ producto, cant }) => (
                            <tr key={producto.id}>
                                <td>{imagenProductoSegura(producto.img) && <img src={imagenProductoSegura(producto.img)} alt="" width="40" height="40" />}</td>
                                <td>{producto.nombre}</td>
                                <td className="numero">${formatearPrecio(precioFinal(producto))}</td>
                                <td className="numero">{cant}</td>
                                <td className="numero">${formatearPrecio(precioFinal(producto) * cant)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <p className="estado-formulario estado-formulario--error" role="alert" hidden={!error}>{error}</p>

                <h2>Información del cliente</h2>
                <div className="formulario-grid">
                    <Campo id="nombre" etiqueta="Nombre" error={f.errores.nombre}>
                        <input type="text" maxLength={50} autoComplete="given-name" {...f.propsCampo("nombre")} />
                    </Campo>
                    <Campo id="apellidos" etiqueta="Apellidos" error={f.errores.apellidos}>
                        <input type="text" maxLength={100} autoComplete="family-name" {...f.propsCampo("apellidos")} />
                    </Campo>
                    <Campo id="correo" etiqueta="Correo" error={f.errores.correo}>
                        <input type="email" maxLength={100} autoComplete="email" {...f.propsCampo("correo")} />
                    </Campo>
                </div>

                <h2>Dirección de entrega de los productos</h2>
                <div className="formulario-grid">
                    <Campo id="calle" etiqueta="Calle" error={f.errores.calle}>
                        <input type="text" maxLength={200} autoComplete="address-line1" {...f.propsCampo("calle")} />
                    </Campo>
                    <Campo id="departamento" etiqueta="Departamento" opcional error={f.errores.departamento}>
                        <input type="text" maxLength={30} placeholder="Ej: 603" autoComplete="address-line2" {...f.propsCampo("departamento")} />
                    </Campo>
                    <Campo id="region" etiqueta="Región" error={f.errores.region}>
                        <select autoComplete="address-level1" {...propsRegion} onChange={cambiarRegion}>
                            <option value="">-- Seleccionar Región --</option>
                            {regionesData.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
                        </select>
                    </Campo>
                    <Campo id="comuna" etiqueta="Comuna" error={f.errores.comuna}>
                        <select autoComplete="address-level2" {...f.propsCampo("comuna")}>
                            <option value="">{f.valores.region ? "-- Seleccionar Comuna --" : "Selecciona una región primero"}</option>
                            {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </Campo>
                    <Campo id="indicaciones" etiqueta="Indicaciones para la entrega" opcional completo error={f.errores.indicaciones}>
                        <textarea rows={3} maxLength={300} placeholder="Ej: Entre calles, color del edificio, no tiene timbre." {...f.propsCampo("indicaciones")} />
                    </Campo>
                </div>

                <fieldset className="pago-simulado">
                    <legend>Pago (simulación)</legend>
                    <p>Esta tienda es una demostración: no se procesan pagos reales. Elige el resultado que quieres probar.</p>
                    <label><input type="radio" name="pago" value="aprobado" checked={resultadoSimulado === "aprobado"} onChange={(e) => setResultadoSimulado(e.target.value)} /> Pago aprobado</label>
                    <label><input type="radio" name="pago" value="rechazado" checked={resultadoSimulado === "rechazado"} onChange={(e) => setResultadoSimulado(e.target.value)} /> Pago rechazado</label>
                </fieldset>

                <button type="submit" className="boton cuenta-formulario__accion" disabled={enviando}>
                    Pagar ahora ${formatearPrecio(totalCarrito)}
                </button>
            </form>
        </main>
    );
}