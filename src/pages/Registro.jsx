import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Campo from "../components/Campo";
import { conDestino, useDestino } from "../components/Header";
import { useTienda } from "../context/TiendaContext";
import { regionesData } from "../data/datos";
import { erroresRegistro } from "../lib/validaciones";
import { useFormulario } from "../lib/useFormulario";
import { useTituloPagina } from "../lib/hooks";

const VACIO = {
  run: "", fechaNacimiento: "", nombre: "", apellidos: "", correo: "",
  contrasena: "", region: "", comuna: "", direccion: ""
};

export default function Registro() {
  useTituloPagina("Crear cuenta | Tienda Mudra");
  const { registrarCliente } = useTienda();
  const navegar = useNavigate();
  const destino = useDestino();
  const f = useFormulario(VACIO, erroresRegistro);
  const [estado, setEstado] = useState("");
  const comunas = regionesData.find((r) => r.region === f.valores.region)?.comunas || [];

  const enviar = (e) => {
    e.preventDefault();
    setEstado("");
    if (!f.validarTodo(e.currentTarget)) return;
    try {
      const r = registrarCliente(f.valores);
      if (r.errores) { f.setErrores(r.errores); return; }
      navegar(`/iniciosesion?registro=ok${destino ? `&destino=${destino}` : ""}`);
    } catch {
      setEstado("No fue posible guardar tu cuenta. Inténtalo nuevamente.");
    }
  };

  // Al cambiar de región se reinicia la comuna.
  const propsRegion = f.propsCampo("region");
  const cambiarRegion = (e) => {
    f.cambiar({ region: e.target.value, comuna: "" });
    propsRegion.onChange(e);
  };

  return (
    <main className="contenedor cuenta-contenedor">
      <div className="cuenta-layout cuenta-layout--registro">
        <section className="cuenta-intro" aria-labelledby="titulo-registro">
          <p className="cuenta-intro__etiqueta">Cuenta de cliente</p>
          <h1 id="titulo-registro">Crea tu cuenta</h1>
          <p>Completa tus datos personales para identificar tu compra.</p>
          <p className="cuenta-intro__enlace">¿Ya tienes una cuenta? <Link to={conDestino("/iniciosesion", destino)}>Inicia sesión</Link></p>
        </section>
        <form className="cuenta-formulario" onSubmit={enviar} noValidate>
          <div className="cuenta-formulario__encabezado"><h2>Datos personales</h2></div>
          <p className="estado-formulario estado-formulario--error" role="status" hidden={!estado}>{estado}</p>
          <div className="formulario-grid">
            <Campo id="run" etiqueta="RUN" error={f.errores.run}>
              <input type="text" inputMode="text" maxLength={9} autoComplete="off" placeholder="19011022K" {...f.propsCampo("run")} />
            </Campo>
            <Campo id="fechaNacimiento" etiqueta="Fecha de nacimiento" opcional error={f.errores.fechaNacimiento}>
              <input type="date" autoComplete="bday" {...f.propsCampo("fechaNacimiento")} />
            </Campo>
            <Campo id="nombre" etiqueta="Nombre" error={f.errores.nombre}>
              <input type="text" maxLength={50} autoComplete="given-name" {...f.propsCampo("nombre")} />
            </Campo>
            <Campo id="apellidos" etiqueta="Apellidos" error={f.errores.apellidos}>
              <input type="text" maxLength={100} autoComplete="family-name" {...f.propsCampo("apellidos")} />
            </Campo>
            <Campo id="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
              <input type="email" maxLength={100} autoComplete="email" {...f.propsCampo("correo")} />
            </Campo>
            <Campo id="contrasena" etiqueta="Contraseña" error={f.errores.contrasena}>
              <input type="password" minLength={4} maxLength={10} autoComplete="new-password" {...f.propsCampo("contrasena")} />
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
            <Campo id="direccion" etiqueta="Dirección" completo error={f.errores.direccion}>
              <textarea rows={3} maxLength={300} autoComplete="street-address" {...f.propsCampo("direccion")} />
            </Campo>
          </div>
          <button className="boton cuenta-formulario__accion" type="submit">Crear cuenta</button>
        </form>
      </div>
    </main>
  );
}
