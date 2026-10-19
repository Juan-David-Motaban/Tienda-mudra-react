import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import estiloTienda from "../styles/estilo.css?inline";
import { useHojaEstilos } from "../lib/hooks";

export default function TiendaLayout() {
  useHojaEstilos(estiloTienda);
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
