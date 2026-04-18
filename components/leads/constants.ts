
import { Lead } from '../../types';

export const KANBAN_STAGES: Lead['status'][] = [
    'Contacted',
    'Visited Site',
    'Filled a Form',
    'Submitted the Form',
    'Made Payment',
    'Converted to Client',
];

export const STAGE_COLORS: Record<Lead['status'], { bg: string; text: string; border: string; darkBg: string; darkText: string; darkBorder: string }> = {
    'Contacted': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-400', darkBg: 'dark:bg-blue-900/30', darkText: 'dark:text-blue-300', darkBorder: 'dark:border-blue-700' },
    'Visited Site': { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-400', darkBg: 'dark:bg-yellow-900/30', darkText: 'dark:text-yellow-300', darkBorder: 'dark:border-yellow-700' },
    'Filled a Form': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-400', darkBg: 'dark:bg-purple-900/30', darkText: 'dark:text-purple-300', darkBorder: 'dark:border-purple-700' },
    'Submitted the Form': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-400', darkBg: 'dark:bg-indigo-900/30', darkText: 'dark:text-indigo-300', darkBorder: 'dark:border-indigo-700' },
    'Made Payment': { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-400', darkBg: 'dark:bg-pink-900/30', darkText: 'dark:text-pink-300', darkBorder: 'dark:border-pink-700' },
    'Converted to Client': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-400', darkBg: 'dark:bg-green-900/30', darkText: 'dark:text-green-300', darkBorder: 'dark:border-green-700' },
};
