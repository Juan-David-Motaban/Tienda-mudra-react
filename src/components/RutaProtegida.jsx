import { Navigate } from "react-router-dom";
import { useTienda } from "../context/TiendaContext";

export default function RutaProtegida({ children, rolRequerido }) {
    const { sesion, cargandoSesion } = useTienda();

    if (cargandoSesion) {
        return <div className="container py-5 text-center">Verificando credenciales...</div>;
    }

    if (!sesion) {
        return <Navigate to={rolRequerido === "Administrador" ? "/admin/login" : "/iniciosesion"} replace />;
    }

    if (rolRequerido && sesion.rol !== rolRequerido) {
        return <Navigate to="/" replace />;
    }

    return children;
}