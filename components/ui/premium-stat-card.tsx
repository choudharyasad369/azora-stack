import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  gradient?: string;
  delay?: number;
}

export function PremiumStatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  gradient = 'from-purple-500 to-blue-500',
  delay = 0,
}: PremiumStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      {/* Glow effect */}
      <div className={cn(
        'absolute -inset-0.5 bg-gradient-to-r rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500',
        gradient
      )} />

      {/* Card */}
      <div className="relative backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl p-6 border border-white/20 shadow-xl overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          className={cn('absolute inset-0 bg-gradient-to-br opacity-5', gradient)}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {title}
              </p>
              <motion.h3
                className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
              >
                {value}
              </motion.h3>
            </div>

            {/* Icon with gradient */}
            <motion.div
              className={cn(
                'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                gradient
              )}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className="h-7 w-7 text-white" />
            </motion.div>
          </div>

          {/* Trend */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.3 }}
              className="flex items-center gap-2 mb-2"
            >
              <span
                className={cn(
                  'text-sm font-semibold px-2 py-1 rounded-lg',
                  trend.isPositive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </motion.div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </motion.div>
  );
}

export function PremiumStatCardSkeleton() {
  return (
    <div className="relative backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-white/20 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-14 h-14 rounded-xl bg-gray-200 animate-pulse" />
      </div>
      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
