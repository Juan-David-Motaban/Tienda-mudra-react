import { act, renderHook } from "@testing-library/react";
import { TiendaProvider, useTienda } from "./TiendaContext";
import { CLAVE_CARRITO, guardarProductos } from "../lib/almacen";
import { instalarAlmacenFalso } from "../testing/ayudas";

const entrega = {
  nombre: "Ana", apellidos: "Pérez", correo: "ana@duoc.cl", calle: "Av. 1", departamento: "",
  region: "Región Metropolitana", comuna: "Santiago", indicaciones: ""
};

const productoNuevo = {
  id: "new01", nombre: "Producto nuevo", descripcion: "", categoria: "Polerones",
  precio: "15000", precioOferta: "12000", stock: "4", stockCritico: "", material: "", img: ""
};

// Prueba de integración: el proveedor real con localStorage reemplazado por un mock en memoria.
describe("TiendaContext", () => {
  let almacen;
  let ctx; // acceso al valor actual del contexto (siempre el último render)

  const montar = () => {
    const { result } = renderHook(() => useTienda(), { wrapper: TiendaProvider });
    ctx = () => result.current;
    return result;
  };
  const ejecutar = (accion) => {
    let retorno;
    act(() => { retorno = accion(ctx()); });
    return retorno;
  };
  const entrarComoAdmin = () => ejecutar((t) => t.iniciarSesion("admin@duoc.cl", "Admin123"));

  beforeEach(() => {
    almacen = instalarAlmacenFalso();
    guardarProductos([
      { id: "A1", nombre: "Polerón", precio: 10000, precioOferta: 8000, stock: 5, stockCritico: 1, categoria: "Polerones", img: "" },
      { id: "B2", nombre: "Gorro", precio: 3000, precioOferta: null, stock: 1, stockCritico: 0, categoria: "Accesorios", img: "" }
    ]);
    montar();
  });

  it("parte con el catálogo guardado, sin carrito y sin sesión", () => {
    expect(ctx().productos.length).toBe(2);
    expect(ctx().carrito).toEqual([]);
    expect(ctx().totalItems).toBe(0);
    expect(ctx().sesion).toBeNull();
  });

  describe("carrito", () => {
    it("agregar suma unidades, usa el precio de oferta en el total y abre el panel", () => {
      const ok = ejecutar((t) => t.agregarAlCarrito("A1", 2));
      expect(ok).toBeTrue();
      expect(ctx().totalItems).toBe(2);
      expect(ctx().totalCarrito).toBe(16000);
      expect(ctx().carritoAbierto).toBeTrue();
      expect(JSON.parse(almacen.get(CLAVE_CARRITO))).toEqual([{ id: "A1", cant: 2 }]);
    });

    it("no permite superar el stock disponible", () => {
      const ok = ejecutar((t) => t.agregarAlCarrito("B2", 2));
      expect(ok).toBeFalse();
      expect(ctx().totalItems).toBe(0);
      expect(ctx().mensajeCarrito).toBe("Stock disponible de Gorro: 1 unidades.");
    });

    it("rechaza cantidades no válidas", () => {
      expect(ejecutar((t) => t.agregarAlCarrito("A1", 0))).toBeFalse();
      expect(ejecutar((t) => t.agregarAlCarrito("A1", 1.5))).toBeFalse();
      expect(ejecutar((t) => t.agregarAlCarrito("NO-EXISTE", 1))).toBeFalse();
      expect(ctx().totalItems).toBe(0);
    });

    it("cambiarCantidad actualiza la línea y respeta el stock", () => {
      ejecutar((t) => t.agregarAlCarrito("A1", 1));
      expect(ejecutar((t) => t.cambiarCantidad("A1", 4))).toEqual({ ok: true });
      expect(ctx().totalItems).toBe(4);
      const rechazo = ejecutar((t) => t.cambiarCantidad("A1", 9));
      expect(rechazo.ok).toBeFalse();
      expect(rechazo.mensaje).toBe("Stock disponible de Polerón: 5 unidades.");
      expect(ctx().totalItems).toBe(4);
    });

    it("cambiarCantidad a 0 quita el producto", () => {
      ejecutar((t) => t.agregarAlCarrito("A1", 2));
      ejecutar((t) => t.cambiarCantidad("A1", 0));
      expect(ctx().carrito).toEqual([]);
    });

    it("quitarDelCarrito y vaciarCarrito eliminan ítems", () => {
      ejecutar((t) => t.agregarAlCarrito("A1", 1));
      ejecutar((t) => t.quitarDelCarrito("A1"));
      expect(ctx().totalItems).toBe(0);
      ejecutar((t) => t.agregarAlCarrito("A1", 1));
      ejecutar((t) => t.vaciarCarrito());
      expect(ctx().totalItems).toBe(0);
    });

    it("se sincroniza cuando otra pestaña modifica el carrito (evento storage)", () => {
      almacen.set(CLAVE_CARRITO, JSON.stringify([{ id: "A1", cant: 3 }]));
      act(() => { window.dispatchEvent(new StorageEvent("storage", { key: CLAVE_CARRITO })); });
      expect(ctx().totalItems).toBe(3);
    });
  });

  describe("compra", () => {
    it("un pago aprobado registra la orden, descuenta stock y vacía el carrito", () => {
      ejecutar((t) => t.agregarAlCarrito("A1", 2));
      const orden = ejecutar((t) => t.finalizarCompra(entrega, true));
      expect(orden.estado).toBe("Pagada");
      expect(ctx().carrito).toEqual([]);
      expect(ctx().productos.find((p) => p.id === "A1").stock).toBe(3);
      expect(ctx().ordenes.length).toBe(1);
    });

    it("un pago rechazado guarda la orden sin tocar el stock y conserva el carrito", () => {
      ejecutar((t) => t.agregarAlCarrito("A1", 2));
      const orden = ejecutar((t) => t.finalizarCompra(entrega, false));
      expect(orden.estado).toBe("Pago rechazado");
      expect(ctx().totalItems).toBe(2);
      expect(ctx().productos.find((p) => p.id === "A1").stock).toBe(5);
      expect(ctx().ordenes[0].estado).toBe("Pago rechazado");
    });
  });

  describe("sesión y cuentas", () => {
    it("iniciarSesion con credenciales correctas guarda la sesión", () => {
      const r = entrarComoAdmin();
      expect(r.usuario.rol).toBe("Administrador");
      expect(ctx().sesion.correo).toBe("admin@duoc.cl");
      expect(ctx().esAdministrador).toBeTrue();
    });

    it("ignora mayúsculas en el correo", () => {
      expect(ejecutar((t) => t.iniciarSesion("ADMIN@duoc.cl", "Admin123")).usuario).toBeDefined();
    });

    it("rechaza una contraseña incorrecta", () => {
      const r = ejecutar((t) => t.iniciarSesion("admin@duoc.cl", "incorrecta"));
      expect(r.error).toBe("El correo o la contraseña no coinciden con una cuenta registrada.");
      expect(ctx().sesion).toBeNull();
    });

    it("el acceso al panel exige rol administrativo", () => {
      const r = ejecutar((t) => t.iniciarSesion("cliente@duoc.cl", "Cliente1", true));
      expect(r.error).toContain("no tiene acceso administrativo");
      expect(ctx().sesion).toBeNull();
    });

    it("cerrarSesion elimina la sesión", () => {
      entrarComoAdmin();
      ejecutar((t) => t.cerrarSesion());
      expect(ctx().sesion).toBeNull();
    });

    it("registrarCliente crea la cuenta y rechaza correo o RUN repetidos", () => {
      const cliente = {
        run: "10000013K", nombre: "Luis", apellidos: "Soto", correo: "luis@gmail.com", contrasena: "abcd",
        fechaNacimiento: "", region: "Región Metropolitana", comuna: "Santiago", direccion: "Calle 2"
      };
      expect(ejecutar((t) => t.registrarCliente(cliente)).ok).toBeTrue();
      expect(ctx().usuarios.some((u) => u.correo === "luis@gmail.com" && u.rol === "Cliente")).toBeTrue();
      const repetido = ejecutar((t) => t.registrarCliente(cliente));
      expect(repetido.errores.correo).toBe("Ya existe una cuenta con este correo.");
      expect(repetido.errores.run).toBe("Ya existe una cuenta con este RUN.");
    });
  });

  describe("administración (permisos y CRUD)", () => {
    it("sin ser administrador no se puede guardar un producto", () => {
      expect(() => ctx().guardarProducto(productoNuevo)).toThrowError("Tu cuenta no tiene permiso para realizar esta operación.");
    });

    it("un administrador crea productos (código en mayúsculas y oferta numérica)", () => {
      entrarComoAdmin();
      const r = ejecutar((t) => t.guardarProducto(productoNuevo));
      expect(r.producto.id).toBe("NEW01");
      expect(r.producto.precioOferta).toBe(12000);
      expect(ctx().productos.length).toBe(3);
    });

    it("devuelve los errores de validación en lugar de guardar", () => {
      entrarComoAdmin();
      const r = ejecutar((t) => t.guardarProducto({ ...productoNuevo, precio: "" }));
      expect(r.errores.precio).toBeDefined();
      expect(ctx().productos.length).toBe(2);
    });

    it("un administrador elimina productos", () => {
      entrarComoAdmin();
      ejecutar((t) => t.eliminarProducto("B2"));
      expect(ctx().productos.map((p) => p.id)).toEqual(["A1"]);
    });

    it("crea categorías con identificador slug", () => {
      entrarComoAdmin();
      expect(ejecutar((t) => t.guardarCategoria({ nombre: "Gorros de Lana" })).ok).toBeTrue();
      expect(ctx().categorias.some((c) => c.id === "gorros-de-lana")).toBeTrue();
    });

    it("renombrar una categoría actualiza los productos que la usan", () => {
      entrarComoAdmin();
      ejecutar((t) => t.guardarCategoria({ nombre: "Hoodies" }, "polerones"));
      expect(ctx().productos.find((p) => p.id === "A1").categoria).toBe("Hoodies");
    });

    it("no permite eliminar una categoría que tiene productos", () => {
      entrarComoAdmin();
      expect(() => ctx().eliminarCategoria("polerones")).toThrowError(/producto\(s\) usan la categoría "Polerones"/);
    });

    it("no permite eliminar la propia cuenta", () => {
      entrarComoAdmin();
      expect(() => ctx().eliminarUsuario("123456785")).toThrowError("No puedes eliminar tu propia cuenta.");
    });
  });
});
