import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Loader2 className={`animate-spin text-primary-500 ${sizes[size]} ${className}`} />
  );
};

export const LoadingDots = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export const LoadingOverlay = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} bg-white/80 backdrop-blur-sm flex items-center justify-center z-40`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </motion.div>
    </div>
  );
};

export const SkeletonLoader = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </>
  );
};

export const LoadingCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <SkeletonLoader className="h-6 w-1/3" />
      <SkeletonLoader className="h-4 w-full" count={3} />
      <SkeletonLoader className="h-10 w-1/4" />
    </div>
  );
};

export default LoadingSpinner;
