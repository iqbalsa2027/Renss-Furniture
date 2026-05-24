import { useRef } from "react";
import { Star } from "lucide-react";
import { motion, useInView } from "motion/react";
import { Card } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import type { Testimonial } from "../types/cms";
import { SectionState } from "./SectionState";

export function Testimonials({
  testimonials,
  loading,
  error,
}: {
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section id="reviews" ref={ref} className="py-24 px-6 lg:px-8 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ y: 40, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Jangan hanya percaya kata kami. Dengarkan pengalaman pelanggan yang sudah mengubah ruang mereka bersama Renss Furniture.
          </motion.p>
        </div>

        {loading ? <SectionState text="Memuat testimoni pelanggan..." /> : null}
        {error && !loading ? <SectionState text={`Gagal memuat testimoni: ${error}`} /> : null}
        {!loading && !error && testimonials.length === 0 ? (
          <SectionState text="Belum ada testimoni yang dipublikasikan." />
        ) : null}

        {!loading && !error && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ y: 60, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.15,
                  ease: "easeOut",
                }}
              >
                <Card className="p-8 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <ImageWithFallback
                        src={testimonial.imageUrl ?? ""}
                        alt={testimonial.customerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{testimonial.customerName}</h4>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>

                  <p className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
