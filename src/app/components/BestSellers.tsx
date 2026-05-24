import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "../components/ui/button";
import { formatCurrency } from "../lib/format";
import type { Product } from "../types/cms";
import { ProductImageSlider } from "./ProductImageSlider";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { SectionState } from "./SectionState";

export function BestSellers({
  products,
  loading,
  error,
}: {
  products: Product[];
  loading: boolean;
  error: string | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <section id="bestsellers" ref={ref} className="py-24 px-6 lg:px-8 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-accent-foreground uppercase tracking-wider mb-3 text-sm"
          >
            Popular Choices
          </motion.p>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            Best Sellers
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our most loved pieces, chosen by discerning customers like you.
          </motion.p>
        </div>

        {loading ? <SectionState text="Memuat produk best seller..." /> : null}
        {error && !loading ? <SectionState text={`Gagal memuat best seller: ${error}`} /> : null}
        {!loading && !error && products.length === 0 ? (
          <SectionState text="Belum ada produk best seller yang dipublikasikan." />
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ y: 60, opacity: 0, scale: 0.95 }}
                animate={isInView ? { y: 0, opacity: 1, scale: 1 } : { y: 60, opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + index * 0.1,
                  ease: "easeOut",
                }}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <ProductImageSlider
                    imageUrls={item.imageUrls?.length ? item.imageUrls : item.imageUrl ? [item.imageUrl] : []}
                    alt={item.name}
                    className="h-full"
                    onImageClick={() => setSelectedProduct(item)}
                  />
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 p-6 text-white">
                    <h3 className="text-2xl mb-2">{item.name}</h3>
                    {item.categoryName ? (
                      <p className="mb-2 text-sm text-white/80">{item.categoryName}</p>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <p className="text-xl">{formatCurrency(item.price, item.currencyCode)}</p>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                        onClick={() => setSelectedProduct(item)}
                      >
                        Quick View
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}

        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          variant="image"
        />
      </div>
    </section>
  );
}
