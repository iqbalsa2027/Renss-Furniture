import { X } from "lucide-react";
import { ProductImageSlider } from "./ProductImageSlider";
import { formatCurrency } from "../lib/format";
import type { Product } from "../types/cms";

export function ProductQuickViewModal({
  product,
  onClose,
  variant = "full",
}: {
  product: Product | null;
  onClose: () => void;
  variant?: "full" | "image";
}) {
  if (!product) {
    return null;
  }

  const imageUrls = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className={variant === "image"
          ? "relative w-full max-w-6xl overflow-hidden rounded-[2rem] bg-transparent shadow-2xl"
          : "relative w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-[80] rounded-full bg-black/55 p-2 text-white transition-colors hover:bg-black/75"
          aria-label="Tutup preview"
        >
          <X className="h-5 w-5" />
        </button>

        {variant === "image" ? (
          <div className="p-4 md:p-5">
            <div className="overflow-hidden rounded-[1.5rem]">
              <ProductImageSlider
                imageUrls={imageUrls}
                alt={product.name}
                className="h-[78vh] max-h-[82vh]"
                fit="contain"
              />
            </div>
          </div>
        ) : (
          <div className="grid max-h-[90vh] overflow-y-auto lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="bg-stone-100 p-4 md:p-6">
              <div className="h-full overflow-hidden rounded-[1.5rem] bg-white/70">
                <ProductImageSlider
                  imageUrls={imageUrls}
                  alt={product.name}
                  className="h-full min-h-[420px] max-h-[88vh]"
                  fit="contain"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between bg-white p-6 md:p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {product.categoryName ?? "Furniture"}
                </p>
                <h3 className="mt-3 text-2xl md:text-3xl">{product.name}</h3>
                <p className="mt-4 text-2xl text-foreground/90">
                  {formatCurrency(product.price, product.currencyCode)}
                </p>
                {product.description ? (
                  <div className="mt-6 space-y-3 text-base leading-8 text-muted-foreground">
                    <p>{product.description}</p>
                  </div>
                ) : (
                  <p className="mt-6 text-base text-muted-foreground">
                    Belum ada deskripsi produk untuk item ini.
                  </p>
                )}
              </div>

              {/* <div className="mt-8 rounded-2xl bg-stone-50 p-4 text-sm leading-7 text-muted-foreground">
                Klik panah atau geser gambar untuk melihat foto produk lainnya.
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
