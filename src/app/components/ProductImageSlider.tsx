import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { resolveAssetUrl } from "../lib/assets";

export function ProductImageSlider({
  imageUrls,
  alt,
  className,
  onImageClick,
  fit = "cover",
}: {
  imageUrls?: string[] | null;
  alt: string;
  className?: string;
  onImageClick?: () => void;
  fit?: "cover" | "contain";
}) {
  const images = useMemo(
    () => (imageUrls ?? []).filter((imageUrl) => Boolean(imageUrl)).map((imageUrl) => resolveAssetUrl(imageUrl)),
    [imageUrls],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  if (images.length === 0) {
    return <div className={className} />;
  }

  useEffect(() => {
    setCurrentIndex(0);
  }, [images.length, imageUrls]);

  const currentImage = images[Math.min(currentIndex, images.length - 1)] ?? images[0];

  function showPrevious() {
    setCurrentIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  }

  function showNext() {
    setCurrentIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;

    touchStartXRef.current = null;

    if (startX === null || endX === null) {
      return;
    }

    const distance = endX - startX;

    if (Math.abs(distance) < 40) {
      return;
    }

    if (distance > 0) {
      showPrevious();
      return;
    }

    showNext();
  }

  return (
    <div
      className={`relative z-10 ${fit === "contain" ? "flex items-center justify-center" : ""} ${className ?? ""}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ImageWithFallback
        src={currentImage}
        alt={alt}
        className={
          fit === "contain"
            ? onImageClick
              ? "max-h-full max-w-full cursor-zoom-in object-contain"
              : "max-h-full max-w-full object-contain"
            : onImageClick
              ? "h-full w-full cursor-zoom-in object-cover"
              : "h-full w-full object-cover"
        }
        onClick={onImageClick}
      />

      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            className={`${fit === "contain" ? "left-5" : "left-3"} absolute top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition-colors hover:bg-black/65`}
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            className={`${fit === "contain" ? "right-5" : "right-3"} absolute top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white transition-colors hover:bg-black/65`}
            aria-label="Gambar berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm">
            {images.map((imageUrl, index) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={index === currentIndex ? "h-2 w-2 rounded-full bg-white" : "h-2 w-2 rounded-full bg-white/45"}
                aria-label={`Lihat gambar ${index + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
