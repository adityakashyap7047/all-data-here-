'use client';

import { useEffect, useRef, useState } from 'react';

type SplitType = 'lines' | 'words' | 'chars';
type AnimationType = 'fade' | 'slide' | 'scale' | 'clip';

interface SplitTextProps {
  children: React.ReactNode;
  splitType?: SplitType;
  animationType?: AnimationType;
  duration?: number;
  delay?: number;
  stagger?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'span' | 'div';
  onComplete?: () => void;
}

function SplitText({
  children,
  splitType = 'lines',
  animationType = 'fade',
  duration = 0.8,
  delay = 0,
  stagger = 0.05,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  className = '',
  as: Component = 'p',
  onComplete,
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationFrameRef = useRef<number>();

  const text = typeof children === 'string' ? children : String(children);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay, threshold, rootMargin, hasAnimated]);

  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, (duration + stagger * 10) * 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, stagger, onComplete]);

  const splitText = (text: string): string[] => {
    switch (splitType) {
      case 'lines':
        return text.split('\n').filter((line) => line.trim() !== '');
      case 'words':
        return text.split(/(\s+)/).filter((word) => word !== '');
      case 'chars':
        return text.split('');
      default:
        return [text];
    }
  };

  const parts = splitText(text);

  const getAnimationStyles = (index: number) => {
    const baseDelay = delay + index * stagger;
    const baseTransition = `all ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay}s`;

    const initialStyles: Record<string, string> = {
      opacity: '0',
      transition: baseTransition,
    };

    const visibleStyles: Record<string, string> = {
      opacity: '1',
      transition: baseTransition,
    };

    switch (animationType) {
      case 'slide':
        initialStyles.transform = 'translateY(100%)';
        visibleStyles.transform = 'translateY(0)';
        break;
      case 'scale':
        initialStyles.transform = 'scale(0.8)';
        visibleStyles.transform = 'scale(1)';
        break;
      case 'clip':
        initialStyles.clipPath = 'inset(0 100% 0 0)';
        visibleStyles.clipPath = 'inset(0 0 0 0)';
        break;
      case 'fade':
      default:
        break;
    }

    return isVisible ? visibleStyles : initialStyles;
  };

  const renderParts = () => {
    if (splitType === 'lines') {
      return parts.map((line, i) => (
        <div
          key={i}
          className="overflow-hidden"
          style={getAnimationStyles(i) as React.CSSProperties}
        >
          <span style={{ display: 'block' }}>{line}</span>
        </div>
      ));
    }

    return parts.map((part, i) => (
      <span
        key={i}
        className="inline-block"
        style={getAnimationStyles(i) as React.CSSProperties}
      >
        {part}
      </span>
    ));
  };

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        ...(splitType === 'lines' && { display: 'block' }),
        ...(splitType === 'words' && { display: 'inline' }),
        ...(splitType === 'chars' && { display: 'inline' }),
      }}
    >
      {renderParts()}
    </Component>
  );
}

export default SplitText;