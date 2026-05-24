import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import Logo from "./asset/Logo2.png";
import { defaultWhatsAppUrl } from "../lib/whatsapp";
import { Button } from "./ui/button";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Catalog", href: "#collection" },
    { name: "Best Sellers", href: "#bestsellers" },
    { name: "Reviews", href: "#reviews" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5"
          : "bg-white/60 backdrop-blur-sm border-b border-white/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          <a href="#home" className="flex items-center h-18 md:h-20">
            <div className="flex h-12 w-[180px] items-center md:h-14 md:w-[220px]">
              <img
                src={Logo}
                alt="Renss Furniture"
                className={`h-full w-auto max-w-full origin-left object-contain transition-transform duration-300 ${
                  isScrolled ? "scale-55" : "scale-55"
                }`}
              />
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {/* <a href="/admin">
              <Button
                variant="outline"
                size="lg"
                className="px-6 py-5 rounded-lg border-white/30 bg-white/40 hover:bg-white/70"
              >
                Admin CMS
              </Button>
            </a> */}
            <Button
              asChild
              className="h-12 rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <a href={defaultWhatsAppUrl} target="_blank" rel="noreferrer">
                Shop Now
              </a>
            </Button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-black/5 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-white/95 backdrop-blur-md border-t border-black/5"
        >
          <nav className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-base font-medium text-foreground/70 hover:text-foreground py-2 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <Button
              asChild
              size="lg"
              className="w-full mt-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <a href={defaultWhatsAppUrl} target="_blank" rel="noreferrer">
                Shop Now
              </a>
            </Button>
            <a href="/admin" className="block">
              <Button size="lg" variant="outline" className="w-full rounded-lg">
                Admin CMS
              </Button>
            </a>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
