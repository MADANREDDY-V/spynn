'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ServiceImageItem } from '@/data/serviceImages';

interface ServiceImageCarouselProps {
  images: ServiceImageItem[];
  title?: string;
  aspectRatioClass?: string;
  className?: string;
  priority?: boolean;
  intervalMs?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  showTag?: boolean;
  overlayGradient?: boolean;
  children?: React.ReactNode;
}

export function ServiceImageCarousel({
  images,
  title,
  aspectRatioClass = 'w-full h-full',
  className = '',
  priority = false,
  intervalMs = 2000,
  showIndicators = true,
  showArrows = true,
  showTag = true,
  overlayGradient = false,
  children,
}: ServiceImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const count = images?.length || 0;

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Auto-advance timer every 2 seconds (paused on hover or if reducedMotion)
  useEffect(() => {
    if (count <= 1 || isPaused || reducedMotion) return;
    const timer = setInterval(() => {
      nextSlide();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, isPaused, reducedMotion, intervalMs, nextSlide]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchStartX.current - touchEndX.current;
    const threshold = 35; // minimum pixels moved to count as swipe
    if (deltaX > threshold) {
      nextSlide();
    } else if (deltaX < -threshold) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!images || count === 0) return null;

  return (
    <div
      className={`relative overflow-hidden group select-none ${aspectRatioClass} ${className}`}
      style={{ isolation: 'isolate' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title || 'SPYNN'} image showcase`}
    >
      {/* Horizontal Carousel Track */}
      <div
        className="flex w-full h-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: reducedMotion ? 'none' : 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {images.map((item, idx) => (
          <div
            key={idx}
            className="relative w-full h-full min-w-full shrink-0 grow-0 basis-full overflow-hidden"
            aria-hidden={currentIndex !== idx}
          >
            <Image
              src={item.src}
              alt={item.alt || `${title || 'Service'} - Slide ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority && idx === 0}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>

      {/* Dark gradient overlay for contrast if requested */}
      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
      )}

      {/* Active Category Tag (Top Right) */}
      {showTag && images[currentIndex]?.label && (
        <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs transition-opacity duration-300">
            {images[currentIndex].label}
          </span>
        </div>
      )}

      {/* Custom Children Overlay (e.g. Service Icon & Title) */}
      {children && (
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      )}

      {/* Subtle Navigation Arrows (Desktop hover) */}
      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/85 hover:bg-white text-[#071B49] shadow-md backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-90 focus:opacity-100 transition-all duration-200 hover:scale-105"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/85 hover:bg-white text-[#071B49] shadow-md backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-90 focus:opacity-100 transition-all duration-200 hover:scale-105"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Slide Indicators (Bottom Dots) */}
      {showIndicators && count > 1 && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {images.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(dotIdx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === dotIdx
                  ? 'w-4 bg-white shadow-xs'
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
