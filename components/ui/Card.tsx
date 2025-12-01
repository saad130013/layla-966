
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
        {title && <h3 className="text-lg font-semibold text-brand-blue-dark dark:text-brand-green mb-4">{title}</h3>}
        {children}
    </div>
  );
};

export default Card;