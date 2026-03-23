'use client';

import React, { useEffect, useRef, useState } from 'react';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale-in' | 'blur-in' | 'slide-reveal';

interface MotionRevealProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;       // ms
  delay?: number;          // ms
  threshold?: number;      // 0-1
  once?: boolean;          // only animate once
  className?: string;
  stagger?: number;        // stagger index (for child delay)
  as?: keyof JSX.IntrinsicElements;
}

export function MotionReveal({
  children,
  animation = 'fade-up',
  duration = 700,
  delay = 0,
  threshold = 0.15,
  once = true,
  className = '',
  stagger,
  as: Tag = 'div',
}: MotionRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const totalDelay = delay + (stagger ? stagger * 80 : 0);

  return (
    <Tag
      ref={ref as any}
      className={`${isVisible ? `motion-reveal ${animation}` : 'motion-hidden'} ${className}`}
      style={isVisible ? {
        animationDuration: `${duration}ms`,
        animationDelay: `${totalDelay}ms`,
      } : undefined}
    >
      {children}
    </Tag>
  );
}

/* Batch wrapper — automatically staggers children */
interface MotionStaggerProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  baseDelay?: number;
  staggerDelay?: number;
  threshold?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function MotionStagger({
  children,
  animation = 'fade-up',
  duration = 700,
  baseDelay = 0,
  staggerDelay = 80,
  threshold = 0.1,
  className = '',
  as: Tag = 'div',
}: MotionStaggerProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref as any} className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <div
            className={isVisible ? `motion-reveal ${animation}` : 'motion-hidden'}
            style={isVisible ? {
              animationDuration: `${duration}ms`,
              animationDelay: `${baseDelay + index * staggerDelay}ms`,
            } : undefined}
          >
            {child}
          </div>
        );
      })}
    </Tag>
  );
}
