import React from 'react';
import { GeneratedReport, ActivityLog } from '../types';
import { ArrowLeftIcon, DocumentTextIcon, CalendarDaysIcon } from '../components/icons/DummyIcons';

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
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
                </button>
                <div className="flex items-center gap-4">
                     <DocumentTextIcon className="w-10 h-10 text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Advanced Reports</h1>
                        <p className="text-gray-500 mt-1">Access automatically generated monthly business reports.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Report Title</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Period</th>
                            <th scope="col" className="px-6 py-3">Generated On</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {reports.sort((a,b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()).map(report => (
                            <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {report.title}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                        {report.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{report.period}</td>
                                <td className="px-6 py-4">{new Date(report.generatedDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleDownload(report)} 
                                        className="font-medium text-blue-600 hover:underline"
                                    >
                                        Download
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reports.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No generated reports found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedReportsPage;