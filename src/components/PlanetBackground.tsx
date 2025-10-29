'use client';

import { motion } from 'motion/react';

export function PlanetBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Effet de planète/sphère lumineuse en bas */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[1400px] h-[1400px]">
        {/* Planète principale */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(29, 161, 242, 0.4), rgba(29, 161, 242, 0.1) 40%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Cercles lumineux concentriques */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/20"
            style={{
              transform: `scale(${0.7 + i * 0.15})`,
            }}
            animate={{
              scale: [0.7 + i * 0.15, 0.75 + i * 0.15, 0.7 + i * 0.15],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
        
        {/* Lueur intense au centre */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(29, 161, 242, 0.6), transparent 60%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      
      {/* Particules flottantes */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/40 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Grille de fond subtile */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(29, 161, 242, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 161, 242, 0.3) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />
      
      {/* Spots lumineux aléatoires */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`spot-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: 200 + Math.random() * 300,
            height: 200 + Math.random() * 300,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(29, 161, 242, ${0.05 + Math.random() * 0.1}), transparent 70%)`,
          }}
          animate={{
            x: [-30, 30, -30],
            y: [-30, 30, -30],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}
