'use client';

import { useRef, useState, useEffect } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  zoomScale?: number;
  transitionDuration?: number;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export function ImageZoom({
  src,
  alt,
  className = '',
  zoomScale = 1.15,
  transitionDuration = 700,
  containerClassName = '',
  loading = 'lazy',
  priority = false,
  fill = false,
  sizes,
}: ImageZoomProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const img = containerRef.current.querySelector('img') as HTMLImageElement;
    if (img) {
      img.style.transformOrigin = `${50 + x * 15}% ${50 + y * 15}%`;
    }
  };

  const handleMouseLeave = () => {
    const img = containerRef.current?.querySelector('img') as HTMLImageElement;
    if (img) {
      img.style.transformOrigin = 'center center';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseLeave();
      }}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`
          transition-all duration-${transitionDuration} ease-out
          will-change-transform
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${isHovered ? `scale-${Math.round(zoomScale * 100)}` : 'scale-100'}
          ${className}
        `}
        onLoad={() => setIsLoaded(true)}
        style={{
          transformOrigin: 'center center',
          width: fill ? '100%' : 'auto',
          height: fill ? '100%' : 'auto',
          objectFit: fill ? 'cover' : 'none',
        }}
        sizes={sizes}
      />
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  containerClassName?: string;
}

export function ImageReveal({
  src,
  alt,
  className = '',
  delay = 0,
  direction = 'bottom',
  containerClassName = '',
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const getClipPath = () => {
    if (!isVisible) {
      switch (direction) {
        case 'left':
          return 'inset(0 100% 0 0)';
        case 'right':
          return 'inset(0 0 0 100%)';
        case 'top':
          return 'inset(100% 0 0 0)';
        case 'bottom':
        default:
          return 'inset(0 0 100% 0)';
      }
    }
    return 'inset(0 0 0 0)';
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ position: 'relative' }}
    >
      <div
        className={`
          transition-all duration-1000 ease-out
          will-change-clip-path
          ${className}
        `}
        style={{
          clipPath: getClipPath(),
          position: 'relative',
          zIndex: 1,
        }}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}