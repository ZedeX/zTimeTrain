"use client";
import { useEffect, useRef } from "react";

interface Props {
  active: boolean;
}

export default function CelebrationEffect({ active }: Props) {
  const prevActive = useRef(false);

  useEffect(() => {
    if (active && !prevActive.current) {
      fireworks();
    }
    prevActive.current = active;
  }, [active]);

  async function fireworks() {
    const confetti = (await import("canvas-confetti")).default;
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#1565C0", "#E65100", "#2E7D32", "#FFB84D", "#FF4D4F", "#722ED1"];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    // Initial burst
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors,
    });

    setTimeout(() => requestAnimationFrame(frame), 500);
  }

  return null;
}
