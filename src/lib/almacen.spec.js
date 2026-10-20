import {
  CLAVE_CARRITO, CLAVE_CATEGORIAS, CLAVE_ORDENES, CLAVE_PRODUCTOS, CUENTAS_DEMOSTRACION,
  borrarSesion, crearSlug, enOferta, formatearPrecio, guardarCarrito, guardarCategorias, guardarMensajeContacto,
  guardarProductos, guardarSesion, imagenProductoSegura, obtenerCarrito, obtenerCategorias, obtenerMensajesContacto,
  obtenerOrdenes, obtenerProductos, obtenerSesion, obtenerUsuarios, precioFinal, registrarOrden
} from "./almacen.js";
import { instalarAlmacenFalso } from "../testing/ayudas.jsx";

const entrega = {
  nombre: "Ana", apellidos: "Pérez", correo: "ana@duoc.cl", calle: "Av. Siempre Viva 123", departamento: "",
  region: "Región Metropolitana", comuna: "Santiago", indicaciones: ""
};

describe("almacen", () => {
  let almacen; // Map que reemplaza a localStorage durante cada prueba (mock)

  beforeEach(() => {
    almacen = instalarAlmacenFalso();
  });

  describe("precioFinal y enOferta", () => {
    it("usa el precio normal cuando no hay oferta", () => {
      expect(precioFinal({ precio: 10000 })).toBe(10000);
      expect(precioFinal({ precio: 10000, precioOferta: null })).toBe(10000);
      expect(enOferta({ precio: 10000, precioOferta: null })).toBeFalse();
    });

    it("usa el precio de oferta cuando es menor que el normal", () => {
      expect(precioFinal({ precio: 10000, precioOferta: 7500 })).toBe(7500);
      expect(enOferta({ precio: 10000, precioOferta: 7500 })).toBeTrue();
    });

    it("ignora ofertas iguales o mayores al precio normal y valores negativos", () => {
      expect(precioFinal({ precio: 10000, precioOferta: 10000 })).toBe(10000);
      expect(precioFinal({ precio: 10000, precioOferta: 12000 })).toBe(10000);
      expect(precioFinal({ precio: 10000, precioOferta: -5 })).toBe(10000);
    });
  });

  describe("formatearPrecio", () => {
    it("separa los miles con punto (formato chileno)", () => {
      expect(formatearPrecio(29990)).toBe("29.990");
      expect(formatearPrecio(1500000)).toBe("1.500.000");
    });
  });

  describe("crearSlug", () => {
    it("convierte un nombre en un identificador sin tildes ni espacios", () => {
      expect(crearSlug("Poleras de Verano")).toBe("poleras-de-verano");
      expect(crearSlug("  Ñandú & Co.  ")).toBe("nandu-co");
    });
  });

  describe("imagenProductoSegura", () => {
    it("acepta URLs http/https e imágenes en data URL", () => {
      expect(imagenProductoSegura("https://sitio.cl/foto.png")).toBe("https://sitio.cl/foto.png");
      expect(imagenProductoSegura("data:image/png;base64,AAAA")).toBe("data:image/png;base64,AAAA");
    });

    it("rechaza protocolos peligrosos y valores vacíos", () => {
      expect(imagenProductoSegura("javascript:alert(1)")).toBe("");
      expect(imagenProductoSegura("data:text/html;base64,AAAA")).toBe("");
      expect(imagenProductoSegura("")).toBe("");
    });
  });

  describe("productos", () => {
    it("devuelve el catálogo inicial cuando no hay nada guardado", () => {
      const productos = obtenerProductos();
      expect(productos.length).toBeGreaterThan(0);
      expect(productos.some((p) => p.id === "URB001")).toBeTrue();
    });

    it("guardarProductos escribe en localStorage y obtenerProductos lo lee", () => {
      guardarProductos([{ id: "X1", nombre: "Uno", precio: 1, stock: 1 }]);
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(CLAVE_PRODUCTOS, jasmine.any(String));
      expect(obtenerProductos()).toEqual([{ id: "X1", nombre: "Uno", precio: 1, stock: 1 }]);
    });

    it("vuelve al catálogo inicial si los datos guardados están corruptos", () => {
      almacen.set(CLAVE_PRODUCTOS, "{esto no es json");
      expect(obtenerProductos().some((p) => p.id === "URB001")).toBeTrue();
    });
  });

  describe("categorías", () => {
    it("crea categorías iniciales con id en formato slug", () => {
      const categorias = obtenerCategorias();
      expect(categorias.some((c) => c.nombre === "Polerones" && c.id === "polerones")).toBeTrue();
    });

    it("conserva las categorías guardadas", () => {
      guardarCategorias([{ id: "gorros", nombre: "Gorros" }]);
      expect(almacen.has(CLAVE_CATEGORIAS)).toBeTrue();
      expect(obtenerCategorias()).toEqual([{ id: "gorros", nombre: "Gorros" }]);
    });
  });

  describe("carrito", () => {
    it("está vacío por defecto", () => {
      expect(obtenerCarrito()).toEqual([]);
    });

    it("guarda y lee los ítems", () => {
      guardarCarrito([{ id: "URB001", cant: 2 }]);
      expect(obtenerCarrito()).toEqual([{ id: "URB001", cant: 2 }]);
    });

    it("descarta ítems inválidos y tolera datos corruptos", () => {
      almacen.set(CLAVE_CARRITO, JSON.stringify([{ id: "A", cant: 2 }, { id: "B", cant: 0 }, { cant: 3 }, null]));
      expect(obtenerCarrito()).toEqual([{ id: "A", cant: 2 }]);
      almacen.set(CLAVE_CARRITO, "no-json");
      expect(obtenerCarrito()).toEqual([]);
    });
  });

  describe("usuarios y sesión", () => {
    it("instala las cuentas de demostración la primera vez", () => {
      const correos = obtenerUsuarios().map((u) => u.correo);
      expect(correos).toContain("admin@duoc.cl");
      expect(correos).toContain("cliente@duoc.cl");
    });

    it("guardarSesion + obtenerSesion devuelve el usuario sin su contraseña", () => {
      guardarSesion(CUENTAS_DEMOSTRACION[0]);
      const sesion = obtenerSesion();
      expect(sesion.correo).toBe("admin@duoc.cl");
      expect(sesion.rol).toBe("Administrador");
      expect(sesion.contrasena).toBeUndefined();
    });

    it("borrarSesion elimina la sesión", () => {
      guardarSesion(CUENTAS_DEMOSTRACION[0]);
      borrarSesion();
      expect(obtenerSesion()).toBeNull();
    });
  });

  describe("mensajes de contacto", () => {
    it("guarda primero el mensaje más reciente", () => {
      guardarMensajeContacto({ id: "1", comentario: "uno" });
      guardarMensajeContacto({ id: "2", comentario: "dos" });
      expect(obtenerMensajesContacto().map((m) => m.id)).toEqual(["2", "1"]);
    });
  });

  describe("registrarOrden", () => {
    beforeEach(() => {
      guardarProductos([
        { id: "A1", nombre: "Polerón", precio: 10000, precioOferta: 8000, stock: 5, categoria: "Polerones", img: "" },
        { id: "B2", nombre: "Gorro", precio: 3000, precioOferta: null, stock: 1, categoria: "Accesorios", img: "" }
      ]);
    });

    it("una compra aprobada queda como Pagada, calcula el total con ofertas y descuenta el stock", () => {
      const orden = registrarOrden(entrega, [{ id: "A1", cant: 2 }, { id: "B2", cant: 1 }]);
      expect(orden.estado).toBe("Pagada");
      expect(orden.total).toBe(2 * 8000 + 3000);
      expect(orden.items.length).toBe(2);
      expect(obtenerProductos().find((p) => p.id === "A1").stock).toBe(3);
      expect(obtenerProductos().find((p) => p.id === "B2").stock).toBe(0);
      expect(obtenerOrdenes().length).toBe(1);
    });

    it("un pago rechazado guarda la orden como \"Pago rechazado\" y no descuenta el stock", () => {
      const orden = registrarOrden(entrega, [{ id: "A1", cant: 2 }], false);
      expect(orden.estado).toBe("Pago rechazado");
      expect(obtenerProductos().find((p) => p.id === "A1").stock).toBe(5);
      expect(obtenerOrdenes()[0].id).toBe(orden.id);
    });

    it("une la dirección con el departamento cuando existe", () => {
      const orden = registrarOrden({ ...entrega, departamento: "603" }, [{ id: "A1", cant: 1 }]);
      expect(orden.cliente.direccion).toBe("Av. Siempre Viva 123, 603");
    });

    it("rechaza un carrito vacío", () => {
      expect(() => registrarOrden(entrega, [])).toThrowError("El carrito está vacío.");
    });

    it("rechaza cantidades inválidas o mayores al stock", () => {
      expect(() => registrarOrden(entrega, [{ id: "A1", cant: 0 }])).toThrowError("Revisa las cantidades del carrito.");
      expect(() => registrarOrden(entrega, [{ id: "B2", cant: 2 }])).toThrowError("Revisa la disponibilidad de Gorro.");
      expect(obtenerOrdenes()).toEqual([]);
    });

    it("si falla el guardado de la orden, devuelve el inventario a su estado anterior", () => {
      // Mock de un error de almacenamiento lleno (cuota) solo al escribir las órdenes.
      Storage.prototype.setItem.and.callFake((clave, valor) => {
        if (clave === CLAVE_ORDENES) throw new Error("QuotaExceededError");
        almacen.set(clave, String(valor));
      });
      const antes = almacen.get(CLAVE_PRODUCTOS);
      expect(() => registrarOrden(entrega, [{ id: "A1", cant: 2 }])).toThrowError("QuotaExceededError");
      expect(almacen.get(CLAVE_PRODUCTOS)).toBe(antes);
    });
  });
});
