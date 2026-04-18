import React from 'react';

// FIX: Extended HTMLAttributes to support onMouseEnter and other standard props
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  action?: React.ReactNode;
  // FIX: Added icon prop
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, title, action, icon, ...props }) => {
  return (
    <div 
      onClick={onClick}
      // FIX: Spread remaining props to support onMouseEnter etc.
      {...props}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col animate-entry ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900' : ''} ${className}`}
    >
      {(title || action || icon) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-transparent">
            {/* FIX: Render icon if provided next to title */}
            <div className="flex items-center gap-2">
                {icon && <span>{icon}</span>}
                {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-white uppercase tracking-tight">{title}</h3>}
            </div>
            {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6 flex-grow">
        {children}
      </div>
    </div>
  );
};