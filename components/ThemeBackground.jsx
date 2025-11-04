"use client";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

export default function ThemeBackground({ theme }) {
  const themeGradients = {
    "Rain Zen": ["#0f172a", "#1e3a8a", "#0ea5a9"],
    "Ocean Flow": ["#012a4a", "#0366a6", "#40c9ff"],
    "Forest Serenity": ["#072521", "#0b894cff", "#c7f9d4"],
    "Focus Energy": ["#2b1055", "#7b2ff7", "#ff7eb3"],
    "Deep Space": ["#020111", "#2b5876", "#0f0c29"],
  };

  const colors = themeGradients[theme] || themeGradients["Rain Zen"];
  const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 45%, ${colors[2]} 100%)`;

  // Motion values for subtle parallax drift
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const backgroundPosition = useTransform(
    [x, y],
    ([latestX, latestY]) => `${latestX}% ${latestY}%`
  );

  // Mouse-based drift
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const moveX = 50 + (e.clientX / innerWidth - 0.5) * 10;
      const moveY = 50 + (e.clientY / innerHeight - 0.5) * 10;
      animate(x, moveX, { duration: 2, ease: "easeOut" });
      animate(y, moveY, { duration: 2, ease: "easeOut" });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      className="absolute inset-0 -z-10"
      style={{
        backgroundImage: gradient,
        backgroundSize: "260% 260%",
        backgroundRepeat: "no-repeat",
        backgroundPosition,
        filter: "brightness(1.12) contrast(1.08) saturate(1.05)",
      }}
      animate={{
        backgroundPosition: [
          "0% 40%",
          "100% 60%",
          "50% 100%",
          "0% 50%",
        ],
        scale: [1, 1.02, 1, 0.995, 1.02, 1], // subtle breathing motion
      }}
      transition={{
        duration: 60, // one full breath cycle per minute
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
}
