const whatsappNumber = "62895325600402";

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const defaultWhatsAppUrl = buildWhatsAppUrl(
  "Halo Renss Furniture, saya tertarik dengan katalog furniturenya. Saya ingin tanya produk dan harga.",
);
