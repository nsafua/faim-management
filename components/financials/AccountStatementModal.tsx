import React, { useState, useMemo } from 'react';
import { Client, Property, PaymentTransaction } from '../../types';
import { XMarkIcon, PrinterIcon, PaperAirplaneIcon, BuildingLibraryIcon, BanknotesIcon, ChartBarIcon } from '../icons/DummyIcons';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useLedgerCalculations } from '../../hooks/useLedgerCalculations';
import { LedgerStatementTable } from './LedgerStatementTable';

interface AccountStatementModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client;
    properties: Property[];
    setActivePage: (page: string, context?: any) => void;
}

export const AccountStatementModal: React.FC<AccountStatementModalProps> = ({ isOpen, onClose, client, properties, setActivePage }) => {
    const { currentStaff } = useAuth();
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(0); d.setDate(1); // Default to Jan 1st
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [includePlots, setIncludePlots] = useState(true);
    const [isMailing, setIsMailing] = useState(false);

    const propertyInfo = useMemo(() => 
        properties.find(p => p.location === client.location)
    , [properties, client.location]);

    // Financial Calculation Logic: Chronological Ledger with specific Land-Sale columns via custom hook
    const statementData = useLedgerCalculations(client, startDate, endDate);

    // Role-Based Action Permissions: Authority Locked to CEO and Chief Accountant only
    const roleId = currentStaff?.roleId || '';
    const isAuthorized = ['CEO', 'Chief Accountant'].includes(roleId);
    
    const canExport = isAuthorized;
    const canMail = isAuthorized;

    const formatCurrency = (amount: number) => `₵${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2 }).format(amount)}`;

    const handlePrint = () => {
        if (!canExport) return;
        
        // Governance: Set document title to control generated PDF filename
        const originalTitle = document.title;
        const dateStamp = new Date().toISOString().split('T')[0];
        const formattedName = client.name.replace(/\s+/g, '_');
        document.title = `Statement_${formattedName}_${client.id}_${dateStamp}`;
        
        window.print();
        
        // Restore title for UI consistency
        document.title = originalTitle;
    };

    const handleSendMail = () => {
        if (!canMail) return;
        setIsMailing(true);
        
        const dateStamp = new Date().toISOString().split('T')[0];
        const filename = `Statement_${client.name.replace(/\s+/g, '_')}_${client.id}_${dateStamp}.pdf`;

        // Redirect to Mailing page with pre-filled state
        setActivePage('Mailing', {
            initialCompose: {
                subject: `Client Statement – ${client.name} (${dateStamp})`,
                body: `Dear Team,\n\nPlease find attached the account statement for ${client.name} for the period ${startDate} to ${endDate}.\n\nTotal Paid: ${formatCurrency(statementData.totalPaidInPeriod)}\nOutstanding Balance: ${formatCurrency(client.payment.balance)}\n\nStatement attached.`,
                attachments: [
                    {
                        name: filename,
                        url: '#system-generated', // Mock URL as we don't have a PDF generation service in this sandbox
                        type: 'application/pdf',
                        size: 102400 // Mock 100KB
                    }
                ]
            }
        });
        
        onClose();
        setIsMailing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/90 z-[100] flex justify-center items-center p-4 backdrop-blur-sm overflow-hidden">
            <Card className="w-full max-w-5xl h-[95vh] p-0 flex flex-col shadow-2xl border-0 overflow-hidden bg-white">
                {/* Query & Action Bar - Hidden in Print */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-4 print:hidden shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs p-1 rounded border border-gray-200" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs p-1 rounded border border-gray-200" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={includePlots} onChange={e => setIncludePlots(e.target.checked)} className="rounded" />
                            <span className="text-xs text-gray-600 font-bold uppercase">Show Plot Details</span>
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={<PrinterIcon className="w-4 h-4" />} 
                            onClick={handlePrint}
                            disabled={!canExport}
                            title={!canExport ? "Insufficient permissions to export" : ""}
                        >
                            Export PDF
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={<PaperAirplaneIcon className="w-4 h-4 -rotate-45" />} 
                            onClick={handleSendMail} 
                            isLoading={isMailing}
                            disabled={!canMail}
                            title={!canMail ? "Insufficient permissions to mail financial docs" : ""}
                        >
                            Internal Mail
                        </Button>
                        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><XMarkIcon className="w-6 h-6" /></button>
                    </div>
                </div>

                {/* THE STATEMENT AREA */}
                <div id="printable-statement" className="flex-grow p-10 overflow-y-auto scrollbar-thin text-slate-900">
                    <div className="max-w-4xl mx-auto space-y-10 min-h-full flex flex-col">
                        
                        {/* I. Header */}
                        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 shrink-0">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <BuildingLibraryIcon className="w-12 h-12 text-slate-900" />
                                    <h1 className="text-3xl font-black tracking-tighter uppercase">FAIM Legacy</h1>
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Real Estate Financial Services</p>
                            </div>
                            <div className="text-right space-y-1">
                                <h2 className="text-xl font-black uppercase tracking-tight">Client Account Statement</h2>
                                <p className="text-xs font-medium">Period: {startDate} — {endDate}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Generated: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* II & III. Client & Property Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 shrink-0">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Client Information</h3>
                                <div className="text-sm">
                                    <p className="font-black text-lg">{client.name}</p>
                                    <p className="text-slate-500 leading-relaxed mt-1">{client.location}</p>
                                    <p className="mt-4 font-mono text-xs text-slate-400">Ref: {client.initials}-{client.id.toString().padStart(4, '0')}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Purchase Overview</h3>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                    <div><p className="text-slate-400">Plots Purchased</p><p className="font-bold">{client.plot.split(',').length} Unit(s)</p></div>
                                    <div><p className="text-slate-400">Location</p><p className="font-bold truncate">{client.location}</p></div>
                                    {includePlots && <div className="col-span-2"><p className="text-slate-400">Assigned Plots</p><p className="font-bold">{client.plot}</p></div>}
                                    <div><p className="text-slate-400">Contract Total</p><p className="font-bold">{formatCurrency(client.payment.total)}</p></div>
                                    <div><p className="text-slate-400">Account Status</p><Badge variant={client.payment.balance <= 0 ? 'success' : 'warning'}>{client.payment.balance <= 0 ? 'COMPLETED' : 'ACTIVE'}</Badge></div>
                                </div>
                            </div>
                        </div>

                        {/* IV. Transactional Ledger */}
                        <div className="space-y-4 shrink-0">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Transaction History (Chronological)</h3>
                            <LedgerStatementTable statementData={statementData} formatCurrency={formatCurrency} />
                        </div>

                        {/* V. Closing Summary */}
                        <div className="pt-10 border-t-4 border-slate-900 flex flex-col md:flex-row justify-between items-start gap-8 shrink-0">
                            <div className="space-y-4 flex-grow">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <ChartBarIcon className="w-5 h-5" />
                                    <h4 className="text-xs font-black uppercase tracking-widest">Period Audit Summary</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Paid in Period</p>
                                        <p className="text-xl font-black text-green-600">{formatCurrency(statementData.totalPaidInPeriod)}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Settled to Date</p>
                                        <p className="text-xl font-black text-slate-900">{formatCurrency(client.payment.paid)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-64 space-y-1 text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Remaining Liability</p>
                                <p className="text-3xl font-black tracking-tighter text-slate-900">{formatCurrency(client.payment.balance)}</p>
                                <p className="text-[10px] font-bold text-slate-400 italic mt-2">Verified as at {endDate}</p>
                            </div>
                        </div>

                        {/* VI. Governance Footer */}
                        <div className="mt-auto pt-16 space-y-6">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
                                <div className="text-left">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">FAIM | Legacy ERP</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Automated Financial Governance Module</p>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-[10px] font-bold text-slate-500 italic">"This statement is system-generated and verified for accuracy."</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-tighter">Generated: {new Date().toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-2 border border-slate-100">
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Document Ref: STMT-{client.id}-{Date.now()}</p>
                                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter">For questions or reconciliation, contact Accounts Department.</p>
                            </div>

                            <div className="text-center opacity-30">
                                <p className="text-[9px] font-bold uppercase tracking-[0.3em]">End of Official Record</p>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @media print {
                        body { background: white !important; }
                        #printable-statement { overflow: visible !important; height: auto !important; padding: 0 !important; color: black !important; }
                        .fixed, .print\\:hidden, .sidebar, .header, nav, button { display: none !important; }
                        #printable-statement .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
                        .border { border: 1px solid #000 !important; }
                        @page { margin: 1.5cm; size: A4; }
                        .mt-auto { margin-top: auto !important; }
                    }
                `}</style>
            </Card>
        </div>
    );
};
