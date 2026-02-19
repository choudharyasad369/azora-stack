import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function GlassCard({ children, className, hover = true, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
      className={cn(
        'relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80',
        'border border-white/20 dark:border-gray-800/20',
        'rounded-2xl shadow-xl shadow-purple-500/10',
        'transition-all duration-300',
        hover && 'hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/30',
        className
      )}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
