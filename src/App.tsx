
import React, { useState } from 'react';
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
import PromotionsPage from './pages/PromotionsPage';
import AdministrationPage from './pages/AdministrationPage';
import LeadsManagementPage from './pages/LeadsManagementPage';
import HumanResourcesPage from './pages/HumanResourcesPage';
import AllLandLayoutsPage from './pages/AllLandLayoutsPage';
import AllocatePlotPage from './pages/AllocatePlotPage';
import ClientDocumentationPage from './pages/ClientDocumentationPage';
import AmendmentFormPage from './pages/AmendmentFormPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import UserActivityPage from './pages/UserActivityPage';
import PlaceholderPage from './pages/PlaceholderPage';

import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLES, GENERATED_REPORTS } from './data/mockData';
import { Client } from './types';

const AppContent: React.FC = () => {
    const { 
        clients, properties, invoices, staff, leads, promotions, 
        companySettings, activityLogs, roles, amendments,
        saveClient, deleteClient, saveProperty, saveInvoice, 
        saveLead, deleteLead, savePromotion, deletePromotion,
        updateStaff, setStaff, setRoles, setCompanySettings,
        addActivityLog, setAmendmentList, setClientList
    } = useData();
    
    const { currentStaff, login, logout, isAuthenticated } = useAuth();
    
    const [activePage, setActivePage] = useState('Dashboard');
    const [pageContext, setPageContext] = useState<any>(null);
    const [clientForInvoice, setClientForInvoice] = useState<Client | null>(null);

    // Helper for context-aware logger
    const handleAddActivityLog = (type: any, description: string) => {
        if (currentStaff) {
            addActivityLog(type, description, currentStaff.id);
        }
    };

    const handleSetPage = (page: string, context: any = null) => {
        setActivePage(page);
        setPageContext(context);
    };

    if (!isAuthenticated || !currentStaff) {
        return <LoginPage onLogin={login} companySettings={companySettings} />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Clients':
                return <ClientsPage 
                    clients={clients} 
                    onSaveClient={saveClient}
                    onDeleteClient={deleteClient}
                    properties={properties} 
                    milestones={[{ acronym: 'REG', label: 'Registration', progress: 10 }, { acronym: 'PAYM', label: 'Payment', progress: 40 }, { acronym: 'IND', label: 'Indenture', progress: 70 }, { acronym: 'COMP', label: 'Completed', progress: 100 }]}
                    onClientSelect={(client) => handleSetPage('Client Details', client)} 
                    setActivePage={handleSetPage}
                    setClientForInvoice={setClientForInvoice}
                    invoices={invoices}
                    addActivityLog={handleAddActivityLog}
                />;
            case 'Client Details':
                return <ClientDetailPage 
                    client={pageContext} 
                    properties={properties}
                    onBack={() => handleSetPage('Clients')}
                    currentStaff={currentStaff}
                    roles={roles}
                    setActivePage={handleSetPage}
                />;
            case 'Account Management':
                 return <AccountManagementPage 
                    clients={clients}
                    onSaveClient={saveClient}
                    onClientSelect={(client) => handleSetPage('Client Details', client)}
                    invoices={invoices}
                    onSaveInvoice={saveInvoice}
                    clientForInvoice={clientForInvoice}
                    setClientForInvoice={setClientForInvoice}
                    receiptPattern={null} 
                    setReceiptPattern={() => {}}
                    setReceiptAlerts={() => {}}
                    currentStaff={currentStaff}
                 />;
            case 'Settings':
                return <SettingsPage 
                    currentStaff={currentStaff} 
                    staff={staff}
                    roles={roles}
                    setRoles={setRoles}
                    onViewStaffActivity={(staff) => handleSetPage('Staff Activity', staff)}
                    companySettings={companySettings}
                    setCompanySettings={setCompanySettings}
                />;
            case 'CEO Hub':
                 return <CEOHub
                    setActivePage={handleSetPage}
                    properties={properties}
                    clients={clients}
                    invoices={invoices}
                    staff={staff}
                    roles={roles}
                    onViewStaffActivity={(staff) => handleSetPage('Staff Activity', staff)}
                    addActivityLog={handleAddActivityLog}
                />;
             case 'Properties':
                return <PropertiesPage properties={properties} currentStaff={currentStaff} onBack={pageContext?.from === 'CEO Hub' ? () => handleSetPage('CEO Hub') : undefined} />;
             case 'New Land Acquisition':
                return <LandPurchaseFormPage onBack={() => handleSetPage('CEO Hub')} properties={properties} onSaveProperty={saveProperty} />;
             case 'Promotions':
                return <PromotionsPage 
                    promotions={promotions} 
                    onSavePromotion={savePromotion}
                    onDeletePromotion={deletePromotion}
                    properties={properties} 
                    showForm={true} 
                    onBack={pageContext?.from === 'CEO Hub' ? () => handleSetPage('CEO Hub') : undefined} 
                />;
            case 'Administration':
                return <AdministrationPage setActivePage={handleSetPage} />;
            case 'Lead Management & Follow-Up':
                return <LeadsManagementPage 
                    leads={leads} 
                    onSaveLead={saveLead}
                    onDeleteLead={deleteLead}
                    clients={clients} 
                    onSaveClient={saveClient}
                    staffList={staff} 
                    roles={roles}
                    properties={properties} 
                    milestones={[{ acronym: 'REG', label: 'Registration', progress: 10 }]} 
                    currentStaff={currentStaff} 
                    addActivityLog={handleAddActivityLog} 
                />;
            case 'Human Resources':
                return <HumanResourcesPage onBack={() => handleSetPage('Administration')} staff={staff} setStaff={setStaff} roles={roles} addActivityLog={handleAddActivityLog} />;
            case 'All Land Layouts':
                return <AllLandLayoutsPage onBack={() => handleSetPage('Administration')} properties={properties} />;
            case 'Allocate Plot':
                return <AllocatePlotPage onBack={() => handleSetPage('Administration')} clients={clients} properties={properties}/>;
            case 'Client Documentation':
                return <ClientDocumentationPage onBack={() => handleSetPage('Administration')} clients={clients} onSaveClient={saveClient} />;
            case 'Amendment Form':
                return <AmendmentFormPage client={pageContext} onBack={() => handleSetPage('Client Details', pageContext)} onSave={(data) => { setAmendmentList(prev => [data, ...prev]); alert('Amendment saved!'); handleSetPage('Client Details', pageContext);}} currentStaff={currentStaff} />;
            case 'Analytics & Reports':
                return <AnalyticsPage onBack={() => handleSetPage('CEO Hub')} clients={clients} properties={properties} invoices={invoices} staff={staff} addActivityLog={handleAddActivityLog} />;
            case 'Advanced Reports':
                return <AdvancedReportsPage onBack={() => handleSetPage('CEO Hub')} reports={GENERATED_REPORTS} addActivityLog={handleAddActivityLog} />;
            case 'Staff Activity':
                return <UserActivityPage staffMember={pageContext} logs={activityLogs.filter(l => l.userId === pageContext.id)} onBack={() => handleSetPage('Settings')} />;
            case 'Mailing':
            case 'Leave':
            case 'Knowledge Base':
            case 'Event':
            case 'Announcement':
            case 'Support':
                return <PlaceholderPage title={activePage} onBack={() => handleSetPage('Dashboard')} />;
            default:
                return <div>Page not found</div>;
        }
    };

    const staffPermissions = ROLES.find(r => r.id === currentStaff.roleId)?.name === 'CEO' 
        ? { Dashboard: { view: true }, Clients: { view: true }, 'Account Management': { view: true }, Promotions: { view: true }, Team: { view: true }, 'Leads Management': { view: true }, Administration: { view: true }, 'CEO Hub': { view: true }, Settings: { view: true } }
        : { Dashboard: { view: true }, Clients: { view: true }, 'Account Management': { view: true }, Team: { view: true }, 'Leads Management': { view: true }, Settings: { view: true } };

    return (
        <Layout 
            activePage={activePage} 
            setActivePage={handleSetPage} 
            currentStaff={currentStaff} 
            onLogout={logout}
            staffPermissions={staffPermissions as any}
            companySettings={companySettings}
        >
            {renderPage()}
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <DataProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </DataProvider>
    );
};

export default App;
