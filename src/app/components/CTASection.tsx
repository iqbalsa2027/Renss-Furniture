import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export function CTASection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  return (
    <section ref={containerRef} style={{ position: 'relative' }} className="py-32 px-6 lg:px-8 overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y, position: 'absolute' }}
        className="inset-0 z-0"
      >
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwxfHx8fDE3Njg5ODYxNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Modern Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </motion.div>

      {/* Content with Fade */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 max-w-4xl mx-auto text-center text-white"
      >
        <motion.h2 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl lg:text-7xl mb-6"
        >
          Transform Your Home Today
        </motion.h2>
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-10 text-white/90 font-light"
        >
          Discover timeless pieces that bring warmth, elegance, and comfort to every corner of your space.
        </motion.p>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 px-10 py-7 text-lg rounded-lg group"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}