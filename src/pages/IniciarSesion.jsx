import { useState } from "react";
import Campo from "../components/Campo";
import { useTienda } from "../context/TiendaContext";
import { erroresLogin } from "../lib/validaciones";
import { useFormulario } from "../lib/useFormulario";
import { useTituloPagina } from "../lib/hooks";

export default function IniciarSesion() {
  useTituloPagina("Iniciar sesión | Tienda Mudra");
  const { iniciarSesion } = useTienda();

    e.preventDefault();
    }
  };

  return (
          </section>
          <div className="col-12 col-lg-7">
            <form className="cuenta-formulario" onSubmit={enviar} noValidate>
              <Campo id="correo" etiqueta="Correo electrónico" error={f.errores.correo}>
              </Campo>
              <Campo id="contrasena" etiqueta="Contraseña" error={f.errores.contrasena}>
              </Campo>
            </form>
          </div>
        </div>
      </main>
  );
}