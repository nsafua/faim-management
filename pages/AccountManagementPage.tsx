
import React, { useState, useEffect } from 'react';
import { Client, Invoice, PaymentTransaction, Installment, ReceiptPattern, ReceiptAlert, Staff } from '../types';
import { 
    FunnelIcon, 
    MagnifyingGlassIcon, 
    DocumentPlusIcon, 
    PencilIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    BanknotesIcon,
    UserCircleIcon,
    ChevronRightIcon
} from '../components/icons/DummyIcons';
import { XIcon } from '../components/icons/XIcon';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';

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

const getStatusBadge = (status: Invoice['status'] | string) => {
  let variant: 'success' | 'warning' | 'danger' | 'neutral' = 'neutral';
  switch (status) {
    case 'Paid': case 'Success': case 'On Time': variant = 'success'; break;
    case 'Pending': variant = 'warning'; break;
    case 'Overdue': case 'Failed': case 'Late': variant = 'danger'; break;
  }
  return <Badge variant={variant}>{status}</Badge>;
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

    return (
        <div className="fixed inset-0 bg-slate-900/70 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                                <BanknotesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Record Payment</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">For {client.name}</p>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {error && <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md text-sm dark:bg-red-900 dark:border-red-800 dark:text-red-200">{error}</div>}
                        <Input id="paymentDate" label="Payment Date*" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        <Input id="paymentAmount" label="Amount Paid*" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" required />
                        <Input id="receiptNumber" label="Receipt Number*" type="text" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} required />
                        <Select id="paymentMethod" label="Payment Method*" value={method} onChange={e => setMethod(e.target.value as any)}>
                            <option>Bank Transfer</option><option>Cash</option><option>MoMo</option><option>Cheque</option><option>Other</option>
                        </Select>
                        <Input id="paymentReference" label="Notes / Reference (Optional)" type="text" value={reference} onChange={e => setReference(e.target.value)} />
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Payment</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const InvoiceFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    clients: Client[];
    onSave: (invoice: Invoice, updatedClient?: Client) => void;
    onRecordPayment: (client: Client, paymentData: Omit<PaymentTransaction, 'id' | 'status'>) => void;
    editingInvoice: Invoice | null;
    clientForInvoice: Client | null;
}> = ({ isOpen, onClose, clients, onSave, onRecordPayment, editingInvoice, clientForInvoice }) => {
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

    const InfoRow: React.FC<{ label: string, value: React.ReactNode, isLarge?: boolean }> = ({ label, value, isLarge = false }) => (
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
            <dd className={`text-sm font-semibold text-gray-800 dark:text-gray-200 ${isLarge ? 'text-xl' : ''}`}>{value}</dd>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <Card className="w-full max-w-6xl max-h-[95vh] flex flex-col p-0 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{editingInvoice ? 'Edit Financial Record' : 'Create & View Financials'}</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><XIcon className="w-6 h-6" /></button>
                </div>
                
                {/* Main Content */}
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    {/* Left Sidebar - Stacks on top on mobile, sits left on desktop */}
                    <div className="w-full md:w-1/3 xl:w-1/4 h-auto max-h-[35vh] md:max-h-full md:h-auto bg-white dark:bg-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
                         <Select label="Client" value={selectedClientId || ''} onChange={handleClientChange} disabled={!!editingInvoice || !!clientForInvoice}>
                            <option value="">-- Select a client --</option>
                            {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                        </Select>
                        {selectedClient && (
                        <>
                            <div className="text-center mt-2 flex md:block items-center gap-4 md:gap-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-2xl md:text-3xl">
                                    {selectedClient.initials}
                                </div>
                                <div className="text-left md:text-center">
                                    <h3 className="mt-0 md:mt-2 text-lg font-bold text-gray-800 dark:text-white">{selectedClient.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClient.location}</p>
                                </div>
                            </div>
                            <div className="flex md:block gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:space-y-1">
                                {[{key: 'overview', label: 'Overview'}, {key: 'history', label: 'History'}, {key: 'commission', label: 'Commission'}].map(tab => (
                                <button type="button" key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-shrink-0 md:w-full text-left flex items-center justify-between p-2 rounded-md text-sm font-semibold transition-colors ${activeTab === tab.key ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'} border md:border-none border-gray-200 dark:border-gray-700`}>
                                    <span>{tab.label}</span><ChevronRightIcon className="hidden md:block w-4 h-4" />
                                </button>
                                ))}
                            </div>
                            <Card title="Financial Summary" className="hidden md:flex flex-col mt-auto bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                <InfoRow label="Total Paid" value={<span className="text-green-600 dark:text-green-400">{formatCurrency(selectedClient.payment.paid)}</span>} />
                                <InfoRow label="Balance" value={<span className="text-red-600 dark:text-red-400">{formatCurrency(selectedClient.payment.balance)}</span>} />
                                <InfoRow label="Total Cost" value={<span className="font-bold text-gray-900 dark:text-white">{formatCurrency(selectedClient.payment.total)}</span>} />
                            </Card>
                        </>
                        )}
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-grow w-full md:w-2/3 xl:w-3/4 p-4 md:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        {!selectedClient ? (
                             <div className="flex flex-col items-center justify-center h-full text-center py-10 md:py-0">
                                <UserCircleIcon className="w-24 h-24 text-gray-300 dark:text-gray-600" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Select a Client</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-500">Choose a client from the dropdown to view or manage their financial records.</p>
                            </div>
                        ) : (
                        <div className="space-y-6">
                            {/* Mobile only financial summary */}
                            <div className="md:hidden bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Summary</h4>
                                <dl className="grid grid-cols-2 gap-4">
                                    <div><dt className="text-xs text-gray-500">Total Paid</dt><dd className="text-sm font-semibold text-green-600">{formatCurrency(selectedClient.payment.paid)}</dd></div>
                                    <div><dt className="text-xs text-gray-500">Balance</dt><dd className="text-sm font-semibold text-red-600">{formatCurrency(selectedClient.payment.balance)}</dd></div>
                                </dl>
                            </div>

                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <Card title="Purchase Details">
                                            <dl><InfoRow label="Property" value={selectedClient.location} /><InfoRow label="Plots" value={plotCount} /><InfoRow label="Price/Plot" value={formatCurrency(pricePerPlot)} /><InfoRow label="Purchase Date" value={selectedClient.regDate} /><InfoRow label="Discount" value={selectedClient.payment.promoDetails || 'N/A'} /><InfoRow label="Total Cost" value={formatCurrency(selectedClient.payment.total)} /></dl>
                                        </Card>
                                        <Card title="Payment Plan">
                                            <div className="space-y-3">
                                                <Select label="Installment" value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)}>
                                                    <option value="Outright">Outright Payment</option><option value="3">3 Months</option><option value="6">6 Months</option><option value="Other">Other</option>
                                                </Select>
                                                {paymentOption === 'Other' && <Input type="number" value={otherMonths} onChange={(e) => setOtherMonths(e.target.value)} placeholder="Number of Months" />}
                                                {calculatedTotal !== null && (
                                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
                                                    <dl><InfoRow label="Original Price" value={formatCurrency(selectedClient.payment.total)} />{calculatedTotal > selectedClient.payment.total && <InfoRow label="Interest (10% p.a.)" value={formatCurrency(calculatedTotal - selectedClient.payment.total)} />}<InfoRow label="New Total" value={<span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(calculatedTotal)}</span>} />{paymentSchedule.length > 0 && <InfoRow label="Monthly (EMI)" value={formatCurrency(paymentSchedule[0].amount)} />}</dl>
                                                </div>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                    <div className="space-y-6">
                                        <div className={`p-4 rounded-lg flex items-start gap-3 ${isProvisional ? 'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200' : 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200'}`}>
                                            {isProvisional ? <ExclamationTriangleIcon className="w-8 h-8 flex-shrink-0 mt-1" /> : <CheckCircleIcon className="w-8 h-8 flex-shrink-0 mt-1" />}
                                            <div>
                                                <h4 className="font-bold">{isProvisional ? 'Provisional Allocation' : 'Confirmed Allocation'}</h4>
                                                <p className="text-sm">{isProvisional ? `Client must pay at least 70% for confirmed allocation. Current progress is ${paymentPercentage.toFixed(1)}%.` : `Client has paid ${paymentPercentage.toFixed(1)}% and qualifies for confirmed allocation.`}</p>
                                            </div>
                                        </div>
                                        <Card title={editingInvoice ? 'Edit Invoice Entry' : 'New Invoice Entry'}>
                                            <div className="space-y-3">
                                                <Input label="Amount" type="number" name="amount" value={invoiceData.amount} onChange={handleInputChange} />
                                                <Input label="Due Date" type="date" name="dueDate" value={invoiceData.dueDate} onChange={handleInputChange} />
                                                <Select label="Status" name="status" value={invoiceData.status} onChange={handleInputChange}>
                                                    <option>Pending</option><option>Paid</option><option>Overdue</option>
                                                </Select>
                                            </div>
                                            <Button type="button" onClick={() => setPaymentModalOpen(true)} className="w-full mt-4" variant="success">Record a Payment</Button>
                                        </Card>
                                    </div>
                                </div>
                            )}

                             {activeTab === 'history' && (
                                <div className="space-y-6">
                                    <Card title="Payment Status Summary">
                                         <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                            <InfoRow label="Installment Plan" value={selectedClient.payment.planType} />
                                            <InfoRow label="Discount / Promo" value={selectedClient.payment.promoDetails || 'N/A'} />
                                         </dl>
                                    </Card>
                                     {selectedClient.payment.installments.length > 0 && (
                                        <Card title="Installment Schedule" className="p-0">
                                            <div className="overflow-x-auto max-h-72">
                                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0"><tr><th className="px-6 py-3">#</th><th className="px-6 py-3">Due</th><th className="px-6 py-3 text-right">Amount Due</th><th className="px-6 py-3 text-right">Paid</th><th className="px-6 py-3 text-right">Balance</th><th className="px-6 py-3 text-center">Status</th></tr></thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                                                        {selectedClient.payment.installments.map(inst => (<tr key={inst.id}><td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{inst.id}</td><td className="px-6 py-3 text-gray-600 dark:text-gray-300">{inst.dueDate}</td><td className="px-6 py-3 text-right text-gray-600 dark:text-gray-300">{formatCurrency(inst.amountDue)}</td><td className="px-6 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(inst.amountPaid)}</td><td className="px-6 py-3 text-right font-semibold text-gray-800 dark:text-white">{formatCurrency(inst.balance)}</td><td className="px-6 py-3 text-center">{getStatusBadge(inst.status)}</td></tr>))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Card>
                                    )}
                                    <Card title="Transaction History" className="p-0">
                                        <div className="overflow-x-auto max-h-72">
                                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0"><tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Method</th><th className="px-6 py-3">Receipt #</th><th className="px-6 py-3">Reference</th><th className="px-6 py-3 text-center">Status</th></tr></thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                                                    {selectedClient.payment.paymentHistory.map(p => (<tr key={p.id}><td className="px-6 py-3 text-gray-600 dark:text-gray-300">{p.date}</td><td className="px-6 py-3 font-semibold text-gray-800 dark:text-white">{formatCurrency(p.amount)}</td><td className="px-6 py-3 text-gray-600 dark:text-gray-300">{p.method}</td><td className="px-6 py-3 font-mono text-indigo-600 dark:text-indigo-400">{p.receiptNumber}</td><td className="px-6 py-3 text-gray-500 dark:text-gray-400">{p.reference}</td><td className="px-6 py-3 text-center">{getStatusBadge(p.status)}</td></tr>))}
                                                    {selectedClient.payment.paymentHistory.length === 0 && (<tr><td colSpan={6} className="text-center p-6 text-gray-500 dark:text-gray-400">No payment history found.</td></tr>)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'commission' && (
                                <Card title="Sales & Commission Details">
                                    <dl>
                                        <InfoRow label="Sales Rep" value={selectedClient.officeUse.salesRep} />
                                        <InfoRow label="Commission Type" value={selectedClient.officeUse.commission.type} />
                                        <InfoRow label="Amount" value={formatCurrency(selectedClient.officeUse.commission.amount)} />
                                        <InfoRow label="Status" value={getStatusBadge(selectedClient.officeUse.commission.status)} />
                                        {selectedClient.officeUse.commission.paymentDate && <InfoRow label="Paid Date" value={selectedClient.officeUse.commission.paymentDate} />}
                                    </dl>
                                    <div className="mt-6">
                                        <Button disabled={selectedClient.officeUse.commission.status === 'Paid'} variant="success">
                                            Mark as Paid
                                        </Button>
                                    </div>
                                </Card>
                            )}
                        </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl flex-shrink-0 gap-3">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleFormSubmit} disabled={!selectedClient}>Save Record</Button>
                </div>
            </Card>
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
        const dataIsComplete = updatedClientData && true; // check complete function
        updatedClientData.isComplete = dataIsComplete && hasInvoice;
        await onSaveClient(updatedClientData);
    }
    
    if (invoiceToSave.amount > 0 || editingInvoice) {
        await onSaveInvoice(invoiceToSave);
    }
    
    handleCloseModal();
  };
    
  const handleRecordPayment = async (client: Client, paymentData: Omit<PaymentTransaction, 'id' | 'status'>) => {
    // Payment logic remains same
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Account Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track invoices, payments, and client account statuses.</p>
        </div>
        <Button onClick={handleCreateInvoice} icon={<DocumentPlusIcon className="w-5 h-5" />}>
            Create Financial Record
        </Button>
      </div>

      <Card className="flex flex-wrap gap-4 justify-between items-center p-4">
        <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
              type="text"
              placeholder="Search by invoice ID or client name..."
              className="pl-10 block w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="secondary" icon={<FunnelIcon className="w-5 h-5" />}>Filter</Button>
      </Card>

      <TableContainer>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <Thead>
                <tr>
                    <Th>Invoice ID</Th>
                    <Th>Client</Th>
                    <Th>Amount</Th>
                    <Th>Issue Date</Th>
                    <Th>Due Date</Th>
                    <Th className="text-center">Status</Th>
                    <Th className="text-center">Actions</Th>
                </tr>
            </Thead>
            <Tbody>
                {invoices.map(invoice => (
                    <Tr key={invoice.id}>
                        <Td className="font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{invoice.id}</Td>
                        <Td className="font-medium text-gray-900 dark:text-white">{invoice.clientName}</Td>
                        <Td className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(invoice.amount)}</Td>
                        <Td>{invoice.issueDate}</Td>
                        <Td>{invoice.dueDate}</Td>
                        <Td className="text-center">{getStatusBadge(invoice.status)}</Td>
                        <Td className="text-center">
                            <button onClick={() => handleEditInvoice(invoice)} className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </table>
        {invoices.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No invoices found.</p>
            </div>
        )}
      </TableContainer>
      <InvoiceFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        clients={clients}
        onSave={handleSaveInvoice}
        onRecordPayment={handleRecordPayment}
        editingInvoice={editingInvoice}
        clientForInvoice={clientForInvoice}
      />
    </div>
  );
};

export default AccountManagementPage;
