
import React from 'react';

interface QuickActionButtonProps {
    icon: React.ReactNode;
    label: string;
    color: string;
    hoverColor: string;
    onClick?: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, color, hoverColor, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg text-white font-semibold transition-colors ${color} ${hoverColor} shadow-md`}>
        {icon}
        <span className="mt-2 text-sm text-center">{label}</span>
    </button>
);
