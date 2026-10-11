import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  activeKey: string;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, activeKey, className = '' }) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      key={activeKey}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
