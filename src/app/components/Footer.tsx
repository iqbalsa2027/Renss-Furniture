import { Facebook, Instagram, Mail, MapPin, MessageCircle, Music2, Phone } from "lucide-react";
import { motion } from "motion/react";
import { defaultWhatsAppUrl } from "../lib/whatsapp";
import type { Category } from "../types/cms";

export function Footer({
  categories,
  loading,
}: {
  categories: Category[];
  loading: boolean;
}) {
  const contact = {
    brandName: "Renss Furniture",
    address: "Rengging RT 10/02, Pecangaan, Jepara",
    phone: "+62 895-3256-00402",
    email: "renssfurniture@gmail.com",
    instagram: "https://www.instagram.com/renssfurniture/",
    tiktok: "https://www.tiktok.com/@renssjatimebel",
  };

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-3xl mb-4 font-heading">{contact.brandName}</h3>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Crafting timeless furniture for modern living. Quality, sustainability, and design excellence in every piece.
            </p>
            <div className="flex gap-4">
              <a
                href={contact.instagram || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={contact.instagram || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={contact.tiktok || "#"}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
              >
                <Music2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg mb-4 font-medium">Shop</h4>
            <ul className="space-y-3">
              {loading ? <li className="text-primary-foreground/60">Memuat kategori...</li> : null}
              {!loading && categories.length === 0 ? (
                <li className="text-primary-foreground/60">Belum ada kategori aktif.</li>
              ) : null}
              {categories.map((category) => (
                <li key={category.id}>
                  <a href="#collection" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg mb-4 font-medium">Company</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="#collection" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Our Story</a></li>
              <li><a href="#reviews" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Testimonials</a></li>
              <li><a href="/admin" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Admin CMS</a></li>
              <li><a href="#contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg mb-4 font-medium">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">{contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {contact.phone}
                </a>
              </li>
              <li>
                <motion.a
                  href={defaultWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -2, scale: 1.03, boxShadow: "0 18px 30px rgba(37, 211, 102, 0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.7 }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#20ba57]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat via WhatsApp
                </motion.a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href={`mailto:${contact.email}`} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © 2026 {contact.brandName}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Terms of Service</a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
