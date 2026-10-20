import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { erroresCategoria } from "../../lib/validaciones";
import { useFormulario } from "../../lib/useFormulario";
import { useAdmin, useAdminPagina } from "../../components/admin/AdminContext";
import { CampoAdmin, Cabecera, EnlaceAdmin, NoEncontrado, propsControl } from "../../components/admin/ui";

export default function FormCategoria() {
  const { id } = useParams();
  const { categorias } = useTienda();
  const categoria = id ? categorias.find((c) => c.id === id) : null;
  useAdminPagina(id ? "Editar categoría" : "Nueva categoría");
  if (id && !categoria) return <NoEncontrado tipo="categoría" volver="/admin/categorias" />;
  return <Formulario key={id || "nueva"} categoria={categoria} />;
}

function Formulario({ categoria }) {
  const { categorias, guardarCategoria } = useTienda();
  const { notificar } = useAdmin();
  const navegar = useNavigate();
  const f = useFormulario({ nombre: categoria?.nombre || "" }, (v) => erroresCategoria(v, categorias, categoria?.id));

  const enviar = (e) => {
    e.preventDefault();
    if (!f.validarTodo(e.currentTarget)) return;
    try {
      const r = guardarCategoria(f.valores, categoria?.id);
      if (r.errores) { f.setErrores(r.errores); return; }
      navegar("/admin/categorias", { state: { aviso: "Categoría guardada correctamente." } });
    } catch (error) {
      notificar(error.message, "error");
    }
  };

  return (
    <>
      <Cabecera titulo={categoria ? "Editar categoría" : "Nueva categoría"} subtitulo={categoria?.id}>
        <EnlaceAdmin to="/admin/categorias" icono={ArrowLeft}>Volver</EnlaceAdmin>
      </Cabecera>
      <form className="formulario-admin" onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Datos de la categoría</legend>
          <div className="row g-3">
            <CampoAdmin col nombre="nombre" etiqueta="Nombre" ancho error={f.errores.nombre}>
              <input {...propsControl(f, "nombre")} required maxLength={40} />
            </CampoAdmin>
          </div>
        </fieldset>
        <div className="formulario-pie">
          <EnlaceAdmin to="/admin/categorias">Cancelar</EnlaceAdmin>
          <button type="submit" className="boton-admin boton-admin--primario"><Save aria-hidden="true" />Guardar categoría</button>
        </div>
      </form>
    </>
  );
}
