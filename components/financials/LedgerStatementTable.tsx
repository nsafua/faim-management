import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../../components/ui/Table';

interface LedgerStatementTableProps {
    statementData: {
        ledgerEntries: any[];
        totalPaidInPeriod: number;
        closingBalance: number;
    };
    formatCurrency: (amount: number) => string;
}

export const LedgerStatementTable: React.FC<LedgerStatementTableProps> = ({ statementData, formatCurrency }) => {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid': return <Badge variant="success">Paid</Badge>;
            case 'Partial': return <Badge variant="warning">Partial</Badge>;
            case 'Overdue': return <Badge variant="danger">Overdue</Badge>;
            case 'Advance': return <Badge variant="purple">Advance</Badge>;
            default: return <Badge variant="neutral">{status}</Badge>;
        }
    };

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden overflow-y-auto max-h-[400px] scrollbar-thin">
            <table className="w-full text-xs text-left border-collapse">
                <Thead>
                    <tr className="bg-slate-50 text-slate-600 font-black uppercase tracking-tighter sticky top-0 z-10 border-b border-slate-200">
                        <Th className="px-4 py-3">Type</Th>
                        <Th className="px-4 py-3">Expected Date</Th>
                        <Th className="px-4 py-3">Actual Date</Th>
                        <Th className="px-4 py-3 text-right">Amount Paid</Th>
                        <Th className="px-4 py-3 text-center">Status</Th>
                        <Th className="px-4 py-3 text-right">Balance Outstanding</Th>
                    </tr>
                </Thead>
                <Tbody>
                    {statementData.ledgerEntries.map((entry: any, idx: number) => (
                        <Tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                            <Td className="px-4 py-4 font-bold">{entry.type}</Td>
                            <Td className="px-4 py-4 font-mono text-slate-500">{entry.expectedDate}</Td>
                            <Td className="px-4 py-4 font-mono">{entry.actualDate || '—'}</Td>
                            <Td className={`px-4 py-4 text-right font-black ${entry.amount > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                {formatCurrency(entry.amount)}
                            </Td>
                            <Td className="px-4 py-4 text-center">
                                {getStatusBadge(entry.status)}
                            </Td>
                            <Td className="px-4 py-4 text-right font-black text-blue-600">{formatCurrency(entry.balance)}</Td>
                        </Tr>
                    ))}
                    {statementData.ledgerEntries.length === 0 && (
                        <Tr>
                            <Td colSpan={6} className="px-4 py-16 text-center text-slate-400 italic">
                                System Audit: No financial transactions found for this account.
                            </Td>
                        </Tr>
                    )}
                </Tbody>
            </table>
        </div>
    );
};
