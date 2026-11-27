import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Campo from "../components/Campo";
import { useTienda } from "../context/TiendaContext";
import { erroresLogin } from "../lib/validaciones";
import { useFormulario } from "../lib/useFormulario";
import { useTituloPagina } from "../lib/hooks";

const VACIO = { correo: "", contrasena: "" };

export default function IniciarSesion() {
    useTituloPagina("Iniciar sesión | Tienda Mudra");
    const { iniciarSesion } = useTienda();
    const navigate = useNavigate();
    const f = useFormulario(VACIO, erroresLogin);
    const [errorGeneral, setErrorGeneral] = useState("");

    const enviar = async (e) => {
        e.preventDefault();
        setErrorGeneral("");
        if (!f.validarTodo(e.currentTarget)) return;
        const res = await iniciarSesion(f.valores.correo, f.valores.contrasena, false);
        if (res.error) {
            setErrorGeneral(res.error);
            return;
        }
        navigate(res.usuario?.rol === "Administrador" ? "/admin" : "/");
    };

    return (
        <main className="contenedor cuenta-pagina">
            <div className="row g-4 g-lg-5 align-items-start">
                <section className="cuenta-intro col-12 col-lg-5" aria-labelledby="titulo-login">
                    <p className="cuenta-intro__etiqueta">Cuenta</p>
                    <h1 id="titulo-login">Inicia sesión en Tienda Mudra</h1>
                    <p>Accede con tu correo y contraseña para comprar y revisar tu historial.</p>
                </section>
                <div className="col-12 col-lg-7">
                    <form className="cuenta-formulario" onSubmit={enviar} noValidate>
                        <h2>Acceso</h2>
                        <p className="estado-formulario estado-formulario--error" role="status" hidden={!errorGeneral}>
                            {errorGeneral}
                        </p>
                        <Campo id="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
                            <input type="email" maxLength={100} autoComplete="email" required {...f.propsCampo("correo")} />
                        </Campo>
                        <Campo id="contrasena" etiqueta="Contraseña" error={f.errores.contrasena}>
                            <input type="password" maxLength={10} autoComplete="current-password" required {...f.propsCampo("contrasena")} />
                        </Campo>
                        <button type="submit" className="boton">Ingresar</button>
                        <p className="cuenta-pie">
                            ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
                        </p>
                    </form>
                </div>
            </div>
        </main>
    );
}