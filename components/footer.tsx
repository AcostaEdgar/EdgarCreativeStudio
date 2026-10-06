import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer className="studio-contact" id="contact">
      <div className="contact-top">
        <span>COMMISSIONS / PRINT INQUIRIES / SPEAKING</span>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
      <div className="contact-address">
        <a href="mailto:contact@edgaracosta.com">
          contact@
          <br />
          edgaracosta.com
          <ArrowUpRight />
        </a>
        <a className="contact-phone" href="tel:+14709312900">
          +1 470 931 2900
        </a>
      </div>
      <div className="contact-bottom">
        <span>© {new Date().getFullYear()} EDGAR ACOSTA</span>
        <Link href="/admin">
          STUDIO LOGIN <ArrowUpRight size={14} />
        </Link>
        <span>PHOTOGRAPHY & ART</span>
      </div>
    </footer>
  );
}
