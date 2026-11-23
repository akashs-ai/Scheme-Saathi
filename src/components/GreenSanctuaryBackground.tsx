import { motion, useReducedMotion } from 'motion/react';
import { InteractiveDotField } from './InteractiveDotField';

export function GreenSanctuaryBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0.2 : 0.72,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed inset-0 z-[1] overflow-hidden pointer-events-none bg-[#060C08]"
    >
      {/* Base Charcoal-Emerald Sanctuary Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_18%,rgba(19,49,33,0.84)_0%,rgba(9,18,13,0.96)_54%,#050907_100%)]" />

      {/* Subtle Muted Olive Counter-Depth with Ultra-Slow Organic Drift */}
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                x: [0, 18, -10, 0],
                y: [0, -14, 10, 0],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 28,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
        className="absolute -inset-12 bg-[radial-gradient(circle_at_78%_76%,rgba(44,58,32,0.28)_0%,rgba(14,24,18,0)_56%)]"
      />

      {/* Restrained Atmospheric Emerald Depth */}
      <div className="absolute -top-36 -left-28 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(28,70,46,0.32)_0%,rgba(14,36,24,0)_70%)] blur-3xl" />

      {/* Subtle Bottom Horizon Depth & Edge Vignette Underneath the Dot Field */}
      <div className="absolute inset-x-0 bottom-0 h-[34vh] bg-gradient-to-t from-[#040806]/65 via-[#07100B]/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_58%,rgba(3,6,4,0.45)_100%)]" />

      {/* Full-Screen Interactive Cursor-Reactive Canvas Dot Field (unobstructed top-to-bottom) */}
      <InteractiveDotField protectedSelector='[data-auth-card="true"]' />
    </motion.div>
  );
}
