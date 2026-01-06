
import React from 'react';
import { GeneratedReport, ActivityLog } from '../types';
import { ArrowLeftIcon, DocumentTextIcon } from '../components/icons/DummyIcons';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';

interface AdvancedReportsPageProps {
  onBack: () => void;
  reports: GeneratedReport[];
  addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const AdvancedReportsPage: React.FC<AdvancedReportsPageProps> = ({ onBack, reports, addActivityLog }) => {
    
    const handleDownload = (report: GeneratedReport) => {
        // Simulation of file download
        alert(`Downloading report: ${report.title}`);
        addActivityLog('View', `Downloaded advanced report: "${report.title}".`);
    };

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2 transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
                </button>
                <div className="flex items-center gap-4">
                     <DocumentTextIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Advanced Reports</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Access automatically generated monthly business reports.</p>
                    </div>
                </div>
            </div>

            <TableContainer>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <Thead>
                        <tr>
                            <Th>Report Title</Th>
                            <Th>Type</Th>
                            <Th>Period</Th>
                            <Th>Generated On</Th>
                            <Th className="text-center">Actions</Th>
                        </tr>
                    </Thead>
                    <Tbody>
                        {reports.sort((a,b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()).map(report => (
                            <Tr key={report.id}>
                                <Td className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                    {report.title}
                                </Td>
                                <Td>
                                    <Badge variant="info">
                                        {report.type}
                                    </Badge>
                                </Td>
                                <Td>{report.period}</Td>
                                <Td>{new Date(report.generatedDate).toLocaleDateString()}</Td>
                                <Td className="text-center">
                                    <button 
                                        onClick={() => handleDownload(report)} 
                                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                                    >
                                        Download
                                    </button>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </table>
                {reports.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">No generated reports found.</p>
                    </div>
                )}
            </TableContainer>
        </div>
    );
};

export default AdvancedReportsPage;
