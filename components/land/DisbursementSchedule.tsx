
import React, { ChangeEvent } from 'react';
import { Card } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { PlusCircleIcon, TrashIcon } from '../../components/icons/DummyIcons';

interface DisbursementScheduleProps {
    formData: any;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const DisbursementSchedule: React.FC<DisbursementScheduleProps> = ({ formData, handleChange, setFormData }) => {
    
    const addPayee = () => {
        if (formData.payees.length < 10) {
            setFormData((prev: any) => ({
                ...prev,
                payees: [...prev.payees, { id: Date.now().toString(), name: '', acres: '', amount: '' }]
            }));
        }
    };
    
    const handlePayeeChange = (index: number, field: string, value: string) => {
        const newPayees = [...formData.payees];
        newPayees[index] = { ...newPayees[index], [field]: value };
        setFormData((prev: any) => ({ ...prev, payees: newPayees }));
    };

    const removePayee = (id: string) => {
        setFormData((prev: any) => ({ ...prev, payees: prev.payees.filter((p: any) => p.id !== id) }));
    };

    return (
        <Card title="Section 4: Disbursement Schedule">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input id="paymentAmountPerMonth" name="paymentAmountPerMonth" label="Installment Amount (GHC)" type="number" value={formData.paymentAmountPerMonth} onChange={handleChange} className="no-spinner font-bold" />
                    <Input id="paymentPeriodMonths" name="paymentPeriodMonths" label="Term Length (Months)" type="number" value={formData.paymentPeriodMonths} onChange={handleChange} className="no-spinner" />
                    <Select id="recurringPaymentTime" name="recurringPaymentTime" label="Disbursement Frequency" value={formData.recurringPaymentTime} onChange={handleChange}>
                    <option value="">Select frequency...</option>
                    <option>Monthly</option>
                    <option>Bi-Monthly</option>
                    <option>Quarterly</option>
                    <option>Annually</option>
                </Select>
            </div>
            <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Designated Payees</h4>
                <div className="mt-2 overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-left text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="p-3 font-black uppercase tracking-widest text-[10px]">Beneficiary Name</th>
                                <th className="p-3 font-black uppercase tracking-widest text-[10px]">Acreage Proxy</th>
                                <th className="p-3 font-black uppercase tracking-widest text-[10px]">Designated Sum (GHC)</th>
                                <th className="p-3 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                            {formData.payees.map((payee: any, index: number) => (
                                <tr key={payee.id}>
                                    <td className="p-2"><input type="text" value={payee.name} onChange={(e) => handlePayeeChange(index, 'name', e.target.value)} className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"/></td>
                                    <td className="p-2"><input type="number" value={payee.acres} onChange={(e) => handlePayeeChange(index, 'acres', e.target.value)} className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm no-spinner"/></td>
                                    <td className="p-2"><input type="number" value={payee.amount} onChange={(e) => handlePayeeChange(index, 'amount', e.target.value)} className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm no-spinner font-bold"/></td>
                                    <td className="p-2 text-center"><button type="button" onClick={() => removePayee(payee.id)} className="text-gray-400 p-2 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5"/></button></td>
                                </tr>
                            ))}
                            {formData.payees.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-gray-400 italic">No designated payees specified.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {formData.payees.length < 10 && (
                    <button type="button" onClick={addPayee} className="mt-3 flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 uppercase tracking-widest">
                        <PlusCircleIcon className="w-4 h-4"/> Add Designated Payee
                    </button>
                )}
            </div>
        </Card>
    );
};
