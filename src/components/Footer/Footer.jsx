import { Link } from "react-router-dom";
import "../../Styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <Link to="/about" className="footer-link">About Us</Link>
          <Link to="/contact" className="footer-link">Contact Us</Link>
          <Link to="/license" className="footer-link">MIT License</Link>
        </div>
        <p className="footer-text">© {new Date().getFullYear()} Crypto Dashboard. All rights reserved.</p>
        <p className="footer-author">Live Cryptocurrency Data from CoinCap API | Built by <span className="footer-name">AMIR</span></p>
      </div>
    </footer>
  );
}
