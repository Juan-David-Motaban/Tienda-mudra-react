import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Campo from "../components/Campo";
import { conDestino, useDestino } from "../components/Header";
import { useTienda } from "../context/TiendaContext";
import { erroresLogin } from "../lib/validaciones";
import { useFormulario } from "../lib/useFormulario";
import { useTituloPagina } from "../lib/hooks";

export default function IniciarSesion() {
  useTituloPagina("Iniciar sesión | Tienda Mudra");
  const { iniciarSesion } = useTienda();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const destino = useDestino();
  // El acceso al panel tiene su propia pantalla (/admin/login).
  const cuentaCreada = params.get("registro") === "ok";
  const f = useFormulario({ correo: "", contrasena: "" }, erroresLogin);
  const [estado, setEstado] = useState({ texto: cuentaCreada ? "Tu cuenta fue creada. Ingresa tus datos para continuar." : "", tipo: "exito" });
  const [enviando, setEnviando] = useState(false);

  const enviar = (e) => {
    e.preventDefault();
    setEstado({ texto: "", tipo: "exito" });
    if (!f.validarTodo(e.currentTarget) || enviando) return;
    setEnviando(true);
    try {
      const r = iniciarSesion(f.valores.correo, f.valores.contrasena);
      if (r.error) { setEstado({ texto: r.error, tipo: "error" }); return; }
      const rol = r.usuario.rol;
      navegar(destino === "carrito" ? "/checkout"
          : rol === "Administrador" ? "/admin"
              : rol === "Vendedor" ? "/admin/productos" : "/");
    } catch {
      setEstado({ texto: "No fue posible iniciar sesión. Inténtalo nuevamente.", tipo: "error" });
    } finally {
      setEnviando(false);
    }
  };

  return (
      <main className="contenedor cuenta-contenedor">
        <div className="cuenta-layout">
          <section className="cuenta-intro" aria-labelledby="titulo-inicio-sesion">
            <p className="cuenta-intro__etiqueta">Cuenta de cliente</p>
            <h1 id="titulo-inicio-sesion">Inicia sesión</h1>
            <p>Accede con el correo y contraseña de tu cuenta.</p>
            <p className="cuenta-intro__enlace">¿Aún no tienes cuenta? <Link to={conDestino("/registro", destino)}>Regístrate</Link></p>
          </section>
          <form className="cuenta-formulario" onSubmit={enviar} noValidate>
            <div className="cuenta-formulario__encabezado"><h2>Ingreso de cliente</h2></div>
            <p className={`estado-formulario estado-formulario--${estado.tipo}`} role="status" hidden={!estado.texto}>{estado.texto}</p>
            <Campo id="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
              <input type="email" maxLength={100} autoComplete="email" {...f.propsCampo("correo")} />
            </Campo>
            <Campo id="contrasena" etiqueta="Contraseña" error={f.errores.contrasena}>
              <input type="password" minLength={4} maxLength={10} autoComplete="current-password" {...f.propsCampo("contrasena")} />
            </Campo>
            <button className="boton cuenta-formulario__accion" type="submit" disabled={enviando}>Ingresar</button>
          </form>
        </div>
      </main>
  );
}