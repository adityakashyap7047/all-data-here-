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
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    const cloneCount = Math.ceil(container.offsetWidth / contentWidth) + 2;

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
        if (position <= -contentWidth * repeat) {
          position += contentWidth * repeat;
        }
      } else {
        position += distance;
        if (position >= 0) {
          position -= contentWidth * repeat;
        }
      }

      content.style.transform = `translateX(${position}px)`;
      lastTime = currentTime;
      animationRef.current = requestAnimationFrame(animate);
    };

    content.style.display = 'flex';
    content.style.width = 'max-content';

    const originalChildren = Array.from(content.children);
    for (let i = 0; i < cloneCount; i++) {
      originalChildren.forEach((child) => {
        const clone = child.cloneNode(true) as HTMLElement;
        clone.setAttribute('aria-hidden', 'true');
        content.appendChild(clone);
      });
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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