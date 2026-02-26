import { motion, AnimatePresence } from 'framer-motion';

export function TestMotion() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        Test Motion Component
      </motion.div>
    </AnimatePresence>
  );
}