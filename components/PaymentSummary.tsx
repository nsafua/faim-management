import React from 'react';
import { Client } from '../types';

interface PaymentSummaryProps {
  payment: Client['payment'];
}

const formatCurrency = (amount: number) => {
    return `GHC ${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
};

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ payment }) => {
    const paidPercentage = payment.total > 0 ? (payment.paid / payment.total) * 100 : 0;
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
            <div className="space-y-4 text-sm">
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                        className="bg-green-500 h-4 rounded-full" 
                        style={{ width: `${paidPercentage}%` }}
                        role="progressbar"
                        aria-valuenow={paidPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    ></div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Paid</span>
                    <span className="font-semibold text-green-600">{formatCurrency(payment.paid)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Balance</span>
                    <span className="font-semibold text-red-600">{formatCurrency(payment.balance)}</span>
                </div>
                 <hr className="my-2"/>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-bold text-gray-800">{formatCurrency(payment.total)}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <p className="text-gray-500">Next payment due on:</p>
                    <p className="font-bold text-lg text-blue-600">{payment.dueDate}</p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;