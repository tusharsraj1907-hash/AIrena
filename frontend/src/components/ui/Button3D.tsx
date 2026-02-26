import React from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { cn } from './utils';

interface Button3DProps extends Omit<ButtonProps, 'ref'> {
  intensity?: number;
  depth?: number;
}

export function Button3D({ 
  children, 
  className,
  ...props 
}: Button3DProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <Button
        className={cn('relative', className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
}

