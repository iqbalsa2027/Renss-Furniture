import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { buildWhatsAppUrl } from "../lib/whatsapp";
import { Button } from "../components/ui/button";

const whatsappUrl = buildWhatsAppUrl(
  "Halo Renss Furniture, saya tertarik dengan katalog furniturenya. Saya ingin konsultasi dan pesan produk.",
);

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section
      id="home"
      ref={containerRef}
      style={{ position: "relative" }}
      className="min-h-screen flex items-center justify-center overflow-hidden"
    >
      <motion.div style={{ y, scale, position: "absolute" }} className="inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1638885930125-85350348d266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2OTAxMzk0Nnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Luxury Living Room"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center"
      >
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl text-white mb-6 tracking-tight"
        >
          Modern Furniture
          <br />
          for Timeless Living
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light"
        >
          Discover handcrafted pieces that blend contemporary design with sustainable
          materials to transform your space into a sanctuary.
        </motion.p>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg rounded-lg">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Shop Now
            </a>
          </Button>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg rounded-lg">
            <a href="#collection">
              Explore Collection
            </a>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
}
