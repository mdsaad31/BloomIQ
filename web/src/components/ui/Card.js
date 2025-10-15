import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  gradient = false,
  glow = false,
  ...props
}) => {
  const baseStyles = 'bg-white rounded-2xl shadow-lg overflow-hidden';
  const hoverStyles = hover ? 'hover:shadow-xl transition-all duration-300' : '';
  const glowStyles = glow ? 'shadow-glow' : '';
  const gradientStyles = gradient ? 'bg-gradient-to-br from-white via-primary-50 to-white' : '';

  const cardClasses = `
    ${baseStyles}
    ${hoverStyles}
    ${glowStyles}
    ${gradientStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -5 } : {}}
      className={cardClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-gray-100 bg-gray-50 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
