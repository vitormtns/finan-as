"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/formatters";

type AnimatedCurrencyProps = {
  value: number;
  className?: string;
};

export function AnimatedCurrency({ value, className }: AnimatedCurrencyProps) {
  const previousValue = useRef(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      const reducedMotionFrame = requestAnimationFrame(() => {
        previousValue.current = value;
        setDisplayValue(value);
      });

      return () => cancelAnimationFrame(reducedMotionFrame);
    }

    const startValue = previousValue.current;
    const difference = value - startValue;
    const duration = 900;
    const startTime = performance.now();
    let animationFrame = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(startValue + difference * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <span className={className} aria-label={formatCurrency(value)}>
      {formatCurrency(displayValue)}
    </span>
  );
}
