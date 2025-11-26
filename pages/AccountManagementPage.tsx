import React, { useState, useEffect, useMemo } from 'react';
import { Client, Invoice, PaymentTransaction, Installment, ReceiptPattern, ReceiptAlert, Staff } from '../types';
import { 
    FunnelIcon, 
    MagnifyingGlassIcon, 
    DocumentPlusIcon, 
    PencilIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    BanknotesIcon,
    BuildingLibraryIcon,
    UserCircleIcon,
    ChevronRightIcon,
    CalendarDaysIcon,
    CreditCardIcon,
    HashtagIcon,
    ArrowTrendingUpIcon,
    ReceiptPercentIcon
} from '../components/icons/DummyIcons';
import { XIcon } from '../components/icons/XIcon';

interface AccountManagementPageProps {
  clients: Client[];
  onSaveClient: (client: Client) => Promise<Client>;
  onClientSelect: (client: Client) => void;
  invoices: Invoice[];
  onSaveInvoice: (invoice: Invoice) => Promise<void>;
  clientForInvoice: Client | null;
  setClientForInvoice: (client: Client | null) => void;
  receiptPattern: ReceiptPattern | null;
  setReceiptPattern: React.Dispatch<React.SetStateAction<ReceiptPattern | null>>;
  setReceiptAlerts: React.Dispatch<React.SetStateAction<ReceiptAlert[]>>;
  currentStaff: Staff;
}

// Helper function to check if a client's data is filled
const isClientDataComplete = (client: Client): boolean => {
    if (!client) return false;
    // Check main fields
    const personalFields = [client.surname, client.otherNames, client.phone, client.email, client.location, client.plot];
    if (personalFields.some(f => !f || f.trim() === '')) return false;

    // Check nested objects
    const witness = client.witness;
    if (!witness || !witness.name || !witness.address || !witness.phone) return false;

    const nextOfKin = client.nextOfKin;
    if (!nextOfKin || !nextOfKin.name || !nextOfKin.phone || !nextOfKin.relationship) return false;

    const indenture = client.indenture;
    if (!indenture || !indenture.name || !indenture.address) return false;

    const officeUse = client.officeUse;
    if (!officeUse || !officeUse.salesRep || !officeUse.salesManager || !officeUse.accountsHead || !officeUse.clerk) return false;

    // Check for uploaded form
    if (!client.filledFormPdf) return false;
    
    return true;
};

const getStatusColor = (status: Invoice['status'] | string) => {
  switch (status) {
    case 'Paid':
    case 'Success':
    case 'On Time':
       return 'bg-green-100 text-green-700';
    case 'Pending': 
      return 'bg-amber-100 text-amber-700';
    case 'Overdue':
    case 'Failed':
    case 'Late':
      return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const formatCurrency = (amount: number) => `GHC ${new Intl.NumberFormat('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

const RecordPaymentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (payment: Omit<PaymentTransaction, 'id' | 'status'>) => void;
    client: Client;
}> = ({ isOpen, onClose, onSave, client }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<'Cash' | 'Bank Transfer' | 'MoMo' | 'Cheque' | 'Other'>('Bank Transfer');
    const [reference, setReference] = useState('');
    const [receiptNumber, setReceiptNumber] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setMethod('Bank Transfer');
            setReference('');
            setReceiptNumber('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const paidAmount = parseFloat(amount);
        if (isNaN(paidAmount) || paidAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        if (paidAmount > client.payment.balance) {
            setError(`Amount cannot exceed the balance of ${formatCurrency(client.payment.balance)}.`);
            return;
        }
        if (!receiptNumber.trim()) {
            setError('Receipt number is required before saving payment.');
            return;
        }
        setError('');
        onSave({ date, amount: paidAmount, method, reference, receiptNumber });
    };

    if (!isOpen) return null;

    const Input: React.FC<{id: string, label: string, children: React.ReactNode}> = ({ id, label, children }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
            <div className="mt-1">
                {children}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/70 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-5 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-full">
                                <BanknotesIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Record Client Payment</h2>
                                <p className="text-sm text-slate-500">For {client.name}</p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        {error && <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md text-sm">{error}</div>}
                        <Input id="paymentDate" label="Payment Date*">
                            <input type="date" id="paymentDate" value={date} onChange={e => setDate(e.target.value)} className="w-full form-input" required />
                        </Input>
                        <Input id="paymentAmount" label="Amount Paid*">
                            <input type="number" id="paymentAmount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full form-input" placeholder="0.00" required />
                        </Input>
                        <Input id="receiptNumber" label="Receipt Number*">
                            <input type="text" id="receiptNumber" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} className="w-full form-input" required />
                        </Input>
                        <Input id="paymentMethod" label="Payment Method*">
                           <select id="paymentMethod" value={method} onChange={e => setMethod(e.target.value as any)} className="w-full form-select">
                                <option>Bank Transfer</option><option>Cash</option><option>MoMo</option><option>Cheque</option><option>Other</option>
                            </select>
                        </Input>
                         <Input id="paymentReference" label="Notes / Reference (Optional)">
                           <input type="text" id="paymentReference" value={reference} onChange={e => setReference(e.target.value)} className="w-full form-input" />
                        </Input>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t bg-slate-50 rounded-b-lg gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Save Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const InvoiceFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    clients: Client[];
    onSaveClient: (client: Client) => Promise<Client>;
    onSave: (invoice: Invoice, updatedClient?: Client) => void;
    onRecordPayment: (client: Client, paymentData: Omit<PaymentTransaction, 'id' | 'status'>) => void;
    editingInvoice: Invoice | null;
    clientForInvoice: Client | null;
}> = ({ isOpen, onClose, clients, onSaveClient, onSave, onRecordPayment, editingInvoice, clientForInvoice }) => {
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState({
        amount: '',
        dueDate: '',
        status: 'Pending' as Invoice['status'],
    });

    const [paymentOption, setPaymentOption] = useState('Outright');
    const [otherMonths, setOtherMonths] = useState('');
    const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);

    const selectedClient = clients.find(c => c.id === selectedClientId);

     useEffect(() => {
        if (!selectedClient) {
            setCalculatedTotal(null);
            return;
        }

        const P = selectedClient.payment.total;
        const ANNUAL_RATE = 0.10; // 10% annual interest rate
        const r = ANNUAL_RATE / 12;
        let n = 0;
        
        let planType = 'Outright Payment';
        if (paymentOption === '3') { n = 3; planType = '3-Month Installment'; }
        else if (paymentOption === '6') { n = 6; planType = '6-Month Installment'; }
        else if (paymentOption === 'Other' && otherMonths) { n = parseInt(otherMonths, 10); planType = `${n}-Month Installment`; }
        
        if (n > 0 && !isNaN(n) && r > 0 && P > 0 && paymentOption !== 'Outright') {
            const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const totalPayable = emi * n;
            setCalculatedTotal(totalPayable);
        } else {
            setCalculatedTotal(P);
        }
    }, [paymentOption, otherMonths, selectedClient]);


    useEffect(() => {
        if (isOpen) {
            let initialClientId = null;
            if (editingInvoice) {
                initialClientId = editingInvoice.clientId;
                setInvoiceData({ amount: String(editingInvoice.amount), dueDate: editingInvoice.dueDate, status: editingInvoice.status });
            } else if (clientForInvoice) {
                 initialClientId = clientForInvoice.id;
                 setInvoiceData({ amount: '', dueDate: '', status: 'Pending' });
            } else {
                setInvoiceData({ amount: '', dueDate: '', status: 'Pending' });
            }
            setSelectedClientId(initialClientId);
            
            const client = clients.find(c => c.id === initialClientId);
            if(client?.payment.planType) {
                if (client.payment.planType.includes('3-Month')) setPaymentOption('3');
                else if (client.payment.planType.includes('6-Month')) setPaymentOption('6');
                else if (client.payment.planType.includes('Outright')) setPaymentOption('Outright');
                else {
                    setPaymentOption('Other');
                    setOtherMonths(client.payment.planType.split('-')[0] || '');
                }
            } else {
                setPaymentOption('Outright');
                setOtherMonths('');
            }
            setActiveTab('overview');
        }
    }, [editingInvoice, isOpen, clientForInvoice, clients]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setInvoiceData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value ? Number(e.target.value) : null;
        setSelectedClientId(clientId);
        if (!editingInvoice) {
             setInvoiceData({ amount: '', dueDate: '', status: 'Pending' });
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) {
            alert('Please select a client.');
            return;
        }
        
        let planType = 'Outright Payment';
        let n = 0;
        if (paymentOption === '3') { n = 3; planType = '3-Month Installment'; }
        else if (paymentOption === '6') { n = 6; planType = '6-Month Installment'; }
        else if (paymentOption === 'Other' && otherMonths) { n = parseInt(otherMonths, 10); planType = `${n}-Month Installment`; }

        const updatedClient = {
            ...selectedClient,
            payment: {
                ...selectedClient.payment,
                total: calculatedTotal || selectedClient.payment.total,
                balance: (calculatedTotal || selectedClient.payment.total) - selectedClient.payment.paid,
                planType: planType,
                installments: getPaymentSchedule().map((item): Installment => ({
                    id: item.installment,
                    dueDate: item.dueDate,
                    amountDue: item.amount,
                    amountPaid: 0,
                    balance: item.amount,
                    status: 'Pending'
                }))
            }
        };

        const invoiceToSave: Invoice = {
            id: editingInvoice ? editingInvoice.id : `INV-${Date.now()}`,
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            amount: parseFloat(invoiceData.amount) || 0,
            status: invoiceData.status,
            issueDate: editingInvoice ? editingInvoice.issueDate : new Date().toISOString().split('T')[0],
            dueDate: invoiceData.dueDate,
        };

        onSave(invoiceToSave, updatedClient);
    };

    const handleSavePayment = async (paymentData: Omit<PaymentTransaction, 'id' | 'status'>) => {
        if (!selectedClient) return;
        await onRecordPayment(selectedClient, paymentData);
        setPaymentModalOpen(false);
    };

    if (!isOpen) return null;

    let runningBalance = selectedClient ? selectedClient.payment.total : 0;
    const plotCount = selectedClient ? selectedClient.plot.split(',').filter(Boolean).length || 1 : 0;
    const pricePerPlot = selectedClient && plotCount > 0 ? selectedClient.payment.total / plotCount : 0;
    const paymentPercentage = selectedClient ? selectedClient.payment.total > 0 ? (selectedClient.payment.paid / selectedClient.payment.total) * 100 : 0 : 0;
    const isProvisional = paymentPercentage < 70;
    
    const getPaymentSchedule = () => {
        if (!selectedClient || !calculatedTotal) return [];
        let n = 0;
        if (paymentOption === '3') n = 3;
        else if (paymentOption === '6') n = 6;
        else if (paymentOption === 'Other' && otherMonths) n = parseInt(otherMonths, 10);
        if (n <= 0 || isNaN(n) || paymentOption === 'Outright') return [];

        const monthlyPayment = calculatedTotal / n;
        const schedule = [];
        const startDate = new Date(selectedClient.regDate);
        for (let i = 1; i <= n; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);
            schedule.push({ installment: i, dueDate: dueDate.toISOString().split('T')[0], amount: monthlyPayment });
        }
        return schedule;
    };
    const paymentSchedule = getPaymentSchedule();

    const ContentCard: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
        <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
            <h3 className="text-lg font-semibold text-slate-800 p-4 border-b border-slate-200">{title}</h3>
            <div className="p-4">{children}</div>
        </div>
    );
    const InfoRow: React.FC<{ label: string, value: React.ReactNode, isLarge?: boolean }> = ({ label, value, isLarge = false }) => (
        <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
            <dt className="text-sm text-slate-500">{label}</dt>
            <dd className={`text-sm font-semibold text-slate-800 ${isLarge ? 'text-xl' : ''}`}>{value}</dd>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col transform transition-all">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">{editingInvoice ? 'Edit Financial Record' : 'Create & View Financials'}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><XIcon className="w-6 h-6" /></button>
                </div>
                
                {/* Main Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-1/3 xl:w-1/4 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 overflow-y-auto">
                         <div>
                            <label htmlFor="client-select" className="block text-sm font-medium text-slate-700">Client</label>
                            <select id="client-select" value={selectedClientId || ''} onChange={handleClientChange} disabled={!!editingInvoice || !!clientForInvoice} className="w-full form-select disabled:bg-slate-100">
                                <option value="">-- Select a client --</option>
                                {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                            </select>
                        </div>
                        {selectedClient && (
                        <>
                            <div className="text-center mt-2">
                                <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-3xl">
                                    {selectedClient.initials}
                                </div>
                                <h3 className="mt-2 text-lg font-bold text-slate-800">{selectedClient.name}</h3>
                                <p className="text-sm text-slate-500">{selectedClient.location}</p>
                            </div>
                            <div className="space-y-1">
                                {[{key: 'overview', label: 'Overview'}, {key: 'history', label: 'Payment History'}, {key: 'commission', label: 'Commission'}].map(tab => (
                                <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm font-semibold ${activeTab === tab.key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                                    <span>{tab.label}</span><ChevronRightIcon className="w-4 h-4" />
                                </button>
                                ))}
                            </div>
                            <ContentCard title="Financial Summary" className="mt-auto">
                                <InfoRow label="Total Paid" value={<span className="text-green-600">{formatCurrency(selectedClient.payment.paid)}</span>} />
                                <InfoRow label="Balance" value={<span className="text-red-600">{formatCurrency(selectedClient.payment.balance)}</span>} />
                                <InfoRow label="Total Cost" value={<span className="font-bold text-slate-900">{formatCurrency(selectedClient.payment.total)}</span>} />
                            </ContentCard>
                        </>
                        )}
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-grow p-6 overflow-y-auto">
                        {!selectedClient ? (
                             <div className="flex flex-col items-center justify-center h-full text-center">
                                <UserCircleIcon className="w-24 h-24 text-slate-300" />
                                <h3 className="mt-4 text-lg font-semibold text-slate-700">Select a Client</h3>
                                <p className="text-sm text-slate-500">Choose a client from the dropdown to view or manage their financial records.</p>
                            </div>
                        ) : (
                        <div className="space-y-6">
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <ContentCard title="Purchase Details">
                                            <dl><InfoRow label="Property" value={selectedClient.location} /><InfoRow label="Plots" value={plotCount} /><InfoRow label="Price/Plot" value={formatCurrency(pricePerPlot)} /><InfoRow label="Purchase Date" value={selectedClient.regDate} /><InfoRow label="Discount" value={selectedClient.payment.promoDetails || 'N/A'} /><InfoRow label="Total Cost" value={formatCurrency(selectedClient.payment.total)} /></dl>
                                        </ContentCard>
                                        <ContentCard title="Payment Plan">
                                            <div className="space-y-3">
                                                <div>
                                                    <label htmlFor="paymentOption" className="block text-sm font-medium text-slate-700">Installment</label>
                                                    <select id="paymentOption" value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)} className="w-full form-select">
                                                        <option value="Outright">Outright Payment</option><option value="3">3 Months</option><option value="6">6 Months</option><option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                {paymentOption === 'Other' && <input type="number" value={otherMonths} onChange={(e) => setOtherMonths(e.target.value)} className="w-full form-input" placeholder="Number of Months" />}
                                                {calculatedTotal !== null && (
                                                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                                                    <dl><InfoRow label="Original Price" value={formatCurrency(selectedClient.payment.total)} />{calculatedTotal > selectedClient.payment.total && <InfoRow label="Interest (10% p.a.)" value={formatCurrency(calculatedTotal - selectedClient.payment.total)} />}<InfoRow label="New Total" value={<span className="font-bold text-lg text-green-600">{formatCurrency(calculatedTotal)}</span>} />{paymentSchedule.length > 0 && <InfoRow label="Monthly (EMI)" value={formatCurrency(paymentSchedule[0].amount)} />}</dl>
                                                </div>
                                                )}
                                            </div>
                                        </ContentCard>
                                    </div>
                                    <div className="space-y-6">
                                        <div className={`p-4 rounded-lg flex items-start gap-3 ${isProvisional ? 'bg-amber-100 border-amber-200 text-amber-800' : 'bg-green-100 border-green-200 text-green-800'}`}>
                                            {isProvisional ? <ExclamationTriangleIcon className="w-8 h-8 flex-shrink-0 mt-1" /> : <CheckCircleIcon className="w-8 h-8 flex-shrink-0 mt-1" />}
                                            <div>
                                                <h4 className="font-bold">{isProvisional ? 'Provisional Allocation' : 'Confirmed Allocation'}</h4>
                                                <p className="text-sm">{isProvisional ? `Client must pay at least 70% for confirmed allocation. Current progress is ${paymentPercentage.toFixed(1)}%.` : `Client has paid ${paymentPercentage.toFixed(1)}% and qualifies for confirmed allocation.`}</p>
                                            </div>
                                        </div>
                                        <ContentCard title={editingInvoice ? 'Edit Invoice Entry' : 'New Invoice Entry'}>
                                            <div className="space-y-3">
                                                <div>
                                                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700">Amount</label>
                                                    <input type="number" name="amount" id="amount" value={invoiceData.amount} onChange={handleInputChange} className="w-full form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Due Date</label>
                                                    <input type="date" name="dueDate" id="dueDate" value={invoiceData.dueDate} onChange={handleInputChange} className="w-full form-input" />
                                                </div>
                                                <div>
                                                    <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                                                    <select name="status" id="status" value={invoiceData.status} onChange={handleInputChange} className="w-full form-select">
                                                        <option>Pending</option><option>Paid</option><option>Overdue</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setPaymentModalOpen(true)} className="w-full btn-primary mt-4 bg-green-600 hover:bg-green-700">Record a Payment</button>
                                        </ContentCard>
                                    </div>
                                </div>
                            )}

                             {activeTab === 'history' && (
                                <div className="space-y-6">
                                    <ContentCard title="Payment Status Summary">
                                         <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                            <InfoRow label="Installment Plan" value={selectedClient.payment.planType} />
                                            <InfoRow label="Discount / Promo" value={selectedClient.payment.promoDetails || 'N/A'} />
                                         </dl>
                                    </ContentCard>
                                     {selectedClient.payment.installments.length > 0 && (
                                        <ContentCard title="Installment Schedule">
                                            <div className="overflow-x-auto max-h-72">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-slate-50 text-left sticky top-0"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Due</th><th className="px-3 py-2 text-right">Amount Due</th><th className="px-3 py-2 text-right">Paid</th><th className="px-3 py-2 text-right">Balance</th><th className="px-3 py-2 text-center">Status</th></tr></thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {selectedClient.payment.installments.map(inst => (<tr key={inst.id}><td className="px-3 py-2 font-medium">{inst.id}</td><td className="px-3 py-2">{inst.dueDate}</td><td className="px-3 py-2 text-right">{formatCurrency(inst.amountDue)}</td><td className="px-3 py-2 text-right text-green-600">{formatCurrency(inst.amountPaid)}</td><td className="px-3 py-2 text-right font-semibold">{formatCurrency(inst.balance)}</td><td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(inst.status)}`}>{inst.status}</span></td></tr>))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </ContentCard>
                                    )}
                                    <ContentCard title="Transaction History">
                                        <div className="overflow-x-auto max-h-72">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 text-left sticky top-0"><tr><th className="px-3 py-2">Date</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Method</th><th className="px-3 py-2">Receipt #</th><th className="px-3 py-2">Reference</th><th className="px-3 py-2">Status</th></tr></thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {selectedClient.payment.paymentHistory.map(p => (<tr key={p.id}><td className="px-3 py-2">{p.date}</td><td className="px-3 py-2 font-semibold">{formatCurrency(p.amount)}</td><td className="px-3 py-2">{p.method}</td><td className="px-3 py-2 font-mono text-indigo-600">{p.receiptNumber}</td><td className="px-3 py-2 text-slate-500">{p.reference}</td><td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(p.status)}`}>{p.status}</span></td></tr>))}
                                                    {selectedClient.payment.paymentHistory.length === 0 && (<tr><td colSpan={6} className="text-center p-6 text-slate-500">No payment history found.</td></tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </ContentCard>
                                </div>
                            )}

                            {activeTab === 'commission' && (
                                <ContentCard title="Sales & Commission Details">
                                    <dl>
                                        <InfoRow label="Sales Rep" value={selectedClient.officeUse.salesRep} />
                                        <InfoRow label="Commission Type" value={selectedClient.officeUse.commission.type} />
                                        <InfoRow label="Amount" value={formatCurrency(selectedClient.officeUse.commission.amount)} />
                                        <InfoRow label="Status" value={<span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedClient.officeUse.commission.status)}`}>{selectedClient.officeUse.commission.status}</span>} />
                                        {selectedClient.officeUse.commission.paymentDate && <InfoRow label="Paid Date" value={selectedClient.officeUse.commission.paymentDate} />}
                                    </dl>
                                    <div className="mt-6">
                                        <button type="button" className="btn-primary bg-green-600 hover:bg-green-700 disabled:bg-slate-400" disabled={selectedClient.officeUse.commission.status === 'Paid'}>
                                            Mark as Paid
                                        </button>
                                    </div>
                                </ContentCard>
                            )}
                        </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-4 border-t border-slate-200 bg-white/50 backdrop-blur-sm rounded-b-xl flex-shrink-0 gap-3">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleFormSubmit} className="btn-primary" disabled={!selectedClient}>Save Record</button>
                </div>
            </div>
             {selectedClient && <RecordPaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} onSave={handleSavePayment} client={selectedClient}/>}
        </div>
    );
};

const AccountManagementPage: React.FC<AccountManagementPageProps> = ({ invoices, clients, onSaveClient, onSaveInvoice, clientForInvoice, setClientForInvoice, receiptPattern, setReceiptPattern, setReceiptAlerts, currentStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (clientForInvoice) {
        setEditingInvoice(null);
        setIsModalOpen(true);
    }
  }, [clientForInvoice]);
  
  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setClientForInvoice(null);
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setClientForInvoice(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingInvoice(null);
      if (clientForInvoice) {
          setClientForInvoice(null);
      }
  };
  
  const handleSaveInvoice = async (invoiceToSave: Invoice, updatedClientData?: Client) => {
    if (updatedClientData) {
        const hasInvoice = invoices.some(inv => inv.clientId === updatedClientData!.id) || invoiceToSave.amount > 0;
        const dataIsComplete = isClientDataComplete(updatedClientData);
        updatedClientData.isComplete = dataIsComplete && hasInvoice;
        await onSaveClient(updatedClientData);
    }
    
    if (invoiceToSave.amount > 0 || editingInvoice) {
        await onSaveInvoice(invoiceToSave);
    }
    
    handleCloseModal();
  };
    
  const handleRecordPayment = async (client: Client, paymentData: Omit<PaymentTransaction, 'id' | 'status'>) => {
    const newReceipt = paymentData.receiptNumber;
    const match = newReceipt.match(/^([a-zA-Z]*)(\d+)$/);

    if (!match) {
        alert("Invalid receipt format. Must be a prefix followed by numbers (e.g., RCPT101).");
        return;
    } 
    
    const [, prefix, numStr] = match;
    const number = parseInt(numStr, 10);

    if (!receiptPattern) {
        setReceiptPattern({ prefix, lastNumber: number, minLength: numStr.length });
    } else {
        let inconsistent = false;
        let alertDetails = '';
        if (prefix !== receiptPattern.prefix) {
            inconsistent = true;
            alertDetails = `Prefix mismatch. Expected '${receiptPattern.prefix}', got '${prefix}'.`;
        } else if (number !== receiptPattern.lastNumber + 1) {
            inconsistent = true;
            alertDetails = `Sequence break. Expected ${receiptPattern.lastNumber + 1}, got ${number}.`;
        }

        if (inconsistent) {
            const alertMsg = `Warning: This receipt number (${newReceipt}) appears inconsistent with previous entries.\n\nDetails: ${alertDetails}\n\nAn alert has been sent to the CEO.`;
            alert(alertMsg);

            const ceoAlert = `Subject: Suspicious Receipt Number Alert\n\nDear CEO,\nA new receipt number entry appears inconsistent with existing patterns.\n\nDetails:\n- Suspicious Receipt Number: ${newReceipt}\n- Client: ${client.name}\n- Entered By: ${currentStaff.fullName}\n- Date: ${new Date().toISOString()}\n- Amount: ${formatCurrency(paymentData.amount)}\n- Previous Sequence: ${receiptPattern.prefix}${receiptPattern.lastNumber}\n\nPlease verify the source of this entry.\n– Automated FAIM Accounting Monitor`;
            console.warn("CEO NOTIFICATION:", ceoAlert);
            
            const newAlert: ReceiptAlert = { id: Date.now(), clientId: client.id, enteredBy: currentStaff.fullName, suspiciousNumber: newReceipt, date: new Date().toISOString(), details: alertDetails };
            setReceiptAlerts(prev => [...prev, newAlert]);
        }
        setReceiptPattern(prev => ({ ...prev!, lastNumber: number }));
    }

    const newTransaction: PaymentTransaction = { ...paymentData, id: `TXN-${Date.now()}`, status: 'Success' };
    const updatedClient = {
        ...client,
        payment: {
            ...client.payment,
            paymentHistory: [...client.payment.paymentHistory, newTransaction],
            paid: client.payment.paid + newTransaction.amount,
            balance: client.payment.balance - newTransaction.amount,
        }
    };
    
    await onSaveClient(updatedClient);
    alert(`Payment and receipt ${paymentData.receiptNumber} saved successfully.`);
};

  return (
    <div className="space-y-6">
        <style>{`
            .btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed; }
            .btn-secondary { @apply bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors; }
            .form-input, .form-select { 
                @apply block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 sm:text-sm; 
                @apply focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500;
            }
        `}</style>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Account Management</h1>
            <p className="text-slate-500 mt-1">Track invoices, payments, and client account statuses.</p>
        </div>
        <button onClick={handleCreateInvoice} className="btn-primary flex items-center gap-2">
            <DocumentPlusIcon className="w-5 h-5" />
            Create Financial Record
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4 justify-between items-center">
        <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
              type="text"
              placeholder="Search by invoice ID or client name..."
              className="form-input pl-10 w-full"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" /> Filter
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Invoice ID</th>
                    <th scope="col" className="px-6 py-3">Client</th>
                    <th scope="col" className="px-6 py-3">Amount</th>
                    <th scope="col" className="px-6 py-3">Issue Date</th>
                    <th scope="col" className="px-6 py-3">Due Date</th>
                    <th scope="col" className="px-6 py-3 text-center">Status</th>
                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {invoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-indigo-600 whitespace-nowrap">
                            {invoice.id}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                            {invoice.clientName}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                            {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-6 py-4">{invoice.issueDate}</td>
                        <td className="px-6 py-4">{invoice.dueDate}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button onClick={() => handleEditInvoice(invoice)} className="text-slate-500 hover:text-indigo-600 p-1 rounded-full hover:bg-slate-100">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {invoices.length === 0 && (
            <div className="text-center py-10">
                <p className="text-slate-500">No invoices found.</p>
            </div>
        )}
      </div>
      <InvoiceFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        clients={clients}
        onSaveClient={onSaveClient}
        onSave={handleSaveInvoice}
        onRecordPayment={handleRecordPayment}
        editingInvoice={editingInvoice}
        clientForInvoice={clientForInvoice}
      />
    </div>
  );
};

export default AccountManagementPage;