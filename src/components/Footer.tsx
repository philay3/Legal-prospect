import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        Legal Prospector
      </div>
      <div className="footer-links">
        <Link href="/about" className="footer-link">
          About
        </Link>
        <Link href="/contact" className="footer-link">
          Contact
        </Link>
      </div>
      <div className="footer-copyright">
        &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
