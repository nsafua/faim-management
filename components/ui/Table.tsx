
import React from 'react';

export const TableContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto transition-colors duration-200 ${className}`}>
    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">{children}</table>
  </div>
);

export const Thead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-900">
    {children}
  </thead>
);

export const Tbody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
);

export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${className}`} {...props}>{children}</tr>
);

export const Th: React.FC<{ children: React.ReactNode; className?: string; scope?: string }> = ({ children, className = '', scope = "col" }) => (
  <th scope={scope} className={`px-6 py-3 font-semibold ${className}`}>{children}</th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 ${className}`} {...props}>{children}</td>
);
