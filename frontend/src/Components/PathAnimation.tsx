import { motion } from "motion/react";
import type { Transition } from "motion/react";
import { useEffect, useState} from "react";
import type { RefObject } from "react";

interface PathAnimationProps {
  containerRef: RefObject<HTMLDivElement|null>;
  featureRefs: RefObject<HTMLDivElement|null>[];
  centerRef: RefObject<HTMLDivElement|null>;
}

const PathAnimation = ({ containerRef, featureRefs, centerRef }: PathAnimationProps) => {
  const [paths, setPaths] = useState<string[]>([]);

  // 5 different colors for the moving circles
  const dotColors = [
    "bg-sky-400",
    "bg-emerald-400",
    "bg-amber-400",
    "bg-fuchsia-400",
    "bg-rose-400",
  ];

  const glowColors = [
    "bg-sky-400/40",
    "bg-emerald-400/40",
    "bg-amber-400/40",
    "bg-fuchsia-400/40",
    "bg-rose-400/40",
  ];

  const transition: Transition = {
    duration: 4,
    repeat: Infinity,
    repeatType: "loop",
    ease: "easeInOut",
  };

  // Calculate paths based on actual element positions
  useEffect(() => {
    const calculatePaths = () => {
        console.log(containerRef);
        
      if (!containerRef.current || !centerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const centerRect = centerRef.current.getBoundingClientRect();
      
      const centerX = centerRect.left - containerRect.left + centerRect.width / 2;
      const centerXLeft = centerRect.left - containerRect.left + 50;
      const centerXRight = centerRect.left - containerRect.left + centerRect.width -20;

      const centerY = centerRect.top - containerRect.top + centerRect.height / 2;

      const newPaths = featureRefs.map((ref,idx) => {
        if (!ref.current) return "";
        
        const featureRect = ref.current.getBoundingClientRect();
        const startX = featureRect.right - containerRect.left;
        const startY = featureRect.top - containerRect.top + featureRect.height / 2;
        
        // Create a curved path from feature to center
        const midX = (startX + centerX) / 2;
        return `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${(startY + centerY) / 2} T ${idx === 0 || idx === 1 || idx === 2 ? centerXLeft : centerXRight} ${centerY}`;
      });

      setPaths(newPaths.filter(p => p !== ""));
    };

    requestAnimationFrame(() => {
        calculatePaths();
      });

    // Recalculate on resize
    window.addEventListener("resize", calculatePaths);
    return () => window.removeEventListener("resize", calculatePaths);
  }, [containerRef, featureRefs, centerRef]);

  if (paths.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" style={{ position: "absolute", top: 0, left: 0 }}>
        {paths.map((path, idx) => (
          <path
            key={idx}
            d={path}
            fill="none"
            strokeWidth="2"
            stroke="#cbd5e1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* Animated dots for each path */}
      {paths.map((path, idx) => {
        const transitionWithDelay: Transition = {
          ...transition,
          delay: (idx % 3) * 0.5,
        };

        const dotColor = dotColors[idx % dotColors.length];
        const glowColor = glowColors[idx % glowColors.length];

        return (
        <motion.div
          key={idx}
          className="absolute flex items-center justify-center"
          style={{
            width: 10,
            height: 10,
            offsetPath: `path("${path}")`,
          }}
          initial={{ offsetDistance: "100%", scale: 0.8, opacity: 0.8 }}
          animate={{
            offsetDistance: "0%",
            scale: [0.8, 1.2, 0.8],
            opacity: [0.8, 1, 0.8],
            boxShadow: [
              "0 0 0px rgba(74, 157, 248, 0.0)",
              "0 0 16px rgba(74, 157, 248, 0.6)",
              "0 0 0px rgba(74, 157, 248, 0.0)",
            ],
          }}
          transition={transitionWithDelay}
        >
          <div className={`h-2 w-2 rounded-full ${dotColor}`} />
          <div className={`absolute h-4 w-4 rounded-full ${glowColor} blur-xs`} />
        </motion.div>
        )})}
    </div>
  );
};

export default PathAnimation;