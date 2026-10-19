import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ExternalLink, LayoutDashboard, LogIn, LogOut, Menu, Package,
  ReceiptText, ShieldAlert, Store, Users, X, ArrowLeft
} from "lucide-react";
import { useTienda } from "../../context/TiendaContext";
import estiloAdmin from "../../styles/admin.css?inline";
import { useClaseBody, useHojaEstilos } from "../../lib/hooks";
import { AdminContext } from "./AdminContext";
import { EnlaceAdmin } from "./ui";

// Rutas que un Vendedor puede ver (solo lectura de productos y órdenes).
const RUTA_VENDEDOR = /^\/admin\/(productos(\/(?!nuevo$)[^/]+)?|ordenes(\/[^/]+)?)$/;

function Marca({ sesion }) {
  const destino = sesion?.rol === "Vendedor" ? "/admin/productos" : "/admin";
  return (
    <Link className="admin-marca" to={destino}>
      <span className="admin-marca__simbolo"><Store aria-hidden="true" /></span>
      <span><strong>Mudra</strong><small>ADMINISTRACIÓN</small></span>
    </Link>
  );
}

export default function AdminLayout() {
  useHojaEstilos(estiloAdmin);
  const { sesion, hayAdministrador, cerrarSesion, eliminarProducto, eliminarUsuario, productos, usuarios } = useTienda();
  const { pathname, state } = useLocation();
  const navegar = useNavigate();

  const [titulo, setTitulo] = useState("");
  const [aviso, setAviso] = useState(null);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);
  const [pendiente, setPendiente] = useState(null);
  const dialogo = useRef(null);
  const focoDialogo = useRef(null);
  const areaRef = useRef(null);
  const menuRef = useRef(null);
  const cerrarSidebarRef = useRef(null);

  useClaseBody("sidebar-abierta", sidebarAbierta);

  // Aviso que viene de la vista anterior (p. ej. "Producto guardado correctamente.").
  useEffect(() => {
    setAviso(state?.aviso ? { texto: state.aviso, tipo: "exito" } : null);
    setSidebarAbierta(false);
  }, [pathname, state]);

  const notificar = useCallback((texto, tipo = "exito") => setAviso({ texto, tipo }), []);

  /* ---------- Menú lateral (móvil) ---------- */
  useEffect(() => {
    if (areaRef.current) areaRef.current.inert = sidebarAbierta;
    if (sidebarAbierta) cerrarSidebarRef.current?.focus();
  }, [sidebarAbierta]);

  useEffect(() => {
    if (!sidebarAbierta) return undefined;
    const alTecla = (e) => {
      if (e.key === "Escape") { setSidebarAbierta(false); menuRef.current?.focus(); }
      if (e.key === "Tab") {
        const els = [...document.querySelectorAll(".admin-sidebar a, .admin-sidebar button")].filter((el) => el.getClientRects().length);
        const primero = els[0];
        const ultimo = els[els.length - 1];
        if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
      }
    };
    document.addEventListener("keydown", alTecla);
    return () => document.removeEventListener("keydown", alTecla);
  }, [sidebarAbierta]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 901px)");
    const alCambiar = (e) => { if (e.matches) setSidebarAbierta(false); };
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);

  /* ---------- Diálogo de eliminación ---------- */
  const pedirEliminacion = useCallback((tipo, id, boton) => {
    focoDialogo.current = boton;
    setPendiente({ tipo, id });
  }, []);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (pendiente && !d.open) d.showModal();
  }, [pendiente]);

  const registroPendiente = pendiente && (pendiente.tipo === "producto"
    ? productos.find((p) => p.id === pendiente.id)
    : usuarios.find((u) => u.run === pendiente.id));

  const cerrarDialogo = () => dialogo.current?.close();
  const alCerrarDialogo = () => {
    setPendiente(null);
    if (focoDialogo.current?.isConnected) focoDialogo.current.focus();
  };

  const confirmarEliminacion = () => {
    if (!pendiente) return;
    try {
      if (pendiente.tipo === "producto") eliminarProducto(pendiente.id);
      else eliminarUsuario(pendiente.id);
      cerrarDialogo();
      notificar("El registro se eliminó correctamente.");
    } catch (error) {
      cerrarDialogo();
      notificar(error.message, "error");
    }
  };

  const contexto = useMemo(() => ({ setTitulo, notificar, pedirEliminacion }), [notificar, pedirEliminacion]);

  /* ---------- Control de acceso ---------- */
  const configurando = pathname === "/admin/configurar";
  if (!hayAdministrador && !configurando) return <Navigate to="/admin/login" replace />;

  if (configurando) {
    return (
      <AdminContext.Provider value={contexto}>
        <main className="admin-inicial" id="admin-contenido">
          <Marca sesion={null} />
          <div className="encabezado-pagina">
            <div><h1>Configurar administración</h1><p>Crea la primera cuenta administradora de Tienda Mudra.</p></div>
            <div className="encabezado-acciones" />
          </div>
          <div id="aviso-admin" className={`aviso aviso--${aviso?.tipo || "exito"}`} role="status" hidden={!aviso}>{aviso?.texto}</div>
          <div id="admin-vista"><Outlet /></div>
        </main>
      </AdminContext.Provider>
    );
  }

  if (!sesion) return <Navigate to="/admin/login" replace />;

  const permitido = sesion.rol === "Administrador" || (sesion.rol === "Vendedor" && RUTA_VENDEDOR.test(pathname.replace(/\/$/, "")));
  if (!permitido) {
    return (
      <main className="admin-bloqueo" id="admin-contenido">
        <ShieldAlert aria-hidden="true" />
        <h1>Acceso restringido</h1>
        <p>Tu perfil no tiene acceso a esta sección.</p>
        <EnlaceAdmin to={sesion.rol === "Vendedor" ? "/admin/productos" : "/"} icono={ArrowLeft}>
          {sesion.rol === "Vendedor" ? "Ver productos" : "Volver a la tienda"}
        </EnlaceAdmin>{" "}
        <EnlaceAdmin to="/admin/login" icono={LogIn}>Ingresar con otra cuenta</EnlaceAdmin>
      </main>
    );
  }

  const admin = sesion.rol === "Administrador";
  const seccion = pathname.startsWith("/admin/productos") ? "productos"
    : pathname.startsWith("/admin/usuarios") ? "usuarios"
    : pathname.startsWith("/admin/ordenes") ? "ordenes" : "inicio";
  const entradas = [
    ...(admin ? [["inicio", "/admin", "Resumen", LayoutDashboard]] : []),
    ["productos", "/admin/productos", "Productos", Package],
    ["ordenes", "/admin/ordenes", "Órdenes", ReceiptText],
    ...(admin ? [["usuarios", "/admin/usuarios", "Usuarios", Users]] : [])
  ];

  return (
    <AdminContext.Provider value={contexto}>
      <a className="saltar-contenido" href="#admin-contenido">Saltar al contenido</a>
      <div id="admin-root">
        <button className="sidebar-fondo" tabIndex={-1} aria-label="Cerrar menú" onClick={() => setSidebarAbierta(false)} />
        <aside className="admin-sidebar" id="admin-sidebar" aria-label="Menú administrativo">
          <Marca sesion={sesion} />
          <button ref={cerrarSidebarRef} className="boton-icono sidebar-cerrar" aria-label="Cerrar menú" onClick={() => { setSidebarAbierta(false); menuRef.current?.focus(); }}>
            <X aria-hidden="true" />
          </button>
          <div className="sidebar-seccion">Gestión de tienda</div>
          <nav className="admin-nav" aria-label="Administración">
            {entradas.map(([id, url, texto, Icono]) => (
              <Link key={id} to={url} aria-current={seccion === id ? "page" : undefined}><Icono aria-hidden="true" />{texto}</Link>
            ))}
          </nav>
          <div className="sidebar-pie">
            <Link to="/"><ExternalLink aria-hidden="true" />Ver tienda</Link>
            <button type="button" onClick={() => { cerrarSesion(); navegar("/admin/login"); }}>
              <LogOut aria-hidden="true" />Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="admin-area" ref={areaRef}>
          <header className="admin-topbar">
            <div className="admin-topbar__titulo">
              <button ref={menuRef} className="boton-icono menu-abrir" type="button" aria-controls="admin-sidebar" aria-expanded={sidebarAbierta} aria-label="Abrir menú" onClick={() => setSidebarAbierta(true)}>
                <Menu aria-hidden="true" />
              </button>
              <span>Tienda Mudra / {titulo}</span>
            </div>
            <div className="admin-identidad">
              <span className="avatar">{(sesion.nombre || "M").slice(0, 1).toUpperCase()}</span>
              <div><strong>{sesion.nombre}</strong><small>{sesion.rol}</small></div>
            </div>
          </header>
          <main className="admin-contenido" id="admin-contenido">
            <div id="aviso-admin" className={`aviso aviso--${aviso?.tipo || "exito"}`} role="status" hidden={!aviso}>{aviso?.texto}</div>
            <div id="admin-vista"><Outlet /></div>
          </main>
        </div>

        <dialog ref={dialogo} id="confirmar-eliminacion" aria-labelledby="titulo-eliminacion" onClose={alCerrarDialogo}>
          <h2 id="titulo-eliminacion">Eliminar {pendiente?.tipo}</h2>
          <p id="texto-eliminacion">
            {registroPendiente ? `Se eliminará "${registroPendiente.nombre}". Esta acción no se puede deshacer. Las órdenes anteriores conservarán sus datos.` : ""}
          </p>
          <div className="formulario-pie">
            <button type="button" className="boton-admin" onClick={cerrarDialogo} autoFocus>Cancelar</button>
            <button type="button" className="boton-admin boton-admin--peligro" onClick={confirmarEliminacion}>Eliminar</button>
          </div>
        </dialog>
      </div>
    </AdminContext.Provider>
  );
}


