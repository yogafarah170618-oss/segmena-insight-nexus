import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CelebrationAnimationProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
}

export const CelebrationAnimation = ({
  show,
  message,
  onComplete,
}: CelebrationAnimationProps) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="glass-card p-6 rounded-xl shadow-2xl border-primary/50 border-2">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
              <div>
                <div className="text-lg font-bold">Achievement!</div>
                <div className="text-sm text-muted-foreground">{message}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
