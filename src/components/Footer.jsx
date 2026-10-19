import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="footer-left">
        <strong>Tienda Mudra</strong>
        <div className="footer-links">
          <Link to="/productos">Polerones</Link> |{" "}
          <Link to="/productos">Pantalones</Link> |{" "}
          <Link to="/productos">Accesorios</Link>
        </div>
      </div>
      <div className="footer-right">
        <label htmlFor="newsletter">¡Únete a nuestro Newsletter!</label>
        <div className="newsletter-box">
          <input id="newsletter" type="email" placeholder="Ingresa tu correo" />
          <button type="button">Suscribirse</button>
        </div>
      </div>
    </footer>
  );
}
