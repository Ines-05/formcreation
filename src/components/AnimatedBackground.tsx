'use client';

import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Fond sombre */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0f1419] to-[#14171A]" />
      
      {/* Gradient bleu lumineux principal - effet horizon */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[600px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full rounded-[100%] bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-3xl" />
      </motion.div>
      
      {/* Gradient secondaire pour plus de profondeur */}
      <motion.div
        className="absolute bottom-[-100px] left-1/4 w-[800px] h-[400px]"
        animate={{
          x: [-50, 50, -50],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-radial from-[#1DA1F2]/20 via-[#0c8bd9]/10 to-transparent blur-2xl" />
      </motion.div>
      
      {/* Gradient tertiaire à droite */}
      <motion.div
        className="absolute bottom-[-80px] right-1/4 w-[600px] h-[350px]"
        animate={{
          x: [50, -50, 50],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-radial from-[#1DA1F2]/15 via-primary/8 to-transparent blur-2xl" />
      </motion.div>
      
      {/* Particules flottantes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Overlay de vignette pour effet de profondeur */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#14171A]/20" />
    </div>
  );
}
