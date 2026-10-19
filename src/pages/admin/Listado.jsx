import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { categoriasProductos } from "../../data/datos";
import { useAdminPagina } from "../../components/admin/AdminContext";
import { Cabecera, EnlaceAdmin, EstadoVacio, esStockBajo } from "../../components/admin/ui";
import { TablaOrdenes, TablaProductos, TablaUsuarios } from "./tablas";

const POR_PAGINA = 8;
const CONFIG = {
  productos: { titulo: "Productos", subtitulo: "Catálogo e inventario", placeholder: "Buscar nombre o código...", nuevo: ["/admin/productos/nuevo", "Nuevo producto"] },
  usuarios: { titulo: "Usuarios", subtitulo: "Cuentas y permisos", placeholder: "Buscar nombre, RUN o correo...", nuevo: ["/admin/usuarios/nuevo", "Nuevo usuario"] },
  ordenes: { titulo: "Órdenes", subtitulo: "Compras de la tienda", placeholder: "Buscar orden o cliente..." }
};

const norm = (t) => t.toLocaleLowerCase("es");

export default function Listado({ tipo }) {
  const cfg = CONFIG[tipo];
  useAdminPagina(cfg.titulo);
  const { productos, usuarios, ordenes, esAdministrador } = useTienda();
  const [consulta, setConsulta] = useState("");
  const [categoria, setCategoria] = useState("");
  const [stock, setStock] = useState("");
  const [rol, setRol] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => { setConsulta(""); setCategoria(""); setStock(""); setRol(""); setPagina(1); }, [tipo]);

  const registros = useMemo(() => {
    const q = norm(consulta.trim());
    if (tipo === "productos") {
      return productos.filter((p) =>
        norm(`${p.nombre} ${p.id}`).includes(q) && (!categoria || p.categoria === categoria) &&
        (!stock || (stock === "agotado" ? p.stock === 0 : esStockBajo(p))));
    }
    if (tipo === "usuarios") {
      return usuarios.filter((u) =>
        norm(`${u.nombre} ${u.apellidos} ${u.run} ${u.correo}`).includes(q) && (!rol || (u.rol || "Cliente") === rol));
    }
    return ordenes.filter((o) => norm(`${o.id} ${o.cliente.nombre} ${o.cliente.apellidos} ${o.cliente.correo}`).includes(q));
  }, [tipo, productos, usuarios, ordenes, consulta, categoria, stock, rol]);

  const paginas = Math.max(1, Math.ceil(registros.length / POR_PAGINA));
  const actual = Math.max(1, Math.min(pagina, paginas));
  const inicio = (actual - 1) * POR_PAGINA;
  const visibles = registros.slice(inicio, inicio + POR_PAGINA);
  const cambiar = (fn) => (e) => { fn(e.target.value); setPagina(1); };

  return (
    <>
      <Cabecera titulo={cfg.titulo} subtitulo={cfg.subtitulo}>
        {esAdministrador && cfg.nuevo && <EnlaceAdmin to={cfg.nuevo[0]} icono={Plus} primario>{cfg.nuevo[1]}</EnlaceAdmin>}
      </Cabecera>

      <div className="filtros">
        <div className="busqueda">
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="buscar-admin">Buscar</label>
          <input className="control" type="search" id="buscar-admin" placeholder={cfg.placeholder} value={consulta} onChange={cambiar(setConsulta)} />
        </div>
        {tipo === "productos" && (
          <>
            <select className="control" aria-label="Categoría" value={categoria} onChange={cambiar(setCategoria)}>
              <option value="">Todas las categorías</option>
              {categoriasProductos.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="control" aria-label="Disponibilidad" value={stock} onChange={cambiar(setStock)}>
              <option value="">Todo el inventario</option>
              <option value="bajo">Stock bajo</option>
              <option value="agotado">Agotados</option>
            </select>
          </>
        )}
        {tipo === "usuarios" && (
          <select className="control" aria-label="Tipo de usuario" value={rol} onChange={cambiar(setRol)}>
            <option value="">Todos los perfiles</option>
            <option>Administrador</option><option>Vendedor</option><option>Cliente</option>
          </select>
        )}
      </div>

      <div className="tabla-scroll" id="tabla-admin">
        {!registros.length ? <EstadoVacio texto="No hay registros que coincidan con la búsqueda." icono={Search} />
          : tipo === "productos" ? <TablaProductos productos={visibles} />
          : tipo === "usuarios" ? <TablaUsuarios usuarios={visibles} />
          : <TablaOrdenes ordenes={visibles} />}
      </div>

      <div className="paginacion">
        <span role="status">
          {registros.length ? `${inicio + 1}–${Math.min(inicio + POR_PAGINA, registros.length)} de ${registros.length} registros` : "0 registros"}
        </span>
        <div>
          <button type="button" className="boton-icono" aria-label="Página anterior" disabled={actual <= 1} onClick={() => setPagina(actual - 1)}><ChevronLeft aria-hidden="true" /></button>
          <span>{actual} / {paginas}</span>
          <button type="button" className="boton-icono" aria-label="Página siguiente" disabled={actual >= paginas} onClick={() => setPagina(actual + 1)}><ChevronRight aria-hidden="true" /></button>
        </div>
      </div>
    </>
  );
}
