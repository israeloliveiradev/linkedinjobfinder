'use client';

import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`container mx-auto px-4 pt-24 pb-12 min-h-screen ${className}`}
    >
      {children}
    </motion.main>
  );
}
