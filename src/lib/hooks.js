import { useEffect, useLayoutEffect } from "react";

/** Inyecta una hoja de estilos (string CSS) mientras el componente está montado.
 *  Así el CSS de la tienda y el del panel admin no se mezclan entre sí. */
export function useHojaEstilos(css) {
  useLayoutEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => el.remove();
  }, [css]);
}

/** Agrega/quita una clase en <body> según `activa`. */
export function useClaseBody(clase, activa = true) {
  useEffect(() => {
    if (!clase || !activa) return undefined;
    document.body.classList.add(clase);
    return () => document.body.classList.remove(clase);
  }, [clase, activa]);
}

export function useTituloPagina(titulo) {
  useEffect(() => { document.title = titulo; }, [titulo]);
}
