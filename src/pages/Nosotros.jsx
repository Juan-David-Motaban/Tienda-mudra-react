import { useTituloPagina } from "../lib/hooks";

export default function Nosotros() {
  useTituloPagina("Nosotros | Tienda Mudra");
  return (
    <main className="contenedor nosotros-pagina">
      <section className="nosotros-intro" aria-labelledby="titulo-nosotros">
        <p className="cuenta-intro__etiqueta">Tienda Mudra</p>
        <h1 id="titulo-nosotros">Ropa urbana para moverse con libertad</h1>
        <p>Tienda Mudra es una propuesta académica de comercio electrónico enfocada en prendas urbanas, funcionales y fáciles de combinar.</p>
      </section>
      <section className="row row-cols-1 row-cols-md-2 g-4" aria-label="Información de Tienda Mudra">
        <div className="col">
        <article className="nosotros-bloque h-100">
          <h2>Qué hacemos</h2>
          <p>Mostramos un catálogo de polerones, pantalones y accesorios con información clara de precio, material y disponibilidad. El carrito permite preparar una compra antes de finalizarla.</p>
        </article>
        </div>
        <div className="col">
        <article className="nosotros-bloque h-100">
          <h2>Cómo trabajamos</h2>
          <p>El proyecto usa React, HTML y CSS. La tienda y el panel administrativo comparten el mismo catálogo para que los cambios de inventario se reflejen en la experiencia del cliente.</p>
        </article>
        </div>
        <div className="col">
        <article className="nosotros-bloque h-100">
          <h2>Equipo de desarrollo</h2>
          <p>Proyecto desarrollado por un equipo de estudiantes de Desarrollo Full Stack, encargado del diseño visual, la implementación de la interfaz y las validaciones de cada flujo.</p>
        </article>
        </div>
        <div className="col">
        <article className="nosotros-bloque h-100">
          <h2>Objetivo</h2>
          <ul>
            <li>Facilitar la navegación por el catálogo.</li>
            <li>Registrar compras simuladas con datos del cliente.</li>
            <li>Administrar productos y usuarios mediante roles.</li>
          </ul>
        </article>
        </div>
      </section>
    </main>
  );
}
