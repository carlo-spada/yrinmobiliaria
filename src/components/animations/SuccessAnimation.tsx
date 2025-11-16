import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function SuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          delay: 0.2,
          type: 'spring',
          stiffness: 200,
          damping: 15
        }}
      >
        <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}
