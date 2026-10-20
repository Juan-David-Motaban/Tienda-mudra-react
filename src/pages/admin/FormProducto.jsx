import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageOff, Save } from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import { erroresProducto } from "../../lib/validaciones";
import { useFormulario } from "../../lib/useFormulario";
import { useAdmin, useAdminPagina } from "../../components/admin/AdminContext";
import { CampoAdmin, Cabecera, EnlaceAdmin, ImagenAdmin, NoEncontrado, propsControl } from "../../components/admin/ui";

const VACIO = { id: "", nombre: "", categoria: "", precio: "", precioOferta: "", stock: "", stockCritico: "", descripcion: "", material: "", img: "" };
const TIPOS_IMAGEN = ["image/png", "image/jpeg", "image/webp"];

export default function FormProducto() {
  const { id } = useParams();
  const { productos } = useTienda();
  const producto = id ? productos.find((p) => p.id === id) : null;
  useAdminPagina(id ? "Editar producto" : "Nuevo producto");
  if (id && !producto) return <NoEncontrado tipo="producto" volver="/admin/productos" />;
  return <Formulario key={id || "nuevo"} producto={producto} />;
}

function Formulario({ producto }) {
  const { productos, categorias, guardarProducto } = useTienda();
  const { notificar } = useAdmin();
  const navegar = useNavigate();

  const inicial = producto ? {
    id: producto.id, nombre: producto.nombre, categoria: producto.categoria || "",
    precio: String(producto.precio), precioOferta: producto.precioOferta == null ? "" : String(producto.precioOferta),
    stock: String(producto.stock),
    stockCritico: producto.stockCritico == null ? "" : String(producto.stockCritico),
    descripcion: producto.descripcion || "", material: producto.material || "",
    img: producto.img?.startsWith("data:") ? "" : producto.img || ""
  } : VACIO;

  // Imagen subida desde un archivo (data URL); tiene prioridad sobre la URL escrita.
  const [imagenCargada, setImagenCargada] = useState(producto?.img?.startsWith("data:") ? producto.img : null);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [leyendo, setLeyendo] = useState(false);
  const archivoRef = useRef(null);

  const datos = (v) => ({ ...v, img: imagenCargada ?? v.img });
  const f = useFormulario(inicial, (v) => erroresProducto(datos(v), productos, categorias.map((c) => c.nombre), producto?.id));
  const v = f.valores;

  const stockBajo = v.stock !== "" && v.stockCritico !== "" && Number.isFinite(Number(v.stock)) && Number.isFinite(Number(v.stockCritico))
    && Number(v.stock) >= 0 && Number(v.stockCritico) >= 0 && Number(v.stock) <= Number(v.stockCritico);

  const alCambiarArchivo = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (!TIPOS_IMAGEN.includes(archivo.type) || archivo.size > 750 * 1024) {
      setErrorArchivo("Selecciona una imagen PNG, JPG o WebP de hasta 750 KB.");
      return;
    }
    setErrorArchivo("");
    setLeyendo(true);
    try {
      const url = await new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onload = () => resolve(lector.result);
        lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
        lector.readAsDataURL(archivo);
      });
      setImagenCargada(url);
      f.cambiar({ img: "" });
    } catch (err) {
      setErrorArchivo(err.message);
    } finally {
      setLeyendo(false);
    }
  };

  const quitarImagen = () => {
    setImagenCargada(null);
    f.cambiar({ img: "" });
    if (archivoRef.current) archivoRef.current.value = "";
    setErrorArchivo("");
  };

  const enviar = (e) => {
    e.preventDefault();
    if (leyendo || errorArchivo) { notificar("Revisa la imagen antes de guardar.", "error"); return; }
    if (!f.validarTodo(e.currentTarget)) return;
    try {
      const r = guardarProducto(datos(v), producto?.id);
      if (r.errores) { f.setErrores(r.errores); return; }
      navegar("/admin/productos", { state: { aviso: "Producto guardado correctamente." } });
    } catch (error) {
      notificar(error.name === "QuotaExceededError" ? "No hay espacio para guardar. Prueba con una imagen más pequeña o una URL." : error.message, "error");
    }
  };

  const urlImg = f.propsCampo("img");
  return (
    <>
      <Cabecera titulo={producto ? "Editar producto" : "Nuevo producto"} subtitulo={producto ? producto.id : ""}>
        <EnlaceAdmin to="/admin/productos" icono={ArrowLeft}>Volver</EnlaceAdmin>
      </Cabecera>
      <form className="formulario-admin" onSubmit={enviar} noValidate>
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <fieldset>
              <legend>Información del producto</legend>
              <div className="row g-3">
                <CampoAdmin col nombre="id" etiqueta="Código" error={f.errores.id}>
                  <input {...propsControl(f, "id")} required disabled={!!producto} />
                </CampoAdmin>
                <CampoAdmin col nombre="categoria" etiqueta="Categoría" error={f.errores.categoria}>
                  <select {...propsControl(f, "categoria", { className: "control form-select" })} required>
                    <option value="">Seleccionar</option>
                    {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                  </select>
                </CampoAdmin>
                <CampoAdmin col nombre="nombre" etiqueta="Nombre" ancho error={f.errores.nombre}>
                  <input {...propsControl(f, "nombre")} required maxLength={100} />
                </CampoAdmin>
                <CampoAdmin col nombre="descripcion" etiqueta="Descripción" opcional ancho error={f.errores.descripcion}>
                  <textarea {...propsControl(f, "descripcion")} rows={3} maxLength={500} />
                </CampoAdmin>
                <CampoAdmin col nombre="material" etiqueta="Material" opcional ancho error={f.errores.material}>
                  <input {...propsControl(f, "material")} maxLength={100} />
                </CampoAdmin>
              </div>
            </fieldset>
            <fieldset>
              <legend>Precio e inventario</legend>
              <div className="row g-3">
                <CampoAdmin col nombre="precio" etiqueta="Precio (CLP)" error={f.errores.precio}>
                  <input {...propsControl(f, "precio")} type="number" min={0} step="any" required />
                </CampoAdmin>
                <CampoAdmin col nombre="precioOferta" etiqueta="Precio de oferta (CLP)" opcional error={f.errores.precioOferta}>
                  <input {...propsControl(f, "precioOferta")} type="number" min={0} step="any" />
                </CampoAdmin>
                <CampoAdmin col nombre="stock" etiqueta="Stock disponible" error={f.errores.stock}>
                  <input {...propsControl(f, "stock")} type="number" min={0} step="1" required />
                </CampoAdmin>
                <CampoAdmin col nombre="stockCritico" etiqueta="Stock crítico" opcional error={f.errores.stockCritico}>
                  <input {...propsControl(f, "stockCritico")} type="number" min={0} step="1" />
                </CampoAdmin>
              </div>
            </fieldset>
            <p className="aviso aviso--alerta" id="alerta-stock" role="status" hidden={!stockBajo}>
              Stock bajo: la cantidad disponible es igual o inferior al stock crítico.
            </p>
          </div>

          <aside className="imagen-editor col-12 col-lg-4">
            <fieldset>
              <legend>Imagen</legend>
              <div className="imagen-preview" id="preview-producto">
                <ImagenAdmin producto={{ nombre: v.nombre || "Imagen del producto", img: imagenCargada ?? v.img }} grande />
              </div>
              <CampoAdmin nombre="img" etiqueta="URL de imagen" opcional error={f.errores.img}>
                <input
                  {...propsControl(f, "img")} type="url" placeholder="https://..."
                  onChange={(e) => { setImagenCargada(null); urlImg.onChange(e); }}
                />
              </CampoAdmin>
              <div className="campo-admin">
                <label htmlFor="admin-archivo">Subir imagen <small>Opcional · PNG, JPG o WebP, hasta 750 KB</small></label>
                <input ref={archivoRef} className="control form-control" type="file" id="admin-archivo" accept={TIPOS_IMAGEN.join(",")} aria-describedby="error-admin-archivo" onChange={alCambiarArchivo} />
                <p id="error-admin-archivo" className="campo-error" hidden={!errorArchivo}>{errorArchivo}</p>
              </div>
              <button className="boton-admin" type="button" onClick={quitarImagen}><ImageOff aria-hidden="true" />Quitar imagen</button>
            </fieldset>
          </aside>
        </div>
        <div className="formulario-pie">
          <EnlaceAdmin to="/admin/productos">Cancelar</EnlaceAdmin>
          <button type="submit" className="boton-admin boton-admin--primario"><Save aria-hidden="true" />Guardar producto</button>
        </div>
      </form>
    </>
  );
}
