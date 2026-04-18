import React from 'react';
import { Property } from '../../types';
import { 
    ArchiveBoxIcon, 
    ArrowPathIcon,
    ShieldCheckIcon
} from '../icons/DummyIcons';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../ui/Table';

interface ArchiveVaultProps {
    archivedProperties: Property[];
    handleRestoreClick: (prop: Property) => Promise<void>;
}

export const ArchiveVault: React.FC<ArchiveVaultProps> = ({ archivedProperties, handleRestoreClick }) => {
    const formatCurrency = (amount: number) => `GHC ${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <ArchiveBoxIcon className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase">Archive Vault</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Historical and de-listed land assets</p>
                </div>
            </div>

            <TableContainer>
                <table className="w-full text-sm text-left">
                    <Thead>
                        <tr className="bg-amber-50/50 dark:bg-amber-900/10">
                            <Th>Property Location</Th>
                            <Th>Archived On</Th>
                            <Th>Archived By</Th>
                            <Th className="text-right">Last Listed Price</Th>
                            <Th className="text-center">Action</Th>
                        </tr>
                    </Thead>
                    <Tbody>
                        {archivedProperties.length === 0 ? (
                            <Tr>
                                <Td colSpan={5} className="text-center py-20 text-gray-400 italic">
                                    Vault is empty. No archived properties found.
                                </Td>
                            </Tr>
                        ) : (
                            archivedProperties.map(prop => (
                                <Tr key={prop.id}>
                                    <Td className="font-bold text-gray-900 dark:text-white">{prop.location}</Td>
                                    <Td className="font-mono text-xs text-gray-500">{prop.archivedAt ? new Date(prop.archivedAt).toLocaleDateString() : '—'}</Td>
                                    <Td className="text-xs text-gray-600 dark:text-gray-400">{prop.archivedBy || 'System'}</Td>
                                    <Td className="text-right font-black text-gray-400">{formatCurrency(prop.price)}</Td>
                                    <Td className="text-center">
                                        <button 
                                            onClick={() => handleRestoreClick(prop)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-black uppercase text-[10px] rounded-lg hover:bg-green-100 transition-colors border border-green-100 dark:border-green-800"
                                        >
                                            <ArrowPathIcon className="w-3 h-3" />
                                            Restore
                                        </button>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </Tbody>
                </table>
            </TableContainer>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-4">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">Executive Vault Security</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                        Archiving a property hides it from all Sales and Front Desk staff. Restoring a property immediately re-publishes it to the master catalog with its previous inventory settings.
                    </p>
                </div>
            </div>
        </div>
    );
};
