import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'number';
  currency?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  format = 'number',
  currency = '₹',
  className = '',
  decimals = 2,
}: AnimatedNumberProps) {
  const spring = useSpring(value, {
    damping: 50,
    stiffness: 300,
  });

  const display = useTransform(spring, (current) => {
    if (format === 'currency') {
      return `${currency}${current.toFixed(decimals)}`;
    }
    return current.toFixed(decimals);
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
      key={value} // Re-trigger animation on value change
    >
      {display}
    </motion.span>
  );
}

// Simpler version using CSS transitions (lighter weight)
export function AnimatedNumberSimple({
  value,
  format = 'number',
  currency = '₹',
  className = '',
  decimals = 2,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 500; // 500ms animation
    const startTime = Date.now();

    setIsAnimating(true);

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const current = start + (end - start) * easeOut;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const formattedValue = format === 'currency'
    ? `${currency}${displayValue.toFixed(decimals)}`
    : displayValue.toFixed(decimals);

  return (
    <span
      className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}
      style={{
        display: 'inline-block',
        transition: 'transform 0.3s ease-out',
        transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      {formattedValue}
    </span>
  );
}
