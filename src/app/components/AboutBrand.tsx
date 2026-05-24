import { Award } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export function AboutBrand() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-24 px-6 lg:px-8 bg-card">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-8"
        >
          <Award className="w-8 h-8 text-accent-foreground" />
        </motion.div>
        
        <motion.h2 
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl lg:text-6xl mb-6 text-foreground"
        >
          Crafted with Passion,<br />Built to Last
        </motion.h2>
        
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6"
        >
          Every piece in our collection is a testament to exceptional craftsmanship and attention to detail. We source only premium, sustainable wood and materials to create furniture that tells a story—your story.
        </motion.p>
        
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          Our commitment to sustainability means each creation not only beautifies your home but also honors the environment. From our workshop to your living room, we ensure quality, durability, and timeless design.
        </motion.p>
      </div>
    </section>
  );
}