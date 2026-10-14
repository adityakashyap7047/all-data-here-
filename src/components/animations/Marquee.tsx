'use client';

import { useEffect, useRef, useState } from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
  repeat?: number;
}

export function Marquee({
  children,
  speed = 50,
  direction = 'left',
  pauseOnHover = true,
  className = '',
  repeat = 1,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    const updateWidth = () => {
      if (contentRef.current) {
        const originalItems = Array.from(contentRef.current.children).filter(
          (el) => !el.hasAttribute('data-marquee-clone')
        );
        let width = 0;
        originalItems.forEach((item) => {
          width += (item as HTMLElement).offsetWidth + 32;
        });
        setContentWidth(width > 0 ? width : contentRef.current.scrollWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current || !contentWidth || contentWidth <= 0) return;

    const container = containerRef.current;
    const content = contentRef.current;
    const rawClones = Math.ceil(container.offsetWidth / contentWidth);
    const cloneCount = Math.max(1, Math.min(isNaN(rawClones) ? 2 : rawClones, 5));

    // Remove any previously appended clones
    const existingClones = content.querySelectorAll('[data-marquee-clone="true"]');
    existingClones.forEach((el) => el.remove());

    const originalChildren = Array.from(content.children).filter(
      (el) => !el.hasAttribute('data-marquee-clone')
    );

    for (let i = 0; i < cloneCount; i++) {
      originalChildren.forEach((child) => {
        const clone = child.cloneNode(true) as HTMLElement;
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('data-marquee-clone', 'true');
        content.appendChild(clone);
      });
    }

    let position = direction === 'left' ? 0 : -contentWidth * cloneCount;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (animationPaused) {
        lastTime = currentTime;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = currentTime - lastTime;
      const distance = (speed / 1000) * deltaTime;

      if (direction === 'left') {
        position -= distance;
        if (position <= -contentWidth) {
          position += contentWidth;
        }
      } else {
        position += distance;
        if (position >= 0) {
          position -= contentWidth;
        }
      }

      content.style.transform = `translateX(${position}px)`;
      lastTime = currentTime;
      animationRef.current = requestAnimationFrame(animate);
    };

    content.style.display = 'flex';
    content.style.width = 'max-content';

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      const clones = content.querySelectorAll('[data-marquee-clone="true"]');
      clones.forEach((el) => el.remove());
    };
  }, [speed, direction, pauseOnHover, repeat, contentWidth, animationPaused]);

  const handleMouseEnter = () => pauseOnHover && setAnimationPaused(true);
  const handleMouseLeave = () => pauseOnHover && setAnimationPaused(false);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative' }}
    >
      <div
        ref={contentRef}
        className="flex items-center gap-8"
        style={{ willChange: 'transform' }}
      >
        {children}
      </div>
    </div>
  );
}

interface MarqueeItemProps {
  children: React.ReactNode;
  className?: string;
}

export function MarqueeItem({ children, className = '' }: MarqueeItemProps) {
  return (
    <div className={`flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}