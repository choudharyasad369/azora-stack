import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface PremiumBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  glow?: boolean;
}

export function PremiumBadge({
  children,
  variant = 'default',
  size = 'md',
  animated = false,
  glow = false,
}: PremiumBadgeProps) {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300',
    success: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300',
    warning: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-300',
    error: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-300',
    premium: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-400',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const glowColors = {
    default: 'shadow-gray-500/50',
    success: 'shadow-green-500/50',
    warning: 'shadow-yellow-500/50',
    error: 'shadow-red-500/50',
    premium: 'shadow-purple-500/50',
  };

  const Badge = animated ? motion.span : 'span';

  return (
    <Badge
      {...(animated && {
        initial: { scale: 0, rotate: -180 },
        animate: { scale: 1, rotate: 0 },
        whileHover: { scale: 1.1 },
        transition: { type: 'spring', stiffness: 200 },
      })}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold border',
        'transition-all duration-300',
        variants[variant],
        sizes[size],
        glow && `shadow-lg ${glowColors[variant]}`
      )}
    >
      {variant === 'premium' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="h-3 w-3" />
        </motion.div>
      )}
      {children}
    </Badge>
  );
}
