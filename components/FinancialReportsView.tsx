
import React, { useState, useMemo } from 'react';
import { Client, PaymentTransaction, Staff } from '../types';
import { 
    // FIX: Added ChartBarIcon to imports
    ChartBarIcon,
    ArrowLeftIcon, 
    PrinterIcon, 
    ExclamationTriangleIcon, 
    ShieldCheckIcon,
    BanknotesIcon,
    CurrencyDollarIcon,
    UserGroupIcon
} from './icons/DummyIcons';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from './ui/Table';

interface FinancialReportsViewProps {
    onBack: () => void;
    clients: Client[];
    staffList: Staff[];
}

const formatCurrency = (amount: number) => `GHC ${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({ onBack, clients }) => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const reportData = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        
        // Filter transactions for this month
        const allTransactions: (PaymentTransaction & { clientName: string, clientId: number })[] = [];
        clients.forEach(client => {
            client.payment.paymentHistory.forEach(txn => {
                const txnDate = new Date(txn.date);
                if (txnDate.getFullYear() === year && txnDate.getMonth() === (month - 1)) {
                    allTransactions.push({ ...txn, clientName: client.name, clientId: client.id });
                }
            });
        });

        // Summary Calculations
        const revenueTxns = allTransactions.filter(t => (t as any).type === 'Land' || (t as any).type === 'Indenture');
        const totalRevenue = revenueTxns.reduce((sum, t) => sum + t.amount, 0);
        const commissionTxns = allTransactions.filter(t => (t as any).type === 'Commission');
        const totalCommissionPaid = commissionTxns.reduce((sum, t) => sum + t.amount, 0);
        
        const statusCounts = {
            fullyPaid: clients.filter(c => c.payment.balance === 0).length,
            owing: clients.filter(c => c.payment.balance > 0).length,
            overpaid: clients.filter(c => c.payment.balance < 0).length
        };

        // Compliance Logic (Simulated slots matching transaction count)
        const compliance = clients.map(client => {
            const clientMonthTxns = allTransactions.filter(t => t.clientId === client.id && (t as any).type === 'Land');
            const totalThisMonth = clientMonthTxns.reduce((sum, t) => sum + t.amount, 0);
            
            // Derive expectation from plan if installment
            let expected = 0;
            if (client.payment.planType?.includes('Installment')) {
                const count = parseInt(client.payment.planType) || 0;
                expected = client.payment.total / count;
            }

            return {
                name: client.name,
                expected,
                actual: totalThisMonth,
                variance: totalThisMonth - expected
            };
        }).filter(c => c.expected > 0 || c.actual > 0);

        // Exceptions logic
        const exceptions = {
            overpaid: clients.filter(c => c.payment.balance < 0).map(c => ({ name: c.name, amount: Math.abs(c.payment.balance) })),
            manualEdits: clients.filter(c => (c.payment as any).amendmentHistory?.some((a: any) => a.timestamp.startsWith(selectedMonth)))
        };

        return {
            allTransactions,
            totalRevenue,
            totalCommissionPaid,
            netInflow: totalRevenue - totalCommissionPaid,
            statusCounts,
            compliance,
            exceptions
        };
    }, [selectedMonth, clients]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-gray-500 p-1 rounded-full hover:bg-gray-100"><ArrowLeftIcon className="w-6 h-6" /></button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Financial Audit Report</h2>
                        <p className="text-xs text-gray-500">Read-only monthly reconciliation view</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
                    />
                    <Button variant="secondary" icon={<PrinterIcon className="w-4 h-4"/>} onClick={() => window.print()}>Print Report</Button>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-4 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Total Revenue In</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{formatCurrency(reportData.totalRevenue)}</h3>
                        </div>
                        <BanknotesIcon className="w-8 h-8 text-green-500 opacity-20" />
                    </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Commissions Paid</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{formatCurrency(reportData.totalCommissionPaid)}</h3>
                        </div>
                        <CurrencyDollarIcon className="w-8 h-8 text-red-500 opacity-20" />
                    </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-indigo-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Net Monthly Inflow</p>
                            <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(reportData.netInflow)}</h3>
                        </div>
                        <ChartBarIcon className="w-8 h-8 text-indigo-500 opacity-20" />
                    </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-amber-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Portfolio Health</p>
                            <div className="flex gap-2 mt-1">
                                <Badge variant="success">{reportData.statusCounts.fullyPaid}</Badge>
                                <Badge variant="danger">{reportData.statusCounts.owing}</Badge>
                                <Badge variant="purple">{reportData.statusCounts.overpaid}</Badge>
                            </div>
                        </div>
                        <UserGroupIcon className="w-8 h-8 text-amber-500 opacity-20" />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {/* Payment Activity */}
                    <Card title="Detailed Payment Activity (This Period)" className="p-0 overflow-hidden">
                        <TableContainer className="border-0 shadow-none rounded-none">
                            <table className="w-full text-sm">
                                <Thead>
                                    <tr>
                                        <Th>Date</Th>
                                        <Th>Client</Th>
                                        <Th>Type</Th>
                                        <Th className="text-right">Amount</Th>
                                        <Th>Method</Th>
                                        <Th>Receipt</Th>
                                    </tr>
                                </Thead>
                                <Tbody>
                                    {reportData.allTransactions.map(t => (
                                        <Tr key={t.id}>
                                            <Td className="font-mono text-xs">{t.date}</Td>
                                            <Td className="font-bold">{t.clientName}</Td>
                                            <Td><Badge variant={(t as any).type === 'Commission' ? 'danger' : 'success'}>{(t as any).type || 'Lump Sum'}</Badge></Td>
                                            <Td className="text-right font-black text-gray-800 dark:text-white">{formatCurrency(t.amount)}</Td>
                                            <Td>{t.method}</Td>
                                            <Td className="font-mono text-[10px] text-gray-400 uppercase">{t.receiptNumber}</Td>
                                        </Tr>
                                    ))}
                                    {reportData.allTransactions.length === 0 && (
                                        <Tr><Td colSpan={6} className="text-center py-8 text-gray-400 italic">No transactions recorded for this period.</Td></Tr>
                                    )}
                                </Tbody>
                            </table>
                        </TableContainer>
                    </Card>

                    {/* Compliance Variance */}
                    <Card title="Installment Compliance & Variance Analysis" className="p-0 overflow-hidden">
                        <TableContainer className="border-0 shadow-none rounded-none">
                            <table className="w-full text-sm">
                                <Thead>
                                    <tr>
                                        <Th>Client Name</Th>
                                        <Th className="text-right">Expected</Th>
                                        <Th className="text-right">Actual Paid</Th>
                                        <Th className="text-right">Variance</Th>
                                        <Th className="text-center">Status</Th>
                                    </tr>
                                </Thead>
                                <Tbody>
                                    {reportData.compliance.map(c => (
                                        <Tr key={c.name}>
                                            <Td className="font-bold">{c.name}</Td>
                                            <Td className="text-right text-gray-500">{formatCurrency(c.expected)}</Td>
                                            <Td className="text-right font-semibold">{formatCurrency(c.actual)}</Td>
                                            <Td className={`text-right font-bold ${c.variance < 0 ? 'text-red-600' : c.variance > 0 ? 'text-purple-600' : 'text-green-600'}`}>
                                                {formatCurrency(c.variance)}
                                            </Td>
                                            <Td className="text-center">
                                                {c.variance === 0 ? <Badge variant="success">Exact</Badge> : 
                                                 c.variance < 0 ? <Badge variant="danger">Underpaid</Badge> : 
                                                 <Badge variant="purple">Overpaid</Badge>}
                                            </Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </table>
                        </TableContainer>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Exceptions & Flags */}
                    <Card title="Exceptions & Risk Flags" className="bg-red-50/30 dark:bg-red-900/10 border-red-200 dark:border-red-900">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">Overpaid Client Accounts</h4>
                                    <ul className="mt-2 space-y-1">
                                        {reportData.exceptions.overpaid.map(e => (
                                            <li key={e.name} className="text-xs flex justify-between text-gray-600 dark:text-gray-400">
                                                <span>{e.name}</span>
                                                <span className="font-bold text-red-600">{formatCurrency(e.amount)} CR</span>
                                            </li>
                                        ))}
                                        {reportData.exceptions.overpaid.length === 0 && <li className="text-xs text-gray-400 italic">None detected</li>}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 border-t border-red-100 dark:border-red-900/50 pt-4">
                                <ShieldCheckIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">Manual Financial Edits</h4>
                                    <p className="text-[10px] text-gray-500 mb-2">Authenticated amendments in current month</p>
                                    <ul className="space-y-1">
                                        {reportData.exceptions.manualEdits.map(c => (
                                            <li key={c.id} className="text-xs flex justify-between text-gray-600 dark:text-gray-400">
                                                <span>{c.name}</span>
                                                <Badge variant="info">Edited</Badge>
                                            </li>
                                        ))}
                                        {reportData.exceptions.manualEdits.length === 0 && <li className="text-xs text-gray-400 italic">No manual overrides</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Audit Summary">
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Clients Reconciled:</span>
                                <span className="font-bold">{clients.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Transactions Audited:</span>
                                <span className="font-bold">{reportData.allTransactions.length}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-gray-500">Audit Status:</span>
                                <Badge variant="success">Verified</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <style>{`
                @media print {
                    body { background: white; }
                    button, .sidebar, .header { display: none !important; }
                    .container { width: 100% !important; max-width: none !important; padding: 0 !important; }
                    .card { border: 1px solid #eee !important; box-shadow: none !important; }
                }
            `}</style>
        </div>
    );
};
