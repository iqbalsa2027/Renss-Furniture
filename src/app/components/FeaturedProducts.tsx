import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { formatCurrency } from "../lib/format";
import type { Product } from "../types/cms";
import { ProductImageSlider } from "./ProductImageSlider";
import { ProductQuickViewModal } from "./ProductQuickViewModal";
import { SectionState } from "./SectionState";

export function FeaturedProducts({
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
    <section id="collection" ref={ref} className="py-24 px-6 lg:px-8 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="text-accent-foreground uppercase tracking-wider mb-3 text-sm"
          >
            Our Collection
          </motion.p>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            Featured Products
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Handpicked pieces that exemplify our commitment to quality and design excellence.
          </motion.p>
        </div>

        {loading ? <SectionState text="Memuat produk unggulan dari katalog..." /> : null}
        {error && !loading ? <SectionState text={`Gagal memuat produk: ${error}`} /> : null}
        {!loading && !error && products.length === 0 ? (
          <SectionState text="Belum ada produk unggulan yang dipublikasikan." />
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 60, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + index * 0.1,
                  ease: "easeOut",
                }}
              >
                <Card className="group flex h-[640px] flex-col overflow-hidden rounded-[1.75rem] border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="relative h-[360px] shrink-0 overflow-hidden bg-stone-100">
                    <ProductImageSlider
                      imageUrls={product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : []}
                      alt={product.name}
                      className="h-full"
                      fit="cover"
                      onImageClick={() => setSelectedProduct(product)}
                    />

                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-white/95 px-3 py-1 rounded-full text-xs font-medium text-foreground shadow-sm">
                        {product.categoryName ?? "Furniture"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col bg-white px-6 pb-3 pt-4">
                    <h3 className="min-h-[50px] line-clamp-2 text-[1.2rem] leading-snug text-foreground">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-[1.3rem] leading-none text-foreground">
                      {formatCurrency(product.price, product.currencyCode)}
                    </p>
                    <p className="mt-3 min-h-[60px] line-clamp-2 text-sm leading-7 text-muted-foreground">
                      {product.description ?? "Produk pilihan dengan kualitas premium."}
                    </p>

                    <Button
                      variant="outline"
                      className="mt-3 h-11 w-full rounded-lg border-2 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setSelectedProduct(product)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : null}

        <ProductQuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </section>
  );
}
