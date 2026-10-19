import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { regionesData } from "../../data/datos";
import { erroresUsuario } from "../../lib/validaciones";
import { useFormulario } from "../../lib/useFormulario";
import { useAdmin, useAdminPagina } from "../../components/admin/AdminContext";
import { CampoAdmin, Cabecera, EnlaceAdmin, NoEncontrado, propsControl } from "../../components/admin/ui";

/** `inicial` = pantalla de configuración de la primera cuenta administradora. */
export default function FormUsuario({ inicial = false }) {
  const { run } = useParams();
  const { usuarios } = useTienda();
  const usuario = run ? usuarios.find((u) => u.run === run) : null;
  useAdminPagina(inicial ? "Configurar administración" : run ? "Editar usuario" : "Nuevo usuario");
  if (run && !usuario) return <NoEncontrado tipo="usuario" volver="/admin/usuarios" />;
  return <Formulario key={run || "nuevo"} usuario={usuario} inicial={inicial} />;
}

function Formulario({ usuario, inicial }) {
  const { usuarios, sesion, guardarUsuario } = useTienda();
  const { notificar } = useAdmin();
  const navegar = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const propia = !!usuario && sesion?.run === usuario.run;

  const valoresIniciales = {
    run: usuario?.run || "", fechaNacimiento: usuario?.fechaNacimiento || "",
    nombre: usuario?.nombre || "", apellidos: usuario?.apellidos || "",
    correo: usuario?.correo || "", rol: usuario?.rol || (inicial ? "Administrador" : "Cliente"),
    contrasena: "", region: usuario?.region || "", comuna: usuario?.comuna || "",
    direccion: usuario?.direccion || ""
  };
  const opciones = { runActual: usuario?.run, sesionRun: sesion?.run, inicial };
  const f = useFormulario(valoresIniciales, (v) => erroresUsuario(v, usuarios, opciones));
  const comunas = regionesData.find((r) => r.region === f.valores.region)?.comunas || [];

  const propsRegion = f.propsCampo("region");
  const cambiarRegion = (e) => {
    f.cambiar({ region: e.target.value, comuna: "" });
    propsRegion.onChange(e);
  };

  const enviar = (e) => {
    e.preventDefault();
    if (enviando || !f.validarTodo(e.currentTarget)) return;
    setEnviando(true);
    try {
      const r = guardarUsuario(f.valores, usuario?.run, inicial);
      if (r.errores) { f.setErrores(r.errores); return; }
      // En la configuración inicial el panel redirige solo cuando detecta al administrador.
      if (!inicial) navegar("/admin/usuarios", { state: { aviso: "Usuario guardado correctamente." } });
    } catch (error) {
      notificar(error.name === "QuotaExceededError" ? "No hay espacio disponible para guardar el usuario." : error.message, "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {!inicial && (
        <Cabecera titulo={usuario ? "Editar usuario" : "Nuevo usuario"}>
          <EnlaceAdmin to="/admin/usuarios" icono={ArrowLeft}>Volver</EnlaceAdmin>
        </Cabecera>
      )}
      <form className="formulario-admin" onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Datos personales</legend>
          <div className="form-grid">
            <CampoAdmin nombre="run" etiqueta="RUN" error={f.errores.run}>
              <input {...propsControl(f, "run")} required maxLength={9} disabled={!!usuario} placeholder="Sin puntos ni guion" />
            </CampoAdmin>
            <CampoAdmin nombre="fechaNacimiento" etiqueta="Fecha de nacimiento" opcional error={f.errores.fechaNacimiento}>
              <input {...propsControl(f, "fechaNacimiento")} type="date" />
            </CampoAdmin>
            <CampoAdmin nombre="nombre" etiqueta="Nombre" error={f.errores.nombre}>
              <input {...propsControl(f, "nombre")} required maxLength={50} />
            </CampoAdmin>
            <CampoAdmin nombre="apellidos" etiqueta="Apellidos" error={f.errores.apellidos}>
              <input {...propsControl(f, "apellidos")} required maxLength={100} />
            </CampoAdmin>
          </div>
        </fieldset>
        <fieldset>
          <legend>Cuenta y permisos</legend>
          <div className="form-grid">
            <CampoAdmin nombre="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
              <input {...propsControl(f, "correo")} type="email" required maxLength={100} />
            </CampoAdmin>
            <CampoAdmin nombre="rol" etiqueta="Tipo de usuario" error={f.errores.rol}>
              <select {...propsControl(f, "rol")} required disabled={inicial || propia}>
                <option>Administrador</option><option>Vendedor</option><option>Cliente</option>
              </select>
            </CampoAdmin>
            <CampoAdmin nombre="contrasena" etiqueta={usuario ? "Nueva contraseña" : "Contraseña"} opcional={!!usuario} error={f.errores.contrasena}>
              <input
                {...propsControl(f, "contrasena")} type="password" maxLength={10} autoComplete="new-password" required={!usuario}
                placeholder={usuario ? "Conservar contraseña actual" : "Entre 4 y 10 caracteres"}
              />
            </CampoAdmin>
          </div>
        </fieldset>
        <fieldset>
          <legend>Dirección</legend>
          <div className="form-grid">
            <CampoAdmin nombre="region" etiqueta="Región" error={f.errores.region}>
              <select {...propsControl(f, "region")} required onChange={cambiarRegion}>
                <option value="">Seleccionar</option>
                {regionesData.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
              </select>
            </CampoAdmin>
            <CampoAdmin nombre="comuna" etiqueta="Comuna" error={f.errores.comuna}>
              <select {...propsControl(f, "comuna")} required disabled={!f.valores.region}>
                <option value="">Seleccionar</option>
                {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </CampoAdmin>
            <CampoAdmin nombre="direccion" etiqueta="Dirección" ancho error={f.errores.direccion}>
              <textarea {...propsControl(f, "direccion")} rows={3} maxLength={300} required />
            </CampoAdmin>
          </div>
        </fieldset>
        <div className="formulario-pie">
          <EnlaceAdmin to={inicial ? "/" : "/admin/usuarios"}>{inicial ? "Volver a la tienda" : "Cancelar"}</EnlaceAdmin>
          <button type="submit" className="boton-admin boton-admin--primario" disabled={enviando}>
            <Save aria-hidden="true" />{inicial ? "Crear cuenta administradora" : "Guardar usuario"}
          </button>
        </div>
      </form>
    </>
  );
}
