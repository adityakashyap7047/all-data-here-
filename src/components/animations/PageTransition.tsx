'use client';

import { useEffect, useState, ReactNode } from 'react';
import React from 'react';

type TransitionType = 'fade' | 'slide' | 'scale' | 'clip' | 'iris';

interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  className?: string;
  onEnter?: () => void;
  onExit?: () => void;
}

export function PageTransition({
  children,
  type = 'fade',
  duration = 400,
  delay = 0,
  className = '',
  onEnter,
  onExit,
}: PageTransitionProps) {
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(true);
      onEnter?.();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onEnter]);

  const getStyles = () => {
    const baseTransition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;

    if (isExiting) {
      const exitStyles: React.CSSProperties = {
        transition: baseTransition,
      };

      switch (type) {
        case 'slide':
          exitStyles.transform = 'translateX(-20px)';
          exitStyles.opacity = 0;
          break;
        case 'scale':
          exitStyles.transform = 'scale(0.95)';
          exitStyles.opacity = 0;
          break;
        case 'clip':
          exitStyles.clipPath = 'inset(0 100% 0 0)';
          break;
        case 'iris':
          exitStyles.clipPath = 'circle(0% at 50% 50%)';
          break;
        case 'fade':
        default:
          exitStyles.opacity = 0;
          break;
      }
      return exitStyles;
    }

    if (!isEntering) {
      const initialStyles: React.CSSProperties = {
        transition: baseTransition,
      };

      switch (type) {
        case 'slide':
          initialStyles.transform = 'translateX(20px)';
          initialStyles.opacity = 0;
          break;
        case 'scale':
          initialStyles.transform = 'scale(1.05)';
          initialStyles.opacity = 0;
          break;
        case 'clip':
          initialStyles.clipPath = 'inset(0 0 0 100%)';
          break;
        case 'iris':
          initialStyles.clipPath = 'circle(0% at 50% 50%)';
          break;
        case 'fade':
        default:
          initialStyles.opacity = 0;
          break;
      }
      return initialStyles;
    }

    return {
      opacity: 1,
      transform: 'none',
      clipPath: 'none',
      transition: baseTransition,
    };
  };

  return (
    <div
      className={className}
      style={{
        ...getStyles(),
        willChange: 'opacity, transform, clip-path',
      }}
    >
      {children}
    </div>
  );
}

interface TransitionGroupProps {
  children: ReactNode;
  enterType?: TransitionType;
  exitType?: TransitionType;
  duration?: number;
  className?: string;
}

export function TransitionGroup({
  children,
  enterType = 'fade',
  exitType = 'fade',
  duration = 300,
  className = '',
}: TransitionGroupProps) {
  const [key, setKey] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const transition = (newKey: number) => {
    setIsExiting(true);
    setTimeout(() => {
      setKey(newKey);
      setIsExiting(false);
    }, duration);
  };

  return (
    <div className={className}>
      <PageTransition
        type={isExiting ? exitType : enterType}
        duration={duration}
        onExit={() => setIsExiting(true)}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          return React.cloneElement(child as React.ReactElement, {
            key,
          });
        })}
      </PageTransition>
    </div>
  );
}

interface ViewTransitionProps {
  children: ReactNode;
  className?: string;
}

export function ViewTransition({ children, className = '' }: ViewTransitionProps) {
  return (
    <div className={className} style={{ viewTransitionName: 'page-content' }}>
      {children}
    </div>
  );
}