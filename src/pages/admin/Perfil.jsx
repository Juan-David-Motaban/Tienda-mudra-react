import { useState } from "react";
import { Save } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { regionesData } from "../../data/datos";
import { erroresPerfil } from "../../lib/validaciones";
import { useFormulario } from "../../lib/useFormulario";
import { useAdmin, useAdminPagina } from "../../components/admin/AdminContext";
import { CampoAdmin, Cabecera, DatosDetalle, propsControl } from "../../components/admin/ui";

export default function Perfil() {
    useAdminPagina("Perfil");
    const { sesion, actualizarPerfil } = useTienda();
    const { notificar } = useAdmin();
    const [guardando, setGuardando] = useState(false);
    const f = useFormulario({
        nombre: sesion.nombre || "", apellidos: sesion.apellidos || "", fechaNacimiento: sesion.fechaNacimiento || "",
        contrasena: "", region: sesion.region || "", comuna: sesion.comuna || "", direccion: sesion.direccion || ""
    }, erroresPerfil);
    const comunas = regionesData.find((r) => r.region === f.valores.region)?.comunas || [];

    const propsRegion = f.propsCampo("region");
    const cambiarRegion = (e) => {
        f.cambiar({ region: e.target.value, comuna: "" });
        propsRegion.onChange(e);
    };

    const enviar = (e) => {
        e.preventDefault();
        if (guardando || !f.validarTodo(e.currentTarget)) return;
        setGuardando(true);
        try {
            const r = actualizarPerfil(f.valores);
            if (r.errores) { f.setErrores(r.errores); return; }
            f.cambiar({ contrasena: "" });
            notificar("Perfil actualizado correctamente.");
        } catch (error) {
            notificar(error.message, "error");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <>
            <Cabecera titulo="Mi perfil" subtitulo={`${sesion.rol} · ${sesion.correo}`} />
            <DatosDetalle pares={[["RUN", sesion.run], ["Correo", sesion.correo], ["Perfil", sesion.rol]]} />
            <form className="formulario-admin" onSubmit={enviar} noValidate>
                <fieldset>
                    <legend>Datos personales</legend>
                    <div className="form-grid">
                        <CampoAdmin nombre="nombre" etiqueta="Nombre" error={f.errores.nombre}><input {...propsControl(f, "nombre")} required maxLength={50} /></CampoAdmin>
                        <CampoAdmin nombre="apellidos" etiqueta="Apellidos" error={f.errores.apellidos}><input {...propsControl(f, "apellidos")} required maxLength={100} /></CampoAdmin>
                        <CampoAdmin nombre="fechaNacimiento" etiqueta="Fecha de nacimiento" opcional error={f.errores.fechaNacimiento}><input {...propsControl(f, "fechaNacimiento")} type="date" /></CampoAdmin>
                        <CampoAdmin nombre="contrasena" etiqueta="Nueva contraseña" opcional error={f.errores.contrasena}>
                            <input {...propsControl(f, "contrasena")} type="password" maxLength={10} autoComplete="new-password" placeholder="Conservar contraseña actual" />
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
                    <button type="submit" className="boton-admin boton-admin--primario" disabled={guardando}><Save aria-hidden="true" />Guardar cambios</button>
                </div>
            </form>
        </>
    );
}