import {
  erroresCategoria, erroresCheckout, erroresProducto, erroresRegistro,
  validarContrasena, validarCorreo, validarFechaNacimiento, validarRUN, validarTextoObligatorio
} from "./validaciones.js";

describe("validaciones", () => {
  describe("validarRUN", () => {
    it("acepta RUN con dígito verificador correcto", () => {
      expect(validarRUN("123456785")).toBeTrue();
      expect(validarRUN("111111111")).toBeTrue();
    });

    it("acepta la K del dígito verificador en mayúscula o minúscula", () => {
      expect(validarRUN("10000013K")).toBeTrue();
      expect(validarRUN("10000013k")).toBeTrue();
    });

    it("rechaza un dígito verificador incorrecto", () => {
      expect(validarRUN("123456784")).toBeFalse();
    });

    it("rechaza formatos inválidos (puntos, guion, letras, muy corto)", () => {
      expect(validarRUN("12.345.678-5")).toBeFalse();
      expect(validarRUN("12345678-5")).toBeFalse();
      expect(validarRUN("abcdefgh1")).toBeFalse();
      expect(validarRUN("12345")).toBeFalse();
      expect(validarRUN("")).toBeFalse();
    });
  });

  describe("validarCorreo", () => {
    it("acepta los dominios permitidos", () => {
      expect(validarCorreo("ana@duoc.cl")).toBeTrue();
      expect(validarCorreo("profe@profesor.duoc.cl")).toBeTrue();
      expect(validarCorreo("ana.perez+tienda@gmail.com")).toBeTrue();
    });

    it("rechaza otros dominios y textos sin formato de correo", () => {
      expect(validarCorreo("ana@hotmail.com")).toBeFalse();
      expect(validarCorreo("ana@duoc")).toBeFalse();
      expect(validarCorreo("ana.duoc.cl")).toBeFalse();
      expect(validarCorreo("")).toBeFalse();
    });

    it("rechaza correos de más de 100 caracteres", () => {
      expect(validarCorreo(`${"a".repeat(95)}@duoc.cl`)).toBeFalse();
    });
  });

  describe("validarContrasena", () => {
    it("exige entre 4 y 10 caracteres", () => {
      expect(validarContrasena("abc")).toBeFalse();
      expect(validarContrasena("abcd")).toBeTrue();
      expect(validarContrasena("abcdefghij")).toBeTrue();
      expect(validarContrasena("abcdefghijk")).toBeFalse();
    });
  });

  describe("validarFechaNacimiento", () => {
    it("el campo vacío es válido (es opcional)", () => {
      expect(validarFechaNacimiento("")).toBeTrue();
    });

    it("acepta una fecha pasada y rechaza una futura", () => {
      expect(validarFechaNacimiento("1990-05-20")).toBeTrue();
      const manana = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      expect(validarFechaNacimiento(manana)).toBeFalse();
    });
  });

  describe("validarTextoObligatorio", () => {
    it("rechaza textos vacíos o solo con espacios", () => {
      expect(validarTextoObligatorio("   ", 10)).toBeFalse();
    });

    it("respeta el máximo de caracteres", () => {
      expect(validarTextoObligatorio("hola", 10)).toBeTrue();
      expect(validarTextoObligatorio("x".repeat(11), 10)).toBeFalse();
    });
  });

  describe("erroresRegistro", () => {
    const valido = {
      run: "123456785", nombre: "Ana", apellidos: "Pérez", correo: "ana@duoc.cl", contrasena: "abcd",
      fechaNacimiento: "", region: "Región Metropolitana", comuna: "Santiago", direccion: "Calle 1"
    };

    it("no devuelve errores con datos válidos", () => {
      expect(erroresRegistro(valido)).toEqual({});
    });

    it("devuelve solo los campos inválidos", () => {
      const e = erroresRegistro({ ...valido, correo: "ana@hotmail.com", contrasena: "1" });
      expect(Object.keys(e).sort()).toEqual(["contrasena", "correo"]);
    });

    it("marca todos los obligatorios cuando el formulario está vacío", () => {
      const vacio = { run: "", nombre: "", apellidos: "", correo: "", contrasena: "", fechaNacimiento: "", region: "", comuna: "", direccion: "" };
      expect(Object.keys(erroresRegistro(vacio)).sort())
        .toEqual(["apellidos", "comuna", "contrasena", "correo", "direccion", "nombre", "region", "run"]);
    });
  });

  describe("erroresProducto", () => {
    const categorias = ["Polerones", "Pantalones"];
    const existentes = [{ id: "URB001" }];
    const valido = {
      id: "URB099", nombre: "Polerón", descripcion: "", categoria: "Polerones", precio: "10000",
      precioOferta: "", stock: "5", stockCritico: "", material: "", img: ""
    };

    it("acepta un producto válido", () => {
      expect(erroresProducto(valido, existentes, categorias)).toEqual({});
    });

    it("rechaza un código repetido, pero permite conservar el propio al editar", () => {
      expect(erroresProducto({ ...valido, id: "urb001" }, existentes, categorias).id).toBe("Este código ya está registrado.");
      expect(erroresProducto({ ...valido, id: "URB001" }, existentes, categorias, "URB001").id).toBeUndefined();
    });

    it("exige una categoría existente", () => {
      expect(erroresProducto({ ...valido, categoria: "Otra" }, existentes, categorias).categoria).toBeDefined();
    });

    it("el precio de oferta debe ser menor que el precio normal", () => {
      expect(erroresProducto({ ...valido, precioOferta: "10000" }, existentes, categorias).precioOferta)
        .toBe("La oferta debe ser menor que el precio normal.");
      expect(erroresProducto({ ...valido, precioOferta: "8000" }, existentes, categorias).precioOferta).toBeUndefined();
    });

    it("el stock debe ser un entero mayor o igual que 0", () => {
      expect(erroresProducto({ ...valido, stock: "-1" }, existentes, categorias).stock).toBeDefined();
      expect(erroresProducto({ ...valido, stock: "2.5" }, existentes, categorias).stock).toBeDefined();
    });

    it("rechaza imágenes con protocolos peligrosos", () => {
      expect(erroresProducto({ ...valido, img: "javascript:alert(1)" }, existentes, categorias).img).toBeDefined();
      expect(erroresProducto({ ...valido, img: "https://sitio.cl/foto.png" }, existentes, categorias).img).toBeUndefined();
    });
  });

  describe("erroresCategoria", () => {
    const categorias = [{ id: "polerones", nombre: "Polerones" }];

    it("rechaza nombres vacíos y repetidos (sin distinguir mayúsculas)", () => {
      expect(erroresCategoria({ nombre: " " }, categorias).nombre).toBeDefined();
      expect(erroresCategoria({ nombre: "POLERONES" }, categorias).nombre).toBe("Ya existe una categoría con este nombre.");
    });

    it("permite conservar el nombre al editar la misma categoría", () => {
      expect(erroresCategoria({ nombre: "Polerones" }, categorias, "polerones")).toEqual({});
    });
  });

  describe("erroresCheckout", () => {
    const valido = {
      nombre: "Ana", apellidos: "Pérez", correo: "ana@gmail.com", calle: "Av. 1", departamento: "",
      region: "Región Metropolitana", comuna: "Santiago", indicaciones: ""
    };

    it("acepta datos de entrega completos", () => {
      expect(erroresCheckout(valido)).toEqual({});
    });

    it("exige calle, región y comuna", () => {
      const e = erroresCheckout({ ...valido, calle: "", region: "", comuna: "" });
      expect(Object.keys(e).sort()).toEqual(["calle", "comuna", "region"]);
    });
  });
});
