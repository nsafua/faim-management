import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
    ShieldCheckIcon, 
    LockClosedIcon, 
    InformationCircleIcon, 
    BellIcon,
    CurrencyDollarIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon
} from '../icons/DummyIcons';

export const GovernanceConstitution: React.FC = () => {
    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* 1. Header Section */}
            <div className="bg-slate-900 dark:bg-black p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border-b-8 border-blue-600">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheckIcon className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                                FAIM System Governance Canon
                            </h1>
                            <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-xs mt-2">
                                Legacy Application
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Version: LEGACY-GOV-1.1
                            </div>
                            <Badge variant="success" className="animate-pulse bg-green-500/20 text-green-400 border border-green-500/50 px-4 py-1 font-black uppercase tracking-widest">
                                ACTIVE & LOCKED
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Governance Purpose Section */}
            <Card className="border-l-4 border-l-blue-600 bg-blue-50/30 dark:bg-blue-900/5">
                <div className="flex gap-4">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 shrink-0" />
                    <div className="text-sm leading-relaxed text-blue-900 dark:text-blue-200">
                        <p className="font-black uppercase tracking-widest text-[10px] mb-1">Foundational Purpose</p>
                        This constitution defines how Legacy must behave. Governance rules codified here override UI behavior. 
                        No change applies without an explicit version upgrade. 
                        <strong className="block mt-2 italic text-blue-700 dark:text-blue-400">This panel is read-only by design.</strong>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3. Role-Based Access Control Section */}
                <Card title="Role-Based Access Control" icon={<UsersIcon className="w-5 h-5 text-indigo-500" />}>
                    <div className="space-y-4">
                        {[
                            { 
                                role: 'CEO', 
                                can: 'Full System Sovereignty, Final Approval Authority', 
                                cannot: 'Bypass Audit Logging' 
                            },
                            { 
                                role: 'Chief Accountant', 
                                can: 'Read, create, edit, and save client financial records', 
                                cannot: 'No approval rights, No access to CEO Hub, No access to company-wide ledgers' 
                            },
                            { 
                                role: 'Administrator', 
                                can: 'Plot Allocation, System User Lifecycle, HR Management', 
                                cannot: 'Approve Restricted Financial Amendments' 
                            },
                            { 
                                role: 'Site Manager', 
                                can: 'Mapping Updates, Site Plan Verification', 
                                cannot: 'Modify Transaction History' 
                            },
                            { 
                                role: 'Front Desk', 
                                can: 'Client Acquisition, Lead Management', 
                                cannot: 'Initialize Financial Ledgers' 
                            },
                            { 
                                role: 'Sales Head', 
                                can: 'Commission Oversight, Sales Performance Reports', 
                                cannot: 'Delete Finalized Invoices' 
                            },
                        ].map((item) => (
                            <div key={item.role} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <h4 className="font-black text-xs text-blue-600 dark:text-blue-400 uppercase tracking-widest">{item.role}</h4>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Authority</p>
                                        <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{item.can}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-red-400 uppercase tracking-tighter">Hard Restriction</p>
                                        <p className="text-[11px] font-medium text-red-600 dark:text-red-400">{item.cannot}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-6">
                    {/* 4. Approval & Change Control Section */}
                    <Card title="Approval & Change Control" icon={<ShieldCheckIcon className="w-5 h-5 text-amber-500" />}>
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-500 rounded-r-xl">
                                <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-2">Hard-State Approval Rule</p>
                                <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                                    Restricted changes require CEO approval. 
                                    Changes remain unapplied until approval. 
                                    “No restricted change may apply outside this process.”
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Change Request Evidence Requirements</p>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><CheckCircleIcon className="w-3 h-3 text-green-500" /> Before/After values</span>
                                    <span className="flex items-center gap-1"><CheckCircleIcon className="w-3 h-3 text-green-500" /> Requester identity</span>
                                    <span className="flex items-center gap-1"><CheckCircleIcon className="w-3 h-3 text-green-500" /> System timestamp</span>
                                    <span className="flex items-center gap-1"><CheckCircleIcon className="w-3 h-3 text-green-500" /> Rationale/Reason</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 5. Notification Governance Section */}
                    <Card title="Notification Governance" icon={<BellIcon className="w-5 h-5 text-indigo-500" />}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Workflow Notifications</p>
                                    <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                                        System-generated. No staff list exposure. Deterministic routing.
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">Internal Messaging</p>
                                    <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                                        User-initiated. Sender must know recipient.
                                    </p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deterministic Routing Matrix</p>
                                <ul className="space-y-1.5">
                                    <li className="text-[11px] flex justify-between"><span className="text-gray-500">New Client</span> <Badge variant="neutral">CEO + Chief Accountant</Badge></li>
                                    <li className="text-[11px] flex justify-between"><span className="text-gray-500">70% Paid Threshold</span> <Badge variant="neutral">Administrator</Badge></li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 6. Financial Qualification & 7. Privacy Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Financial Qualification Rule" icon={<CurrencyDollarIcon className="w-5 h-5 text-green-500" />}>
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">LOCKED LOGIC</p>
                        <div className="text-3xl font-black tracking-tighter">70% THRESHOLD</div>
                        <p className="text-[10px] text-gray-400 font-bold mt-2 text-center uppercase">
                            Total paid ≥ 70% of contract total <br/> (after discount)
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                            <LockClosedIcon className="w-3 h-3" /> IMMUTABLE
                        </div>
                    </div>
                </Card>

                <Card title="Privacy & Isolation Guarantees" icon={<LockClosedIcon className="w-5 h-5 text-blue-500" />}>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">No staff directories exposed for workflow routing.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">Least-privilege enforced. Unauthorized listeners blocked.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">UI visibility does not imply data access.</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* 3. Governance Change Log Section */}
            <Card title="Governance Change Log" icon={<ClockIcon className="w-5 h-5 text-slate-500" />}>
                <div className="space-y-4">
                    <div className="p-4 border border-blue-100 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-900/5 rounded-2xl">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col gap-1">
                                <Badge variant="info" className="font-black text-[10px] w-fit">LEGACY-GOV-1.1</Badge>
                                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Permission refinement</span>
                            </div>
                            <span className="text-[10px] font-bold text-green-600 uppercase">Status: Active</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Role Affected</p>
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Chief Accountant</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Authority</p>
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">CEO</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">Summary</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                “Chief Accountant is authorized to edit and save client financial records while CEO approval remains mandatory for restricted financial changes.”
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-2xl opacity-50 grayscale">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="neutral" className="font-black text-[10px]">LEGACY-GOV-1.0</Badge>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Status: Archived</span>
                        </div>
                        <p className="text-xs text-gray-500 italic">Initial baseline governance establishment.</p>
                    </div>
                </div>
            </Card>

            {/* 8. Governance Guardrail Notice */}
            <div className="p-8 bg-red-600 rounded-3xl text-white shadow-xl shadow-red-600/20 border-t-8 border-red-800">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-5 bg-white/20 rounded-full">
                        <ExclamationTriangleIcon className="w-12 h-12" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight">Governance Enforcement Mandate</h3>
                        <p className="text-red-100 text-sm mt-1 leading-relaxed">
                            Any request, feature, or change that violates this constitution must be blocked.
                            A governance warning must be raised before execution.
                            Governance may only change via explicit version upgrade.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
