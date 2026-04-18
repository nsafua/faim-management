import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import SettingsPage from './pages/SettingsPage';
import PropertiesPage from './pages/PropertiesPage';
import AccountManagementPage from './pages/AccountManagementPage';
import CEOHub from './pages/CEOHub';
import LandPurchaseFormPage from './pages/LandPurchaseFormPage';
import PurchaseSaleManagementPage from './pages/PurchaseSaleManagementPage';
import PromotionsPage from './pages/PromotionsPage';
import AdministrationPage from './pages/AdministrationPage';
import HumanResourcesPage from './pages/HumanResourcesPage';
import AllLandLayoutsPage from './pages/AllLandLayoutsPage';
import AllocatePlotPage from './pages/AllocatePlotPage';
import ClientDocumentationPage from './pages/ClientDocumentationPage';
import AmendmentFormPage from './pages/AmendmentFormPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import UserActivityPage from './pages/UserActivityPage';
import MappingsPage from './pages/MappingsPage';
import SupportPage from './pages/SupportPage';
import MessagingPage from './pages/MessagingPage';

// Team Module Pages
import LeadsManagementPage from './pages/LeadsManagementPage';
import MailingPage from './pages/team/MailingPage';
import LeavePage from './pages/team/LeavePage';
import EventsPage from './pages/team/EventsPage';
import AnnouncementsPage from './pages/team/AnnouncementsPage';

import { DataProvider, usePermissions } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ModalProvider } from './context/ModalContext';
import { ModalManager } from './components/ModalManager';
import { GENERATED_REPORTS } from './data/mockData';
import { Client, PermissionSet } from './types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
    useClients, useProperties, useInvoices, useStaff, useLeads, 
    usePromotions, useActivityLogs, useRoles, useAmendments, useCompanySettings 
} from './hooks/useAppData';
import { LoaderIcon } from './components/icons/LoaderIcon';
import { ShieldCheckIcon, LockClosedIcon } from './components/icons/DummyIcons';

const queryClient = new QueryClient();

const AuthenticatedApp: React.FC = () => {
    const { clients, saveClient, deleteClient } = useClients();
    const { properties, saveProperty } = useProperties();
    const { invoices, saveInvoice } = useInvoices();
    const { staff, updateStaff } = useStaff(); 
    const { leads, saveLead, deleteLead } = useLeads();
    const { promotions, savePromotion, deletePromotion } = usePromotions();
    const { activityLogs, addActivityLog } = useActivityLogs();
    const { roles, setRoles } = useRoles();
    const { amendments, setAmendmentList } = useAmendments();
    const { companySettings, setCompanySettings } = useCompanySettings();
    const { rolePermissions } = usePermissions();
    
    const { currentStaff, logout } = useAuth();
    
    const [activePage, setActivePage] = useState('Dashboard');
    const [pageContext, setPageContext] = useState<any>(null);
    const [clientForInvoice, setClientForInvoice] = useState<Client | null>(null);

    const staffPermissions = useMemo(() => {
        if (!currentStaff) return {};
        const userPermissions: { [key: string]: PermissionSet } = {};
        const rolePerms = rolePermissions.filter(rp => rp.roleId === currentStaff.roleId);
        rolePerms.forEach(rp => {
            userPermissions[rp.moduleId] = rp.permissions;
        });
        return userPermissions;
    }, [currentStaff, rolePermissions]);

    const hasAccessToDashboard = useMemo(() => {
        return !!staffPermissions['Dashboard']?.view;
    }, [staffPermissions]);

    const handleAddActivityLog = (type: any, description: string) => {
        if (currentStaff) {
            addActivityLog(type, description, currentStaff.id);
        }
    };

    const handleSetPage = (page: string, context: any = null) => {
        // Deep linking logic for Account Management
        if (page === 'Account Management' && context && (context.id || context.clientId)) {
            setClientForInvoice(context);
        }
        
        setActivePage(page);
        setPageContext(context);
    };

    // Restricted View for accounts without role permissions configured
    if (!hasAccessToDashboard && activePage === 'Dashboard') {
        return (
            <Layout 
                activePage={activePage} 
                setActivePage={handleSetPage} 
                currentStaff={currentStaff!} 
                onLogout={logout}
                staffPermissions={staffPermissions}
                companySettings={companySettings}
            >
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
                        <ShieldCheckIcon className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Account Pending Configuration</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">Your identity is verified, but your specific role access permissions are not yet configured. Please contact the System Administrator to finalize your account setup.</p>
                </div>
            </Layout>
        );
    }

    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard': return <Dashboard />;
            case 'Clients': return <ClientsPage clients={clients} onSaveClient={saveClient} onDeleteClient={deleteClient} properties={properties} milestones={[{ acronym: 'REG', label: 'Registration', progress: 10 }, { acronym: 'PAYM', label: 'Payment', progress: 40 }, { acronym: 'IND', label: 'Indenture', progress: 70 }, { acronym: 'COMP', label: 'Completed', progress: 100 }]} onClientSelect={(client) => handleSetPage('Client Details', client)} setActivePage={handleSetPage} setClientForInvoice={setClientForInvoice} invoices={invoices} addActivityLog={handleAddActivityLog} />;
            case 'Client Details': return <ClientDetailPage client={pageContext} properties={properties} onBack={() => handleSetPage('Clients')} currentStaff={currentStaff!} roles={roles} setActivePage={handleSetPage} />;
            case 'Account Management': return <AccountManagementPage clients={clients} onSaveClient={saveClient} invoices={invoices} onSaveInvoice={saveInvoice} clientForInvoice={clientForInvoice} setClientForInvoice={setClientForInvoice} receiptPattern={null} setReceiptPattern={() => {}} setReceiptAlerts={() => {}} currentStaff={currentStaff!} roles={roles} setActivePage={handleSetPage} />;
            case 'Leads & Follow-Ups': return <LeadsManagementPage onSaveLead={saveLead} onDeleteLead={deleteLead} clients={clients} onSaveClient={saveClient} staffList={staff} roles={roles} properties={properties} milestones={[{ acronym: 'REG', label: 'Registration', progress: 10 }]} currentStaff={currentStaff!} addActivityLog={handleAddActivityLog} />;
            case 'Mailing': return <MailingPage initialCompose={pageContext?.initialCompose} />;
            case 'Leave': return <LeavePage />;
            case 'Events': return <EventsPage />;
            case 'Announcements': return <AnnouncementsPage />;
            case 'Messaging': return <MessagingPage />;
            case 'Settings': return <SettingsPage currentStaff={currentStaff!} staff={staff} roles={roles} setRoles={setRoles} onViewStaffActivity={(staff) => handleSetPage('Staff Activity', staff)} companySettings={companySettings} setCompanySettings={setCompanySettings} onUpdateStaff={updateStaff} />;
            case 'CEO Hub': return <CEOHub setActivePage={handleSetPage} properties={properties} clients={clients} invoices={invoices} staff={staff} roles={roles} onViewStaffActivity={(staff) => handleSetPage('Staff Activity', staff)} addActivityLog={handleAddActivityLog} />;
            case 'Properties': return <PropertiesPage properties={properties} currentStaff={currentStaff!} initialProperty={pageContext} onBack={() => handleSetPage('Purchase & Sale Management')} />;
            case 'New Land Acquisition': return <LandPurchaseFormPage onBack={() => handleSetPage('CEO Hub')} properties={properties} onSaveProperty={saveProperty} />;
            case 'Purchase & Sale Management': return <PurchaseSaleManagementPage onBack={() => handleSetPage('CEO Hub')} properties={properties} onSaveProperty={saveProperty} currentStaff={currentStaff!} setActivePage={handleSetPage} />;
            case 'Promotions': return <PromotionsPage promotions={promotions} onSavePromotion={savePromotion} onDeletePromotion={deletePromotion} properties={properties} showForm={true} onBack={pageContext?.from === 'CEO Hub' ? () => handleSetPage('CEO Hub') : undefined} />;
            case 'Administration': return <AdministrationPage setActivePage={handleSetPage} />;
            case 'Human Resources': return <HumanResourcesPage onBack={() => handleSetPage('Administration')} staff={staff} roles={roles} addActivityLog={handleAddActivityLog} />;
            case 'All Land Layouts': return <AllLandLayoutsPage onBack={() => handleSetPage('Administration')} properties={properties} />;
            case 'Allocate Plot': return <AllocatePlotPage onBack={() => handleSetPage('Administration')} clients={clients} properties={properties}/>;
            case 'Client Documentation': return <ClientDocumentationPage onBack={() => handleSetPage('Administration')} clients={clients} onSaveClient={saveClient} />;
            case 'Mappings': return <MappingsPage onBack={() => handleSetPage('Administration')} properties={properties} />;
            case 'Amendment Form': return <AmendmentFormPage client={pageContext} onBack={() => handleSetPage('Client Details', pageContext)} onSave={async (data, updatedClient) => { setAmendmentList(prev => [data, ...prev]); await saveClient(updatedClient); handleAddActivityLog('Update', `Processed amendment request for client: ${updatedClient.name}`); alert('Amendment processed successfully!'); handleSetPage('Client Details', updatedClient); }} currentStaff={currentStaff!} />;
            case 'Analytics & Reports': return <AnalyticsPage onBack={() => handleSetPage('CEO Hub')} clients={clients} properties={properties} invoices={invoices} staff={staff} addActivityLog={handleAddActivityLog} />;
            case 'Advanced Reports': return <AdvancedReportsPage onBack={() => handleSetPage('CEO Hub')} reports={GENERATED_REPORTS} addActivityLog={handleAddActivityLog} />;
            case 'Staff Activity': return <UserActivityPage staffMember={pageContext} logs={activityLogs.filter(l => l.userId === pageContext.id)} onBack={() => handleSetPage('Settings')} />;
            case 'Support': return <SupportPage />;
            default: return <Dashboard />;
        }
    };

    return (
        <Layout 
            activePage={activePage} 
            setActivePage={handleSetPage} 
            currentStaff={currentStaff!} 
            onLogout={logout}
            staffPermissions={staffPermissions}
            companySettings={companySettings}
        >
            {renderPage()}
            <ModalManager />
        </Layout>
    );
};

const AppContent: React.FC = () => {
    const { loading, sessionStatus, currentStaff, login, authError } = useAuth();
    const { companySettings } = useCompanySettings();

    // Effect to update favicon and page title
    useEffect(() => {
        if (companySettings.name) {
            document.title = `${companySettings.name} - Enterprise Dashboard`;
        }
        if (companySettings.favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = companySettings.favicon;
        }
    }, [companySettings.name, companySettings.favicon]);

    // Application Lifecycle Guard
    if (loading || sessionStatus === 'authenticating' || sessionStatus === 'resolving_profile' || sessionStatus === 'bootstrapping') {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
                <LoaderIcon className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                    {sessionStatus === 'bootstrapping' ? 'Initializing profile...' : 'Authorizing access...'}
                </p>
            </div>
        );
    }

    // Auth Error or Missing Profile Gating
    if (!currentStaff) {
        return (
            <LoginPage 
                onLogin={login} 
                companySettings={companySettings} 
                externalError={authError} 
            />
        );
    }

    return <AuthenticatedApp />;
};

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <ModalProvider>
                    <AuthProvider>
                        <DataProvider>
                            <AppContent />
                        </DataProvider>
                    </AuthProvider>
                </ModalProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};

export default App;
