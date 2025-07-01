"use client";
import { useEffect, useRef, useState } from "react";

export default function CursorTrails() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorTrailsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const trailCount = 10;
    const trails: HTMLDivElement[] = [];
    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement("div");
      trail.className = "cursor-trail";
      document.body.appendChild(trail);
      trails.push(trail);
    }
    cursorTrailsRef.current = trails;
    return () => {
      trails.forEach((trail) => {
        if (document.body.contains(trail)) {
          document.body.removeChild(trail);
        }
      });
    };
  }, []);

  useEffect(() => {
    const trails = cursorTrailsRef.current;
    if (trails.length === 0) return;
    let positions: { x: number; y: number }[] = Array(trails.length).fill({ x: 0, y: 0 });
    const animateTrails = () => {
      positions = [mousePosition, ...positions.slice(0, -1)];
      trails.forEach((trail, index) => {
        const position = positions[index];
        if (position) {
          trail.style.left = `${position.x}px`;
          trail.style.top = `${position.y}px`;
          trail.style.opacity = `${1 - index / trails.length}`;
          trail.style.width = `${8 - (index / trails.length) * 6}px`;
          trail.style.height = `${8 - (index / trails.length) * 6}px`;
        }
      });
      requestAnimationFrame(animateTrails);
    };
    const animationId = requestAnimationFrame(animateTrails);
    return () => cancelAnimationFrame(animationId);
  }, [mousePosition]);

  return null;
} 