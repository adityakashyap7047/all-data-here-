'use client';

import { useEffect, useRef, useState } from 'react';
import React from 'react';

interface StaggeredGridProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  staggerDelay?: number;
  threshold?: number;
  rootMargin?: string;
  animationType?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'flip';
  duration?: number;
}

export function StaggeredGrid({
  children,
  className = '',
  containerClassName = '',
  staggerDelay = 100,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  animationType = 'slide-up',
  duration = 600,
}: StaggeredGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const childNodes = Array.from(containerRef.current?.children || []);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          childNodes.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => [...prev, index]);
            }, index * staggerDelay);
          });
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [staggerDelay, threshold, rootMargin]);

  const getItemStyles = (index: number) => {
    const isVisible = visibleItems.includes(index);
    const baseTransition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;

    if (!isVisible) {
      const initialStyles: React.CSSProperties = {
        opacity: 0,
        transition: baseTransition,
      };

      switch (animationType) {
        case 'slide-up':
          initialStyles.transform = 'translateY(40px)';
          break;
        case 'slide-down':
          initialStyles.transform = 'translateY(-40px)';
          break;
        case 'slide-left':
          initialStyles.transform = 'translateX(40px)';
          break;
        case 'slide-right':
          initialStyles.transform = 'translateX(-40px)';
          break;
        case 'scale':
          initialStyles.transform = 'scale(0.9)';
          break;
        case 'flip':
          initialStyles.transform = 'rotateX(-90deg)';
          initialStyles.transformOrigin = 'center top';
          break;
        case 'fade':
        default:
          break;
      }
      return initialStyles;
    }

    return {
      opacity: 1,
      transform: 'none',
      transition: baseTransition,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`grid ${containerClassName}`}
      style={{ display: 'grid' }}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement, {
          className: `${(child.props.className || '')} ${className}`,
          style: {
            ...child.props.style,
            ...getItemStyles(index),
          },
        });
      })}
    </div>
  );
}

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  staggerDelay?: number;
  threshold?: number;
  rootMargin?: string;
  animationType?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  duration?: number;
  direction?: 'vertical' | 'horizontal';
}

export function StaggeredList({
  children,
  className = '',
  containerClassName = '',
  staggerDelay = 80,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  animationType = 'slide-up',
  duration = 500,
  direction = 'vertical',
}: StaggeredListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    const childNodes = Array.from(containerRef.current?.children || []);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          childNodes.forEach((_, index) => {
            setTimeout(() => {
              setVisibleItems((prev) => [...prev, index]);
            }, index * staggerDelay);
          });
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [staggerDelay, threshold, rootMargin]);

  const getItemStyles = (index: number) => {
    const isVisible = visibleItems.includes(index);
    const baseTransition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;

    if (!isVisible) {
      const initialStyles: React.CSSProperties = {
        opacity: 0,
        transition: baseTransition,
      };

      switch (animationType) {
        case 'slide-up':
          initialStyles.transform = direction === 'vertical' ? 'translateY(30px)' : 'translateX(30px)';
          break;
        case 'slide-down':
          initialStyles.transform = direction === 'vertical' ? 'translateY(-30px)' : 'translateX(-30px)';
          break;
        case 'slide-left':
          initialStyles.transform = 'translateX(30px)';
          break;
        case 'slide-right':
          initialStyles.transform = 'translateX(-30px)';
          break;
        case 'scale':
          initialStyles.transform = 'scale(0.95)';
          break;
        case 'fade':
        default:
          break;
      }
      return initialStyles;
    }

    return {
      opacity: 1,
      transform: 'none',
      transition: baseTransition,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`flex ${direction === 'vertical' ? 'flex-col' : 'flex-row'} ${containerClassName}`}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement, {
          className: `${(child.props.className || '')} ${className}`,
          style: {
            ...child.props.style,
            ...getItemStyles(index),
          },
        });
      })}
    </div>
  );
}