import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  activeKey: string;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, activeKey, className = '' }) => {
  return (
    <div
      key={activeKey}
      className={`animate-page-enter transition-all ${className}`}
    >
      {children}
    </div>
  );
};
