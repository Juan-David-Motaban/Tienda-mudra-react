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
  const navegar = useNavigate();
  const f = useFormulario(VACIO, erroresLogin);
  const [errorGeneral, setErrorGeneral] = useState("");

  const enviar = (e) => {
    e.preventDefault();
    setErrorGeneral("");
    const form = e.currentTarget;
    if (!f.validarTodo(form)) return;
    const res = iniciarSesion(f.valores.correo, f.valores.contrasena);
    if (res.error) {
      setErrorGeneral(res.error);
      return;
    }
    navegar(res.usuario.rol === "Administrador" ? "/admin" : "/");
  };

  return (
    <main className="contenedor cuenta-pagina">
      <div className="row g-4 g-lg-5 align-items-start">
        <section className="cuenta-intro col-12 col-lg-5" aria-labelledby="titulo-login">
          <p className="cuenta-intro__etiqueta">Acceso clientes</p>
          <h1 id="titulo-login">Inicia sesión en Tienda Mudra</h1>
          <p>Ingresa con tu correo registrado para continuar con tu compra o revisar tu cuenta.</p>
          <p>
            ¿Aún no tienes cuenta? <Link to="/registro">Regístrate aquí</Link>.
          </p>
        </section>
        <div className="col-12 col-lg-7">
          <form className="cuenta-formulario" onSubmit={enviar} noValidate>
            <h2>Datos de acceso</h2>
            <p className="estado-formulario estado-formulario--error" role="alert" hidden={!errorGeneral}>
              {errorGeneral}
            </p>
            <Campo id="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
              <input type="email" maxLength={100} autoComplete="email" required {...f.propsCampo("correo")} />
            </Campo>
            <Campo id="contrasena" etiqueta="Contraseña" error={f.errores.contrasena}>
              <input type="password" autoComplete="current-password" required {...f.propsCampo("contrasena")} />
            </Campo>
            <button type="submit" className="boton">Ingresar</button>
          </form>
        </div>
      </div>
    </main>
  );
}