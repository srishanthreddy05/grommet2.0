import Link from "next/link";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-3">Grommet</h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
              Premium handcrafted gifts. Customised for every moment.
            </p>
            <a
              href="https://www.instagram.com/grommet.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Instagram size={16} /> @grommet.in
            </a>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              {[
                ["Car Frames", "/collections/car-frames"],
                ["Hot Wheels", "/collections/hot-wheels"],
                ["Poster Frames", "/collections/poster-frames"],
                ["Watches", "/collections/watches"],
                ["Phone Cases", "/collections/phone-cases"],
                ["Tshirts", "/collections/tshirts"],
                ["Keychains", "/collections/keychains"],
                ["Bouquets", "/collections/bouquets"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">Info</h3>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              {[
                ["Privacy Policy", "/privacy-policy"],
                ["Refund Policy", "/refund-policy"],
                ["Terms", "/terms"],
                ["Shipping", "/shipping"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-zinc-500 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>Hyderabad, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0" />
                <a href="tel:+917075074352" className="hover:text-white transition-colors">+91 7075074352</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0" />
                <a href="mailto:grommetcarss@gmail.com" className="hover:text-white transition-colors">grommetcarss@gmail.com</a>
              </li>
            </ul>
            <a
              href="https://wa.me/917075074352"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center mt-5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
            >
              WhatsApp Checkout
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-500">
          <p>© 2026 Grommet. All rights reserved.</p>

          <div className="text-center text-xs text-gray-400 mt-6 space-y-1">
            <p>
              Built & Managed by{" "}
              <a
                href="https://instagram.com/thrivex.labs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                ThriveX Labs
              </a>
            </p>

            <p className="text-gray-300">
              Need a website like this?{" "}
              <a
                href="https://wa.me/918125902062?text=Hi%20I%20came%20through%20your%20project%20(Grommet)%20built%20by%20ThriveX%20Labs"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Contact us
              </a>
              {" "}→ +91 8125902062
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
