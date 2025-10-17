
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;