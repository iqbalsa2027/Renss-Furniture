import { Award, Palette, Leaf, Truck } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description: "Every piece is crafted with the finest materials and meticulous attention to detail."
  },
  {
    icon: Palette,
    title: "Custom Design",
    description: "Personalize your furniture to perfectly match your unique style and space."
  },
  {
    icon: Leaf,
    title: "Sustainable Materials",
    description: "Eco-friendly wood and materials sourced from responsible suppliers."
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "White-glove delivery service ensuring your furniture arrives safely and on time."
  }
];

export function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-24 px-6 lg:px-8 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            Why Choose Us
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            We're committed to delivering excellence in every aspect of your furniture journey.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2 + index * 0.1,
                ease: "easeOut"
              }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/20 mb-6 group-hover:bg-accent/30 transition-colors duration-300">
                <feature.icon className="w-10 h-10 text-accent-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl mb-3 font-medium">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}