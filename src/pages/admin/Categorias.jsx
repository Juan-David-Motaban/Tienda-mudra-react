import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { useAdmin, useAdminPagina } from "../../components/admin/AdminContext";
import { AccionIcono, Cabecera, EnlaceAdmin, EstadoVacio } from "../../components/admin/ui";

export default function Categorias() {
  useAdminPagina("Categorías");
  const { categorias, productos } = useTienda();
  const { pedirEliminacion } = useAdmin();
  return (
    <>
      <Cabecera titulo="Categorías" subtitulo="Organiza los productos del catálogo">
        <EnlaceAdmin to="/admin/categorias/nueva" icono={Plus} primario>Nueva categoría</EnlaceAdmin>
      </Cabecera>
      <div className="tabla-scroll table-responsive">
        {!categorias.length ? <EstadoVacio texto="Aún no hay categorías." icono={Tags} /> : (
          <table>
            <thead>
              <tr><th>Categoría</th><th>Código</th><th className="numero">Productos</th><th className="numero">Acciones</th></tr>
            </thead>
            <tbody>
              {categorias.map((c) => {
                const total = productos.filter((p) => p.categoria === c.nombre).length;
                return (
                  <tr key={c.id}>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.id}</td>
                    <td className="numero">{total}</td>
                    <td>
                      <div className="acciones-fila">
                        <AccionIcono to={`/admin/categorias/${encodeURIComponent(c.id)}/editar`} texto="Editar categoría" icono={Pencil} />
                        <button
                          type="button" className="boton-icono boton-icono--peligro" aria-label="Eliminar categoría"
                          data-tooltip="Eliminar categoría" onClick={(e) => pedirEliminacion("categoría", c.id, e.currentTarget)}
                        ><Trash2 aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
