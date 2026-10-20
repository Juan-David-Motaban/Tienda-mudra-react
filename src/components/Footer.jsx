import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="row m-0 g-3">
      <div className="footer-left col-12 col-md-6">
        <strong>Tienda Mudra</strong>
        <div className="footer-links">
          <Link to="/productos">Polerones</Link> |{" "}
          <Link to="/productos">Pantalones</Link> |{" "}
          <Link to="/productos">Accesorios</Link>
        </div>
      </div>
      <div className="footer-right col-12 col-md-6 text-md-end">
        <label className="form-label" htmlFor="newsletter">¡Únete a nuestro Newsletter!</label>
        <div className="newsletter-box justify-content-md-end">
          <input id="newsletter" className="form-control" type="email" placeholder="Ingresa tu correo" />
          <button type="button">Suscribirse</button>
        </div>
      </div>
    </footer>
  );
}
