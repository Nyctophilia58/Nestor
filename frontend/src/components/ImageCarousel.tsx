import { useState, useRef, type TouchEvent, type MouseEvent } from "react";

interface Props {
  images: string[];
}

const ImageCarousel = ({ images }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  const hasImages = images && images.length > 0;
  const hasMultiple = images && images.length > 1;

  const goTo = (index: number) => {
    if (!hasImages) return;
    const total = images.length;
    setActiveIndex(((index % total) + total) % total); // wraps around
  };

  const next = () => goTo(activeIndex + 1);
  const prev = () => goTo(activeIndex - 1);

  // Touch swipe (mobile)
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  // Mouse drag (desktop)
  const handleMouseDown = (e: MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  if (!hasImages) {
    return (
      <div className="h-80 glass rounded-2xl flex items-center justify-center text-6xl text-white/20 mb-3">
        🏠
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Main Image */}
      <div
        className="relative h-80 glass rounded-2xl overflow-hidden mb-3 select-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => (isDragging.current = false)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Sliding track */}
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Property image ${i + 1}`}
              draggable={false}
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>

        {/* Prev/Next Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 glass-light rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 glass-light rounded-full flex items-center justify-center text-white hover:bg-white/20 transition"
            >
              ›
            </button>
          </>
        )}

        {/* Counter Badge */}
        {hasMultiple && (
          <div className="absolute top-3 right-3 px-2.5 py-1 glass-light rounded-full text-white text-xs font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Dots */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === i
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition ${
                activeIndex === i
                  ? "border-blue-400"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
