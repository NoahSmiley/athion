"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Parallax speed layer — children move at a different rate than scroll.
 * speed < 1 = slower (background feel), speed > 1 = faster (foreground).
 */
export function ParallaxLayer({
  children,
  className,
  speed = 0.5,
  offset = 100,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  offset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset * speed, -offset * speed]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30, mass: 0.5 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: smoothY }}>{children}</motion.div>
    </div>
  );
}

/**
 * Fade + scale on scroll — Apple-style "zoom into view" effect.
 * Element starts slightly scaled down and transparent, becomes full size as it enters viewport.
 */
export function ScrollZoom({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });
  const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ scale: smoothScale, opacity: smoothOpacity }}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Horizontal slide-in on scroll — element slides in from left or right.
 */
export function ScrollSlide({
  children,
  className,
  from = "left",
  distance = 80,
}: {
  children: ReactNode;
  className?: string;
  from?: "left" | "right";
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const startX = from === "left" ? -distance : distance;
  const x = useTransform(scrollYProgress, [0, 1], [startX, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 1], [0, 0.3, 1]);
  const smoothX = useSpring(x, { stiffness: 80, damping: 25 });
  const smoothOpacity = useSpring(opacity, { stiffness: 80, damping: 25 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ x: smoothX, opacity: smoothOpacity }}>
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Sticky text section — text pins while scroll progress drives a visual change.
 * Apple-style "sticky headline with scrolling content alongside".
 */
export function StickySection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {children}
    </div>
  );
}

/**
 * Scroll-driven opacity text — words/lines fade in sequentially as user scrolls.
 */
export function ScrollText({
  text,
  className,
  tag: Tag = "p",
}: {
  text: string;
  className?: string;
  tag?: "p" | "h1" | "h2" | "h3" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.3"],
  });

  const words = text.split(" ");

  return (
    <div ref={ref}>
      <Tag className={className}>
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return <ScrollWord key={i} progress={scrollYProgress} range={[start, end]}>{word} </ScrollWord>;
        })}
      </Tag>
    </div>
  );
}

function ScrollWord({
  children,
  progress,
  range,
}: {
  children: ReactNode;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);

  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em] transition-none">
      {children}
    </motion.span>
  );
}
