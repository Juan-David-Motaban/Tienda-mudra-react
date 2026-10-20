import { createContext, useContext, useEffect } from "react";

export const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

/** Fija el título de la barra superior (y de la pestaña) para la vista actual. */
export function useAdminPagina(titulo) {
  const { setTitulo } = useAdmin();
  useEffect(() => {
    setTitulo(titulo);
    document.title = `${titulo} | Administración Mudra`;
  }, [titulo, setTitulo]);
}
