import React, { useState } from 'react';
import { Client, Property, Invoice, Staff, ActivityLog } from '../types';
// FIX: SparklesIcon is not in DummyIcons, it needs to be imported from its own file.
import { ArrowLeftIcon, DocumentTextIcon } from '../components/icons/DummyIcons';
import { LoaderIcon } from '../components/icons/LoaderIcon';
import { analyzeAppData } from '../services/geminiService';
import { SparklesIcon } from '../components/icons/SparklesIcon';

interface AnalyticsPageProps {
  onBack: () => void;
  clients: Client[];
  properties: Property[];
  invoices: Invoice[];
  staff: Staff[];
  addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onBack, clients, properties, invoices, staff, addActivityLog }) => {
    const [analysisTopic, setAnalysisTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [report, setReport] = useState('');

    const handleGenerateReport = async () => {
        if (!analysisTopic.trim()) {
            setError('Please enter a topic for the analysis.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const generatedReport = await analyzeAppData(clients, properties, invoices, staff, analysisTopic);
            setReport(generatedReport);
            addActivityLog('View', `Generated an AI analytics report on the topic: "${analysisTopic}".`);
        } catch (e) {
            setError('Failed to generate the AI report. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (format: 'word' | 'excel') => {
        // This is a simulation. In a real app, this would involve a library like docx or xlsx.
        const fileContent = `Report Topic: ${analysisTopic}\n\n${report}`;
        const blob = new Blob([fileContent], { type: format === 'word' ? 'application/msword' : 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Araba_2.0_Report_${analysisTopic.replace(/\s/g, '_')}.${format === 'word' ? 'doc' : 'xls'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addActivityLog('View', `Downloaded AI report on "${analysisTopic}" as a ${format} file.`);
    }

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to CEO Hub
                </button>
                <div className="flex items-center gap-4">
                    <SparklesIcon className="w-10 h-10 text-purple-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Araba 2.0 - AI Analytics Agent</h1>
                        <p className="text-gray-500 mt-1">Generate custom reports and insights from your app data.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Generate a New Report</h2>
                <p className="text-sm text-gray-500 mt-1">What would you like to analyze? (e.g., "Quarterly Sales Performance", "Client Acquisition Trends")</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={analysisTopic}
                        onChange={(e) => setAnalysisTopic(e.target.value)}
                        placeholder="Enter analysis topic..."
                        className="flex-grow w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <button 
                        onClick={handleGenerateReport} 
                        disabled={isLoading}
                        className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                        {isLoading ? 'Analyzing...' : 'Generate Insights'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {report && (
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <h3 className="text-xl font-semibold text-gray-800">Analysis Report: "{analysisTopic}"</h3>
                        <div className="flex gap-2">
                            <button onClick={() => handleDownload('word')} className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 font-semibold py-1 px-3 rounded-md hover:bg-blue-200">
                               <DocumentTextIcon className="w-4 h-4" /> Word
                            </button>
                             <button onClick={() => handleDownload('excel')} className="flex items-center gap-2 text-sm bg-green-100 text-green-700 font-semibold py-1 px-3 rounded-md hover:bg-green-200">
                               <DocumentTextIcon className="w-4 h-4" /> Excel
                            </button>
                        </div>
                    </div>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {report}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;