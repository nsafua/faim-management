
import React, { useState, useRef } from 'react';
import { Client } from '../../types';
import { ChevronDownIcon, BanknotesIcon } from '../../components/icons/DummyIcons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';

interface LedgerSidebarProps {
    clients: Client[];
    fixedClient?: Client;
    selectedClient: Client | undefined;
    setSelectedClientId: (id: number) => void;
    originalPrice: string;
    discountValue: string;
    setDiscountValue: (val: string) => void;
    discountType: 'percentage' | 'fixed';
    setDiscountType: (val: 'percentage' | 'fixed') => void;
    installmentCount: string;
    setInstallmentCount: (val: string) => void;
    isClientListEmpty: boolean;
}

export const LedgerSidebar: React.FC<LedgerSidebarProps> = ({
    clients,
    fixedClient,
    selectedClient,
    setSelectedClientId,
    originalPrice,
    discountValue,
    setDiscountValue,
    discountType,
    setDiscountType,
    installmentCount,
    setInstallmentCount,
    isClientListEmpty
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    return (
        <div className="w-full md:w-1/3 xl:w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4 overflow-y-auto scrollbar-thin">
            {!fixedClient && (
                <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 font-bold uppercase text-[10px] tracking-widest">Client Account</label>
                    <button
                        type="button"
                        disabled={isClientListEmpty}
                        onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                        className={`flex items-center justify-between w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm text-gray-900 dark:text-white ${isClientListEmpty ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    >
                        <span className="truncate">
                            {isClientListEmpty ? 'No clients' : (selectedClient ? selectedClient.name : '-- Select --')}
                        </span>
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    </button>
                    {isClientDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-50 max-h-60 overflow-y-auto scrollbar-thin">
                            {clients.map(client => (
                                <button key={client.id} type="button" onClick={() => { setSelectedClientId(client.id); setIsClientDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-b border-gray-50 dark:border-gray-700 last:border-0">{client.name}</button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {selectedClient && (
                <div className="space-y-4">
                    <Card title="Ledger Source" className="p-4 border-dashed border-2">
                        <div className="space-y-4">
                            <div>
                                <Input 
                                    label="Published Price (GHC)" 
                                    type="number" 
                                    value={originalPrice} 
                                    readOnly={true} // AUTHORITY ENFORCED: READ-ONLY
                                    className="bg-gray-50 dark:bg-gray-900/50 font-bold opacity-75 cursor-not-allowed"
                                />
                                <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Read-only: Sourced from CEO Hub</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Input label="Discount" type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                                <Select label="Type" value={discountType} onChange={e => setDiscountType(e.target.value as any)}>
                                    <option value="percentage">%</option>
                                    <option value="fixed">GHC</option>
                                </Select>
                            </div>
                            <Input label="Term (Months)" type="number" value={installmentCount} onChange={e => setInstallmentCount(e.target.value)} min="1" max="12" />
                        </div>
                    </Card>
                    <Button variant="success" onClick={() => {}} className="w-full py-4 font-black uppercase tracking-widest shadow-lg" icon={<BanknotesIcon className="w-6 h-6" />}>Record Payment</Button>
                </div>
            )}
        </div>
    );
};
