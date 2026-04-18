import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TableContainer, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table';
import { 
    ChatBubbleLeftEllipsisIcon, 
    EnvelopeIcon, 
    Cog6ToothIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    ArrowPathIcon,
    FunnelIcon
} from '../components/icons/DummyIcons';
import { useAuth } from '../context/AuthContext';
import { MessagingTabs } from '../components/messaging/MessagingTabs';
import { 
    listenToMessageHistory, 
    listenToTemplates, 
    updateClientPreferences 
} from '../services/messagingDbService';
import { MessageHistory, MessageTemplate } from '../types/messaging';

const MessagingPage: React.FC = () => {
    const { currentStaff } = useAuth();
    const [activeTab, setActiveTab] = useState('templates');
    const [history, setHistory] = useState<MessageHistory[]>([]);
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);

    const isCEO = currentStaff?.roleId === 'CEO' || currentStaff?.roleId === 'Administrator';

    useEffect(() => {
        const unsubHistory = listenToMessageHistory(setHistory);
        const unsubTemplates = listenToTemplates(setTemplates);
        return () => {
            unsubHistory();
            unsubTemplates();
        };
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Messaging Control Center</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Deterministic client communication engine and audit trail.</p>
            </div>

            <MessagingTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'templates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(temp => (
                        <Card key={temp.id} title={temp.name} action={<Badge variant={temp.isEnabled ? 'success' : 'neutral'}>{temp.isEnabled ? 'Active' : 'Disabled'}</Badge>}>
                            <div className="space-y-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[100px]">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{temp.body}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{temp.category}</span>
                                    <button 
                                        disabled={!isCEO}
                                        className="text-sm font-bold text-blue-600 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        Edit Content
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {isCEO && (
                        <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
                            <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-gray-300 group-hover:text-blue-500 mb-2" />
                            <span className="text-sm font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">New Template</span>
                        </button>
                    )}
                </div>
            )}

            {activeTab === 'manual' && (
                <Card title="Manual Message Dispatch">
                    <div className="max-w-2xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient Source</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold">
                                    <option>Select Registered Client</option>
                                    <option>Custom Phone Number</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Template Preset</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold">
                                    <option value="">None (Custom Message)</option>
                                    {templates.filter(t => t.isEnabled).map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Message Content</label>
                            <textarea 
                                rows={6} 
                                className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm leading-relaxed"
                                placeholder="Write your message here..."
                            ></textarea>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                            <div className="flex items-center gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
                                <span className="text-xs text-blue-800 dark:text-blue-300 font-bold uppercase">Ready for dispatch</span>
                            </div>
                            <Button icon={<EnvelopeIcon className="w-5 h-5" />}>Execute Send</Button>
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'history' && (
                <div className="space-y-4">
                    <Card className="p-4 bg-gray-50 dark:bg-gray-900/50 border-dashed">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <FunnelIcon className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-bold text-gray-600">Filters: All Channels | All Statuses</span>
                            </div>
                            <Button variant="secondary" size="sm" icon={<ArrowPathIcon className="w-4 h-4" />}>Refresh Feed</Button>
                        </div>
                    </Card>

                    <TableContainer>
                        <table className="w-full text-sm text-left">
                            <Thead>
                                <tr>
                                    <Th>Recipient</Th>
                                    <Th>Category</Th>
                                    <Th>Preview</Th>
                                    <Th className="text-center">Status</Th>
                                    <Th className="text-right">Timestamp</Th>
                                </tr>
                            </Thead>
                            <Tbody>
                                {history.length === 0 ? (
                                    <Tr><Td colSpan={5} className="py-20 text-center text-gray-400 italic">No communication history recorded.</Td></Tr>
                                ) : (
                                    history.map(log => (
                                        <Tr key={log.id}>
                                            <Td className="font-bold text-gray-900 dark:text-white">{log.recipient}</Td>
                                            <Td><Badge variant="info">{log.category}</Badge></Td>
                                            <Td className="max-w-xs truncate text-gray-500 italic">"{log.messagePreview}"</Td>
                                            <Td className="text-center">
                                                <Badge variant={log.status === 'SENT' ? 'success' : 'danger'}>{log.status}</Badge>
                                            </Td>
                                            <Td className="text-right font-mono text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </table>
                    </TableContainer>
                </div>
            )}

            {activeTab === 'preferences' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                        <strong>GDPR & Data Protection:</strong> Updating preferences here only affects the automated communication layer. Ensure client verbal or written request is documented.
                    </p>
                    <TableContainer>
                        <table className="w-full text-sm text-left">
                            <Thead>
                                <tr>
                                    <Th>Account Identifier</Th>
                                    <Th className="text-center">SMS</Th>
                                    <Th className="text-center">Email</Th>
                                    <Th className="text-center">Status</Th>
                                    <Th className="text-right">Action</Th>
                                </tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td className="font-bold">John Doe (ELH-101)</Td>
                                    <Td className="text-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" /></Td>
                                    <Td className="text-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" /></Td>
                                    <Td className="text-center"><Badge variant="success">OPT-IN</Badge></Td>
                                    <Td className="text-right">
                                        <button className="text-blue-600 font-bold hover:underline">Manage Prefs</button>
                                    </Td>
                                </Tr>
                            </Tbody>
                        </table>
                    </TableContainer>
                </div>
            )}
        </div>
    );
};

export default MessagingPage;
