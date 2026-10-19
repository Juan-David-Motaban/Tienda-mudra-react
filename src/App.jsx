import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TiendaProvider } from "./context/TiendaContext";
import TiendaLayout from "./components/TiendaLayout";
import AdminLayout from "./components/admin/AdminLayout";

import Home from "./pages/Home";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Nosotros from "./pages/Nosotros";
import { Blogs, BlogDetalle } from "./pages/Blogs";
import Contacto from "./pages/Contacto";
import IniciarSesion from "./pages/IniciarSesion";
import Registro from "./pages/Registro";
import Carrito from "./pages/Carrito";

import AdminLogin from "./pages/admin/AdminLogin";
import Resumen from "./pages/admin/Resumen";
import Listado from "./pages/admin/Listado";
import { DetalleProductoAdmin, DetalleUsuarioAdmin, DetalleOrdenAdmin } from "./pages/admin/Detalles";
import FormProducto from "./pages/admin/FormProducto";
import FormUsuario from "./pages/admin/FormUsuario";

export default function App() {
  return (
    <BrowserRouter>
      <TiendaProvider>
        <Routes>
          {/* Tienda */}
          <Route element={<TiendaLayout />}>
            <Route index element={<Home />} />
            <Route path="productos" element={<Productos />} />
            <Route path="productos/:id" element={<DetalleProducto />} />
            <Route path="nosotros" element={<Nosotros />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/:slug" element={<BlogDetalle />} />
            <Route path="contacto" element={<Contacto />} />
            <Route path="iniciosesion" element={<IniciarSesion />} />
            <Route path="registro" element={<Registro />} />
            <Route path="carrito" element={<Carrito />} />
          </Route>

          {/* Administración */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Resumen />} />
            <Route path="configurar" element={<FormUsuario inicial />} />
            <Route path="productos" element={<Listado tipo="productos" />} />
            <Route path="productos/nuevo" element={<FormProducto />} />
            <Route path="productos/:id" element={<DetalleProductoAdmin />} />
            <Route path="productos/:id/editar" element={<FormProducto />} />
            <Route path="usuarios" element={<Listado tipo="usuarios" />} />
            <Route path="usuarios/nuevo" element={<FormUsuario />} />
            <Route path="usuarios/:run" element={<DetalleUsuarioAdmin />} />
            <Route path="usuarios/:run/editar" element={<FormUsuario />} />
            <Route path="ordenes" element={<Listado tipo="ordenes" />} />
            <Route path="ordenes/:id" element={<DetalleOrdenAdmin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TiendaProvider>
    </BrowserRouter>
  );
}
