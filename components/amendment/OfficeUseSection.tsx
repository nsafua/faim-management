
import React from 'react';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { AmendmentTextArea } from './AmendmentTextArea';
import { AmendmentRequest } from '../../types';

interface OfficeUseSectionProps {
    data: AmendmentRequest['officeUse'];
    onChange: (field: string, value: string | number) => void;
}

export const OfficeUseSection: React.FC<OfficeUseSectionProps> = ({ data, onChange }) => {
    return (
        <Card title="Office Use Only">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <Input 
                    id="approvedBy" 
                    name="approvedBy"
                    label="Approved By (Manager)" 
                    value={data.approvedBy || ''} 
                    onChange={e => onChange('approvedBy', e.target.value)} 
                />
                <Input 
                    id="additionalFees" 
                    name="additionalFees"
                    label="Additional Fees (GHC)" 
                    type="number" 
                    value={data.additionalFees || ''} 
                    onChange={e => onChange('additionalFees', Number(e.target.value))} 
                />
                <Select 
                    id="status" 
                    name="status"
                    label="Status" 
                    value={data.status} 
                    onChange={e => onChange('status', e.target.value)}
                >
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                </Select>
                <div className="sm:col-span-2">
                    <AmendmentTextArea 
                        id="remarks" 
                        name="remarks"
                        label="Remarks / Actions Taken" 
                        value={data.remarks || ''} 
                        onChange={e => onChange('remarks', e.target.value)} 
                    />
                </div>
            </div>
        </Card>
    );
};
