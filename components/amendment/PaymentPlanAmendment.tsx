
import React from 'react';
import { Card } from '../ui/Card';
import { Select } from '../ui/Input';
import { AmendmentRequest } from '../../types';

interface PaymentPlanAmendmentProps {
    data: NonNullable<AmendmentRequest['paymentPlanDetails']>;
    onChange: (field: string, value: string) => void;
}

export const PaymentPlanAmendment: React.FC<PaymentPlanAmendmentProps> = ({ data, onChange }) => {
    return (
        <Card title="4. Payment Plan Amendment">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Current Plan</label>
                    <div className="text-sm font-semibold text-gray-800 dark:text-white">{data.currentPlan || 'Not Set'}</div>
                </div>
                <Select 
                    id="newPlan" 
                    name="newPlan"
                    label="New Payment Plan" 
                    value={data.newPlan} 
                    onChange={e => onChange('newPlan', e.target.value)}
                >
                    <option value="Outright Payment">Outright Payment</option>
                    <option value="3-Month Installment">3-Month Installment</option>
                    <option value="6-Month Installment">6-Month Installment</option>
                    <option value="12-Month Installment">12-Month Installment</option>
                </Select>
            </div>
        </Card>
    );
};
