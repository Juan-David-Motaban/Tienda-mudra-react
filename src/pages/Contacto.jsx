import { useState } from "react";
import Campo from "../components/Campo";
import { guardarMensajeContacto } from "../lib/almacen";
import { erroresContacto } from "../lib/validaciones";
import { useFormulario } from "../lib/useFormulario";
import { useTituloPagina } from "../lib/hooks";

const VACIO = { nombre: "", correo: "", comentario: "" };

export default function Contacto() {
  useTituloPagina("Contacto | Tienda Mudra");
  const f = useFormulario(VACIO, erroresContacto);
  const [estado, setEstado] = useState({ texto: "", tipo: "exito" });

  const enviar = (e) => {
    e.preventDefault();
    setEstado({ texto: "", tipo: "exito" });
    const form = e.currentTarget;
    if (!f.validarTodo(form)) return;
    try {
      guardarMensajeContacto({
        id: `CONTACTO-${Date.now()}`, fecha: new Date().toISOString(),
        nombre: f.valores.nombre.trim(), correo: f.valores.correo.trim().toLowerCase(), comentario: f.valores.comentario.trim()
      });
      f.setValores(VACIO);
      f.setErrores({});
      setEstado({ texto: "Tu mensaje fue enviado correctamente. Te contactaremos pronto.", tipo: "exito" });
      form.elements.nombre.focus();
    } catch {
      setEstado({ texto: "No fue posible guardar tu mensaje. Inténtalo nuevamente.", tipo: "error" });
    }
  };

  return (
    <main className="contenedor contacto-pagina">
      <section className="contacto-intro" aria-labelledby="titulo-contacto">
        <p className="cuenta-intro__etiqueta">Contacto</p>
        <h1 id="titulo-contacto">Hablemos de tu próxima prenda</h1>
        <p>Escríbenos tus dudas, sugerencias o consultas sobre productos. Nuestro equipo registrará tu mensaje para revisarlo.</p>
      </section>
      <form className="contacto-formulario" onSubmit={enviar} noValidate>
        <h2>Envía tu mensaje</h2>
        <p className={`estado-formulario estado-formulario--${estado.tipo}`} role="status" hidden={!estado.texto}>{estado.texto}</p>
        <Campo id="nombre" etiqueta="Nombre completo" error={f.errores.nombre}>
          <input type="text" maxLength={100} autoComplete="name" required {...f.propsCampo("nombre")} />
        </Campo>
        <Campo id="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
          <input type="email" maxLength={100} autoComplete="email" required {...f.propsCampo("correo")} />
        </Campo>
        <Campo id="comentario" etiqueta="Comentario" error={f.errores.comentario}>
          <textarea rows={6} maxLength={500} required {...f.propsCampo("comentario")} />
        </Campo>
        <button type="submit" className="boton">Enviar mensaje</button>
      </form>
    </main>
  );
}
