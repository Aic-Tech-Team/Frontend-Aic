"use client";

import { motion, type Variants } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

type ViewportMargin = NonNullable<
  NonNullable<ComponentProps<typeof motion.div>["viewport"]>["margin"]
>;

interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  amount?: number;
  margin?: ViewportMargin;
  className?: string;
}

const offsets: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: 28 },
  right: { x: -28 },
  none: {},
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  amount = 0.15,
  margin = "0px 0px -15% 0px",
  className,
}: RevealProps) {
  const offset = offsets[direction];

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  margin?: ViewportMargin;
}

export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  amount = 0.1,
  margin = "0px 0px -15% 0px",
}: RevealGroupProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin }}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

interface RevealItemProps {
  children: ReactNode;
  direction?: RevealDirection;
  duration?: number;
  className?: string;
  /** Lift on hover via a child wrapper — keeps motion transform off CSS hover transform. */
  hoverLift?: boolean;
  /**
   * Optional per-item delay (seconds). Useful when RevealItem is used
   * standalone — e.g. inside a Carousel — without a wrapping RevealGroup
   * to orchestrate the stagger.
   */
  delay?: number;
  amount?: number;
  margin?: ViewportMargin;
}

export function RevealItem({
  children,
  direction = "up",
  duration = 0.6,
  className,
  hoverLift = false,
  delay = 0,
  amount = 0.15,
  margin = "0px 0px -15% 0px",
}: RevealItemProps) {
  const offset = offsets[direction];

  const itemVariants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin }}
      variants={itemVariants}
    >
      {hoverLift ? (
        <div className="h-full transition-transform duration-500 hover:-translate-y-1.5">
          {children}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}
