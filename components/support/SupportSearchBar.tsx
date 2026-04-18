
import React from 'react';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { MagnifyingGlassIcon } from '../icons/DummyIcons';

interface SupportSearchBarProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filterCategory: string;
    setFilterCategory: (val: string) => void;
    categories: string[];
}

export const SupportSearchBar: React.FC<SupportSearchBarProps> = ({ 
    searchQuery, 
    setSearchQuery, 
    filterCategory, 
    setFilterCategory, 
    categories 
}) => {
    return (
        <Card className="p-0 overflow-hidden">
            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                        placeholder="Search user manual topics..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="md:w-64">
                    <Select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Select>
                </div>
            </div>
        </Card>
    );
};
