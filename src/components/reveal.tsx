"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  amount?: number;
  margin?: string;
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
      viewport={{ once: true, amount, margin: margin as any }}
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
  margin?: string;
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
      viewport={{ once: true, amount, margin: margin as any }}
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
}

export function RevealItem({
  children,
  direction = "up",
  duration = 0.6,
  className,
}: RevealItemProps) {
  const offset = offsets[direction];

  const itemVariants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}