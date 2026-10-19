import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import estiloAdmin from "../../styles/admin.css?inline";
import { useClaseBody, useHojaEstilos, useTituloPagina } from "../../lib/hooks";
import { erroresLogin } from "../../lib/validaciones";
import { useFormulario } from "../../lib/useFormulario";

const LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUClnSJzLBcPckI8kwNNCYgCJlNj1xvrsP6sBdflofMA&s=10";

export default function AdminLogin() {
  useHojaEstilos(estiloAdmin);
  useClaseBody("admin-login");
  useTituloPagina("Iniciar sesión | Administración Mudra");
  const { iniciarSesion, hayAdministrador } = useTienda();
  const navegar = useNavigate();
  const f = useFormulario({ correo: "", contrasena: "" }, erroresLogin);
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = (e) => {
    e.preventDefault();
    setError("");
    if (enviando || !f.validarTodo(e.currentTarget)) return;
    setEnviando(true);
    try {
      const r = iniciarSesion(f.valores.correo, f.valores.contrasena, true);
      if (r.error) { setError(r.error); return; }
      navegar(r.usuario.rol === "Vendedor" ? "/admin/productos" : "/admin");
    } catch {
      setError("No fue posible iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  const props = (n) => ({ ...f.propsCampo(n), id: `login-${n}`, className: "control", "aria-describedby": `error-login-${n}` });
  const Icono = verClave ? EyeOff : Eye;
  const etiquetaClave = verClave ? "Ocultar contraseña" : "Mostrar contraseña";

  return (
    <>
      <header className="admin-login__barra">
        <Link className="admin-marca" to="/">
          <img src={LOGO} alt="Logo de Tienda Mudra" width="36" height="36" />
          <span><strong>Tienda Mudra</strong></span>
        </Link>
        <Link to="/" className="admin-login__volver"><ArrowLeft aria-hidden="true" />Volver a la tienda</Link>
      </header>
      <main className="admin-login__contenido">
        <section className="admin-login__panel" aria-labelledby="titulo-admin-login">
          <h1 id="titulo-admin-login">Administración</h1>
          <p className="admin-login__perfiles">Administrador y vendedor</p>
          <form onSubmit={enviar} noValidate>
            <h2>Iniciar sesión</h2>
            <p role="status" className="aviso aviso--error" hidden={!error}>{error}</p>
            <div className="campo-admin">
              <label htmlFor="login-correo">Correo electrónico</label>
              <input {...props("correo")} type="email" maxLength={100} autoComplete="username" required />
              <p className="campo-error" id="error-login-correo" hidden={!f.errores.correo}>{f.errores.correo}</p>
            </div>
            <div className="campo-admin">
              <label htmlFor="login-contrasena">Contraseña</label>
              <div className="admin-login__clave">
                <input {...props("contrasena")} type={verClave ? "text" : "password"} minLength={4} maxLength={10} autoComplete="current-password" required />
                <button
                  className="boton-icono" type="button" aria-label={etiquetaClave} aria-pressed={verClave}
                  data-tooltip={etiquetaClave} onClick={() => setVerClave(!verClave)}
                ><Icono aria-hidden="true" /></button>
              </div>
              <p className="campo-error" id="error-login-contrasena" hidden={!f.errores.contrasena}>{f.errores.contrasena}</p>
            </div>
            <button type="submit" className="boton-admin boton-admin--primario admin-login__ingresar" disabled={enviando}>
              <LogIn aria-hidden="true" />Ingresar al panel
            </button>
          </form>
          <p className="admin-login__configuracion" hidden={hayAdministrador}>
            <Link to="/admin/configurar">Configurar primer administrador</Link>
          </p>
        </section>
      </main>
    </>
  );
}
