'use client';

import { useEffect, useRef, useState } from 'react';
import React from 'react';

interface ParallaxProps {
  children: React.ReactNode;
  strength?: number;
  reverse?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Parallax({
  children,
  strength = 30,
  reverse = false,
  className = '',
  style,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      const multiplier = reverse ? -1 : 1;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setOffset({
          x: deltaX * strength * multiplier,
          y: deltaY * strength * multiplier,
        });
      });
    };

    const handleMouseLeave = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setOffset({ x: 0, y: 0 });
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [strength, reverse]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      <div
        className="transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transformOrigin: 'center center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface ScrollParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollParallax({
  children,
  speed = 0.3,
  className = '',
  style,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      if (elementTop < viewportHeight && elementTop + elementHeight > 0) {
        const progress = (viewportHeight - elementTop) / (viewportHeight + elementHeight);
        setOffset((progress - 0.5) * 2 * speed * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={style}>
      <div
        className="will-change-transform"
        style={{
          transform: `translateY(${offset}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

interface MagneticProps {
  children: React.ReactElement;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.3, className = '' }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setOffset({ x: deltaX, y: deltaY });
      });
    };

    const handleMouseLeave = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setOffset({ x: 0, y: 0 });
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      <div
        className="transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {React.cloneElement(children, {
          style: {
            ...children.props.style,
            transform: `translate(${-offset.x * 0.5}px, ${-offset.y * 0.5}px)`,
          },
        })}
      </div>
    </div>
  );
}