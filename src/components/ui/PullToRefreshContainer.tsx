import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { PullIndicator } from '@/components';

interface PullToRefreshContainerProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullPercent: number;
  offsetY: number;
  children: ReactNode;
}

export function PullToRefreshContainer({
  isPulling,
  isRefreshing,
  pullPercent,
  offsetY,
  children,
}: PullToRefreshContainerProps) {
  return (
    <motion.div
      className="space-y-8"
      animate={{ y: offsetY }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
    >
      {(isPulling || isRefreshing) && (
        <PullIndicator isRefreshing={isRefreshing} percent={pullPercent} />
      )}
      {children}
    </motion.div>
  );
}
