import { Link, Navigate, useParams } from "react-router-dom";
import { useTituloPagina } from "../lib/hooks";

export const ARTICULOS = [
  {
    slug: "historia-moda-urbana",
    categoria: "Cultura urbana",
    titulo: "Historia de la moda urbana",
    resumen: "Desde los deportes de calle y el hip-hop hasta las colecciones actuales, revisamos cómo la ciudad convirtió la ropa cotidiana en una forma de identidad.",
    bajada: "La ciudad transformó prendas funcionales en códigos visuales que hoy reconocemos en cualquier esquina.",
    imgLista: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    altLista: "Persona con ropa urbana en la ciudad",
    imgDetalle: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1600&q=85",
    altDetalle: "Estilo urbano en una calle de ciudad",
    pie: "La ropa urbana combina identidad, comodidad y referencias de la vida cotidiana.",
    cuerpo: [
      "La moda urbana se construyó lejos de las pasarelas tradicionales. Durante las décadas de 1970 y 1980, comunidades ligadas al skate, el básquetbol, el breakdance y el hip-hop comenzaron a adaptar ropa resistente y cómoda para moverse por la ciudad.",
      "Las zapatillas, las poleras gráficas, los pantalones amplios y los polerones dejaron de ser prendas exclusivamente deportivas. Pasaron a comunicar pertenencia: a un barrio, a una escena musical o a una manera particular de ocupar el espacio público.",
      "Con el tiempo, marcas independientes y grandes firmas observaron ese lenguaje visual. La ropa urbana llegó a nuevos públicos, pero mantuvo elementos muy reconocibles: siluetas relajadas, capas, logos, telas duraderas y accesorios prácticos.",
      "Hoy el streetwear sigue cambiando porque toma referencias de muchas partes. Una prenda puede mezclar utilidad, comodidad y memoria cultural. Esa libertad es la razón por la que la moda urbana sigue siendo una fuente constante de inspiración."
    ]
  },
  {
    slug: "polerones-oversize",
    categoria: "Guía de estilo",
    titulo: "Por qué elegir un polerón oversize",
    resumen: "Comodidad, capas y proporción: tres razones para que un polerón amplio se convierta en una pieza útil para armar looks urbanos durante todo el año.",
    bajada: "Una silueta relajada puede resolver comodidad, capas y proporción sin perder personalidad.",
    imgLista: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
    altLista: "Polerón oscuro de estilo oversize",
    imgDetalle: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1600&q=85",
    altDetalle: "Polerón oscuro de estilo oversize",
    pie: "El volumen controlado ayuda a crear combinaciones cómodas y versátiles.",
    cuerpo: [
      "Un polerón oversize no significa simplemente usar una talla más grande. Su corte está pensado para dejar espacio en hombros, mangas y torso, creando una silueta amplia que se mueve con facilidad.",
      "La comodidad es una de sus principales ventajas. Al no ajustar demasiado el cuerpo, funciona bien para caminar, estudiar, viajar o pasar largas horas fuera de casa. Además, permite agregar una polera o una capa ligera debajo sin sentir rigidez.",
      "También es una prenda muy útil para equilibrar proporciones. Puede combinarse con pantalones cargo, jeans rectos o prendas más ajustadas en la parte inferior. La clave está en dejar que una sola pieza lleve el volumen principal del conjunto.",
      "Para elegirlo, conviene revisar el largo de mangas, la calidad del algodón y el tipo de puño. Un diseño limpio en colores neutros dura más temporadas; una gráfica llamativa puede convertirse en el punto central de un look urbano."
    ]
  }
];

export function Blogs() {
  useTituloPagina("Blogs | Tienda Mudra");
  return (
    <main className="contenedor blog-listado">
      <section className="blog-encabezado" aria-labelledby="titulo-blog">
        <p className="cuenta-intro__etiqueta">Blog Mudra</p>
        <h1 id="titulo-blog">Historias que nacen en la calle</h1>
        <p>Ideas, referencias y datos curiosos para entender mejor la ropa urbana que usamos todos los días.</p>
      </section>
      <section className="blog-grid" aria-label="Artículos del blog">
        {ARTICULOS.map((a) => (
          <article className="blog-tarjeta" key={a.slug}>
            <img src={a.imgLista} alt={a.altLista} loading="lazy" />
            <div className="blog-tarjeta__contenido">
              <p className="blog-tarjeta__categoria">{a.categoria}</p>
              <h2>{a.titulo}</h2>
              <p>{a.resumen}</p>
              <Link className="boton-secundario" to={`/blogs/${a.slug}`}>Leer artículo</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export function BlogDetalle() {
  const { slug } = useParams();
  const a = ARTICULOS.find((x) => x.slug === slug);
  useTituloPagina(a ? `${a.titulo} | Tienda Mudra` : "Blogs | Tienda Mudra");
  if (!a) return <Navigate to="/blogs" replace />;
  return (
    <main className="contenedor blog-detalle">
      <Link className="blog-volver" to="/blogs">Volver a Blogs</Link>
      <article>
        <div className="blog-detalle__encabezado">
          <p className="blog-tarjeta__categoria">{a.categoria}</p>
          <h1>{a.titulo}</h1>
          <p>{a.bajada}</p>
        </div>
        <figure className="blog-detalle__imagen">
          <img src={a.imgDetalle} alt={a.altDetalle} />
          <figcaption>{a.pie}</figcaption>
        </figure>
        <div className="blog-detalle__cuerpo">
          {a.cuerpo.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
        </div>
      </article>
    </main>
  );
}
