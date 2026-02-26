import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';

interface Card3DProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode;
  intensity?: number;
  flipOnHover?: boolean;
  className?: string;
}

export function Card3D({ 
  children, 
  className,
  intensity,
  flipOnHover,
  ...props 
}: Card3DProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('relative', className)}
      {...props}
    >
      <div className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}

