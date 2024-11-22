
'use client';
import { motion } from 'framer-motion';

export default function AnimatedHeader({ children }: { children: React.ReactNode }) {
  return (
    <motion.header
      layout
      transition={{ 
        duration: 2,
        type: "spring",
        stiffness: 100
      }}
      className='order-last sm:order-first'
    >
      {children}
    </motion.header>
  );
}