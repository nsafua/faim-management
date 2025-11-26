
import React, { useState, useCallback, useEffect } from 'react';
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
import * as dataService from './services/dataService';

import { 
    MILESTONES, 
    ROLES, 
    GENERATED_REPORTS,
    AMENDMENT_REQUESTS as MOCK_AMENDMENT_REQUESTS
} from './data/mockData';
import { Staff, Client, ActivityLog, Property, Invoice, Role, CompanySettings, Lead, Promotion, AmendmentRequest } from './types';

const App: React.FC = () => {
    const [appData, setAppData] = useState(() => dataService.loadAppData());

    const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
    const [activePage, setActivePage] = useState('Dashboard');
    const [pageContext, setPageContext] = useState<any>(null);

    // App State
    const [staffList, setStaffList] = useState<Staff[]>(appData.staff);
    const [clientList, setClientList] = useState<Client[]>(appData.clients);
    const [propertyList, setPropertyList] = useState<Property[]>(appData.properties);
    const [invoiceList, setInvoiceList] = useState<Invoice[]>(appData.invoices);
    const [roleList, setRoleList] = useState<Role[]>(ROLES);
    const [companySettings, setCompanySettings] = useState<CompanySettings>(appData.settings);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(appData.logs);
    const [leadList, setLeadList] = useState<Lead[]>(appData.leads);
    const [promotionList, setPromotionList] = useState<Promotion[]>(appData.promotions);
    const [amendmentList, setAmendmentList] = useState<AmendmentRequest[]>(MOCK_AMENDMENT_REQUESTS);
    const [clientForInvoice, setClientForInvoice] = useState<Client | null>(null);

    useEffect(() => {
        dataService.saveAllData({
            clients: clientList,
            properties: propertyList,
            staff: staffList,
            invoices: invoiceList,
            leads: leadList,
            promotions: promotionList,
            settings: companySettings,
            logs: activityLogs
        });
    }, [clientList, propertyList, staffList, invoiceList, leadList, promotionList, companySettings, activityLogs]);
    

    const handleLogin = (email: string, password: string) => {
        const user = staffList.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentStaff(user);
            addActivityLog('Login', `User ${user.fullName} logged in.`);
            return { success: true, message: 'Login successful' };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const handleLogout = () => {
        if (currentStaff) {
            addActivityLog('Logout', `User ${currentStaff.fullName} logged out.`);
        }
        setCurrentStaff(null);
        setActivePage('Dashboard');
    };
    
    const addActivityLog = useCallback((type: ActivityLog['type'], description: string) => {
        if (!currentStaff) return;
        const newLog: ActivityLog = {
            id: Date.now(),
            userId: currentStaff.id,
            type,
            description,
            timestamp: new Date().toISOString(),
        };
        setActivityLogs(prev => [newLog, ...prev]);
    }, [currentStaff]);

    const handleSetPage = (page: string, context: any = null) => {
        setActivePage(page);
        setPageContext(context);
    };
    
    const handleUpdateStaff = (staffId: number, details: Partial<Staff>) => {
        const updatedStaffList = staffList.map(s => s.id === staffId ? { ...s, ...details } : s);
        setStaffList(updatedStaffList);
        if (currentStaff?.id === staffId) {
            setCurrentStaff(prev => prev ? { ...prev, ...details } : null);
        }
    };
    
    // --- Data Persistence Handlers ---

    const handleSaveClient = async (client: Client) => {
        let updatedList: Client[];
        const exists = clientList.some(c => c.id === client.id);
        if (exists) {
            updatedList = clientList.map(c => c.id === client.id ? client : c);
        } else {
            updatedList = [client, ...clientList];
        }
        setClientList(updatedList);
        return client;
    };
    
    const handleDeleteClient = async (clientId: number) => {
        const clientToDelete = clientList.find(c => c.id === clientId);
        if (clientToDelete && window.confirm(`Are you sure you want to delete client "${clientToDelete.name}"? This action cannot be undone.`)) {
            setClientList(prev => prev.filter(c => c.id !== clientId));
        }
    };

    const handleSaveProperty = async (property: Property) => {
        let updatedList: Property[];
        const exists = propertyList.some(p => p.id === property.id);
        if (exists) {
            updatedList = propertyList.map(p => p.id === property.id ? property : p);
        } else {
            updatedList = [property, ...propertyList];
        }
        setPropertyList(updatedList);
    };
    
    const handleSaveInvoice = async (invoice: Invoice) => {
         let updatedList: Invoice[];
         const exists = invoiceList.some(i => i.id === invoice.id);
        if (exists) {
            updatedList = invoiceList.map(i => i.id === invoice.id ? invoice : i);
        } else {
            updatedList = [invoice, ...invoiceList];
        }
        setInvoiceList(updatedList);
    };

    const handleSaveLead = async (lead: Lead) => {
        let updatedList: Lead[];
        const exists = leadList.some(l => l.id === lead.id);
        if (exists) {
            updatedList = leadList.map(l => l.id === lead.id ? lead : l);
        } else {
            updatedList = [lead, ...leadList];
        }
        setLeadList(updatedList);
    };

    const handleDeleteLead = async (leadId: number) => {
        const leadToDelete = leadList.find(l => l.id === leadId);
        if (leadToDelete && window.confirm(`Are you sure you want to delete lead "${leadToDelete.fullName}"?`)) {
            setLeadList(prev => prev.filter(l => l.id !== leadId));
        }
    };

    const handleSavePromotion = async (promotion: Promotion) => {
        let updatedList: Promotion[];
        const exists = promotionList.some(p => p.id === promotion.id);
        if (exists) {
            updatedList = promotionList.map(p => p.id === promotion.id ? promotion : p);
        } else {
            updatedList = [promotion, ...promotionList];
        }
        setPromotionList(updatedList);
    };
    
    const handleDeletePromotion = async (promotionId: number) => {
        const promoToDelete = promotionList.find(p => p.id === promotionId);
        if (promoToDelete && window.confirm(`Are you sure you want to delete promotion "${promoToDelete.title}"?`)) {
            setPromotionList(prev => prev.filter(p => p.id !== promotionId));
        }
    };
    

    const renderPage = () => {
        switch (activePage) {
            case 'Dashboard':
                return <Dashboard clients={clientList} properties={propertyList} invoices={invoiceList} />;
            case 'Clients':
                return <ClientsPage 
                    clients={clientList} 
                    onSaveClient={handleSaveClient}
                    onDeleteClient={handleDeleteClient}
                    properties={propertyList} 
                    milestones={MILESTONES}
                    onClientSelect={(client) => handleSetPage('Client Details', client)} 
                    setActivePage={handleSetPage}
                    setClientForInvoice={setClientForInvoice}
                    invoices={invoiceList}
                    addActivityLog={addActivityLog}
                />;
            case 'Client Details':
                return <ClientDetailPage 
                    client={pageContext} 
                    properties={propertyList}
                    onBack={() => handleSetPage('Clients')}
                    currentStaff={currentStaff!}
                    roles={roleList}
                    setActivePage={handleSetPage}
                />;
            case 'Account Management':
                 return <AccountManagementPage 
                    clients={clientList}
                    onSaveClient={handleSaveClient}
                    onClientSelect={(client) => handleSetPage('Client Details', client)}
                    invoices={invoiceList}
                    onSaveInvoice={handleSaveInvoice}
                    clientForInvoice={clientForInvoice}
                    setClientForInvoice={setClientForInvoice}
                    receiptPattern={null} // Add state for this if needed
                    setReceiptPattern={() => {}}
                    setReceiptAlerts={() => {}}
                    currentStaff={currentStaff!}
                 />;
            case 'Settings':
                return <SettingsPage 
                    currentStaff={currentStaff!} 
                    staff={staffList}
                    setStaff={setStaffList}
                    roles={roleList}
                    setRoles={setRoleList}
                    onViewStaffActivity={(staff) => handleSetPage('Staff Activity', staff)}
                    companySettings={companySettings}
                    setCompanySettings={setCompanySettings}
                    onUpdateStaff={handleUpdateStaff}
                />;
            case 'CEO Hub':
                 return <CEOHub
                    setActivePage={handleSetPage}
                    properties={propertyList}
                    clients={clientList}
                    invoices={invoiceList}
                    staff={staffList}
                    setStaff={setStaffList}
                    roles={roleList}
                    onViewStaffActivity={(staff) => handleSetPage('Staff Activity', staff)}
                    addActivityLog={addActivityLog}
                />;
             case 'Properties':
                return <PropertiesPage properties={propertyList} currentStaff={currentStaff!} onBack={pageContext?.from === 'CEO Hub' ? () => handleSetPage('CEO Hub') : undefined} />;
             case 'New Land Acquisition':
                return <LandPurchaseFormPage onBack={() => handleSetPage('CEO Hub')} properties={propertyList} onSaveProperty={handleSaveProperty} />;
             case 'Promotions':
                return <PromotionsPage 
                    promotions={promotionList} 
                    onSavePromotion={handleSavePromotion}
                    onDeletePromotion={handleDeletePromotion}
                    properties={propertyList} 
                    showForm={true} 
                    onBack={pageContext?.from === 'CEO Hub' ? () => handleSetPage('CEO Hub') : undefined} 
                />;
            case 'Administration':
                return <AdministrationPage setActivePage={handleSetPage} />;
            case 'Lead Management & Follow-Up':
                return <LeadsManagementPage 
                    leads={leadList} 
                    onSaveLead={handleSaveLead}
                    onDeleteLead={handleDeleteLead}
                    clients={clientList} 
                    onSaveClient={handleSaveClient}
                    staffList={staffList} 
                    properties={propertyList} 
                    milestones={MILESTONES} 
                    currentStaff={currentStaff!} 
                    addActivityLog={addActivityLog} 
                />;
            case 'Human Resources':
                return <HumanResourcesPage onBack={() => handleSetPage('Administration')} staff={staffList} setStaff={setStaffList} roles={roleList} addActivityLog={addActivityLog} />;
            case 'All Land Layouts':
                return <AllLandLayoutsPage onBack={() => handleSetPage('Administration')} properties={propertyList} />;
            case 'Allocate Plot':
                return <AllocatePlotPage onBack={() => handleSetPage('Administration')} clients={clientList} properties={propertyList}/>;
            case 'Client Documentation':
                return <ClientDocumentationPage onBack={() => handleSetPage('Administration')} clients={clientList} onSaveClient={handleSaveClient} />;
            case 'Amendment Form':
                return <AmendmentFormPage client={pageContext} onBack={() => handleSetPage('Client Details', pageContext)} onSave={(data) => { setAmendmentList(prev => [data, ...prev]); alert('Amendment saved!'); handleSetPage('Client Details', pageContext);}} currentStaff={currentStaff!} />;
            case 'Analytics & Reports':
                return <AnalyticsPage onBack={() => handleSetPage('CEO Hub')} clients={clientList} properties={propertyList} invoices={invoiceList} staff={staffList} addActivityLog={addActivityLog} />;
            case 'Advanced Reports':
                return <AdvancedReportsPage onBack={() => handleSetPage('CEO Hub')} reports={GENERATED_REPORTS} addActivityLog={addActivityLog} />;
            case 'Staff Activity':
// FIX: Changed prop 'user' to 'staffMember' to match the props interface of UserActivityPage.
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

    if (!currentStaff) {
        return <LoginPage onLogin={handleLogin} companySettings={companySettings} />;
    }
    
    const staffPermissions = ROLES.find(r => r.id === currentStaff.roleId)?.name === 'CEO' 
        ? { Dashboard: { view: true }, Clients: { view: true }, 'Account Management': { view: true }, Promotions: { view: true }, Team: { view: true }, 'Leads Management': { view: true }, Administration: { view: true }, 'CEO Hub': { view: true }, Settings: { view: true } }
        : { Dashboard: { view: true }, Clients: { view: true }, 'Account Management': { view: true }, Team: { view: true }, 'Leads Management': { view: true }, Settings: { view: true } };


    return (
        <Layout 
            activePage={activePage} 
            setActivePage={handleSetPage} 
            currentStaff={currentStaff} 
            onLogout={handleLogout}
            staffPermissions={staffPermissions as any}
            companySettings={companySettings}
        >
            {renderPage()}
        </Layout>
    );
};

export default App;