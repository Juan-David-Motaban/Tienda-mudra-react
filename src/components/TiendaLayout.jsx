import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import puente from "../styles/bootstrap-puente.css?inline";
import estiloTienda from "../styles/estilo.css?inline";
import estiloExtra from "../styles/tienda-extra.css?inline";
import { useHojaEstilos } from "../lib/hooks";

export default function TiendaLayout() {
  useHojaEstilos(puente + "\n" + estiloTienda + "\n" + estiloExtra);
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
