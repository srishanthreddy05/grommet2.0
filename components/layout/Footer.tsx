import Link from "next/link";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-3">Grommet</h2>
            <p className="text-brand-gray-400 text-sm leading-relaxed">
              Premium handcrafted gifts. Customised for every moment.
            </p>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-brand-gray-400 hover:text-white transition-colors"
            >
              <Instagram size={16} /> @grommet
            </a>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm text-brand-gray-400">
              {[
                ["Car Frames", "/collections/car-frames"],
                ["F1 Frames", "/collections/f1-frames"],
                ["Phone Cases", "/collections/phone-cases"],
                ["Polaroids", "/collections/polaroids"],
                ["Fridge Magnets", "/collections/fridge-magnets"],
                ["Tumblers", "/collections/tumblers"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-4">Info</h3>
            <ul className="space-y-2.5 text-sm text-brand-gray-400">
              {[
                ["Privacy Policy", "/privacy"],
                ["Refund Policy", "/refund"],
                ["Terms of Service", "/terms"],
                ["Shipping Info", "/shipping"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-brand-gray-400 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-brand-gray-400">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>Hyderabad, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0" />
                <a href="tel:+919999999999" className="hover:text-white transition-colors">+91 99999 99999</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0" />
                <a href="mailto:hello@grommet.in" className="hover:text-white transition-colors">hello@grommet.in</a>
              </li>
            </ul>
            <div className="mt-5">
              <p className="text-xs text-brand-gray-500 mb-1">Business Hours</p>
              <p className="text-xs text-brand-gray-400">Mon–Fri: 9am – 6pm</p>
              <p className="text-xs text-brand-gray-400">Sat: 10am – 4pm</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-brand-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-gray-500">
          <p>© {new Date().getFullYear()} Grommet. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>UPI</span>
            <span>•</span>
            <span>Cards</span>
            <span>•</span>
            <span>Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
