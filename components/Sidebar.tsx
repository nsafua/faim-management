import React, { useState, useMemo } from 'react';
import { XIcon } from './icons/XIcon';
import { 
  HomeIcon, 
  UsersIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon, 
  DocumentPlusIcon, 
  BriefcaseIcon, 
  UserGroupIcon, 
  CalendarDaysIcon, 
  BookOpenIcon, 
  MegaphoneIcon, 
  ArrowRightOnRectangleIcon, 
  QuestionMarkCircleIcon, 
  ShieldCheckIcon, 
  AcademicCapIcon, 
  FaimLogoIcon, 
  TagIcon, 
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon
} from './icons/DummyIcons';
import { PermissionSet, CompanySettings } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isDesktopCollapsed: boolean;
  activePage: string;
  setActivePage: (page: string) => void;
  staffPermissions: { [key: string]: PermissionSet };
  companySettings: CompanySettings;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen, 
  onMobileClose,
  isDesktopCollapsed,
  activePage,
  setActivePage,
  staffPermissions,
  companySettings,
  onLogout
}) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Client Management': true,
    'Team': true
  });
  const [logoError, setLogoError] = useState(false);

  const { internalMails } = useData();
  const { currentStaff } = useAuth();

  const unreadMails = useMemo(() => {
      if (!currentStaff) return 0;
      return internalMails.filter(m => 
          m.recipientIds.includes(currentStaff.id) && 
          !m.readBy.includes(currentStaff.id) && 
          !m.isDeleted && 
          !m.isDraft
      ).length;
  }, [internalMails, currentStaff]);

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleNavClick = (pageName: string) => {
    setActivePage(pageName);
    onMobileClose();
  };
  
  const allNavItems = [
    { name: 'Dashboard', icon: <HomeIcon />, href: '#', moduleId: 'Dashboard' },
    {
      name: 'Client Management',
      icon: <UsersIcon />,
      moduleId: 'Clients',
      subItems: [
        { name: 'Clients', icon: <UserGroupIcon />, href: '#', moduleId: 'Clients' },
        { name: 'Account Management', icon: <DocumentPlusIcon />, href: '#', moduleId: 'Account Management' },
      ],
    },
    {
      name: 'Team',
      icon: <BriefcaseIcon />,
      moduleId: 'Team',
      subItems: [
        { name: 'Leads & Follow-Ups', icon: <UsersIcon />, href: '#', moduleId: 'Leads Management' },
        { name: 'Mailing', icon: <EnvelopeIcon />, href: '#', moduleId: 'Internal Mailing', badge: unreadMails },
        { name: 'Leave', icon: <CalendarDaysIcon />, href: '#', moduleId: 'Administration' },
        { name: 'Events', icon: <BookOpenIcon />, href: '#', moduleId: 'Administration' },
        { name: 'Announcements', icon: <MegaphoneIcon />, href: '#', moduleId: 'Administration' },
      ],
    },
    { name: 'Messaging', icon: <ChatBubbleLeftEllipsisIcon />, href: '#', moduleId: 'Clients' },
    { name: 'Promotions', icon: <TagIcon />, href: '#', moduleId: 'Promotions' },
    { name: 'Administration', icon: <ShieldCheckIcon />, href: '#', moduleId: 'Administration'},
    { name: 'CEO Hub', icon: <AcademicCapIcon />, href: '#', moduleId: 'CEO Hub' },
    { name: 'Support', icon: <QuestionMarkCircleIcon />, href: '#', moduleId: 'Settings' },
    { name: 'Settings', icon: <Cog6ToothIcon />, href: '#', moduleId: 'Settings' },
  ];

  const visibleNavItems = allNavItems.filter(item => staffPermissions[item.moduleId]?.view || item.name === 'Messaging').map(item => {
      if (item.subItems) {
          return {
              ...item,
              subItems: item.subItems.filter(subItem => staffPermissions[subItem.moduleId]?.view)
          };
      }
      return item;
  }).filter(item => !item.subItems || item.subItems.length > 0);

  const sidebarLogo = companySettings.appLogoDark || companySettings.appLogoLight || companySettings.logo;

  const sidebarContent = (
    <>
      <div className="flex flex-col items-center justify-center p-4 h-24 border-b border-gray-800 flex-shrink-0">
          {(sidebarLogo && !logoError) ? (
            <img 
              key={sidebarLogo} 
              src={sidebarLogo} 
              alt={`${companySettings.name} Logo`} 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                 console.error("Sidebar logo failed to load. URL was:", sidebarLogo, "Error event:", e);
                 setLogoError(true);
              }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <FaimLogoIcon className="w-10 h-10 text-white" />
          )}
          {!isDesktopCollapsed && (
            <h1 className="text-xl font-bold tracking-wider text-white mt-2">
              {companySettings.name.split(' ')[0]}<span className="text-blue-400">.</span>
            </h1>
          )}
        <button onClick={onMobileClose} className="md:hidden absolute top-5 right-4 text-gray-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-grow p-2 overflow-y-auto">
        <ul>
          {visibleNavItems.map((item) => (
            <li key={item.name}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between w-full gap-3 px-3 py-3 my-1 rounded-md transition-colors duration-200 ${
                      activePage === item.name || item.subItems.some(sub => sub.name === activePage || (sub.name === 'Clients' && activePage === 'Client Details'))
                        ? 'text-white'
                        : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6">{item.icon}</span>
                      {!isDesktopCollapsed && <span className="font-medium">{item.name}</span>}
                    </div>
                    {!isDesktopCollapsed && (
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${openMenus[item.name] ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {(!isDesktopCollapsed && openMenus[item.name]) && (
                    <ul className="pl-6">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <a
                            href={subItem.href}
                            onClick={(e) => { e.preventDefault(); handleNavClick(subItem.name); }}
                            className={`flex items-center justify-between pl-3 pr-4 py-2 my-1 rounded-md transition-colors duration-200 text-sm relative group ${
                              activePage === subItem.name || (subItem.name === 'Clients' && activePage === 'Client Details')
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6">{subItem.icon}</span>
                              <span className="font-medium">{subItem.name}</span>
                            </div>
                            {subItem.badge !== undefined && subItem.badge > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-gray-900 group-hover:ring-gray-800 transition-all animate-pulse">
                                    {subItem.badge}
                                </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <a
                  href={item.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.name); }}
                  className={`flex items-center gap-3 px-3 py-3 my-1 rounded-md transition-colors duration-200 ${
                    activePage === item.name
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="w-6 h-6">{item.icon}</span>
                  {!isDesktopCollapsed && <span className="font-medium">{item.name}</span>}
                </a>
              )}
            </li>
          ))}

          {/* Standalone Log Out Button */}
          <li>
            <button
              onClick={onLogout}
              className="flex items-center w-full gap-3 px-3 py-3 my-1 rounded-md transition-colors duration-200 hover:bg-red-900/20 text-red-400 hover:text-red-300"
            >
              <span className="w-6 h-6">
                <ArrowRightOnRectangleIcon />
              </span>
              {!isDesktopCollapsed && <span className="font-bold">Log Out</span>}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity md:hidden ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
      ></div>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 text-white w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
      <aside className={`hidden md:flex flex-col bg-gray-900 text-white transition-all duration-300 ease-in-out ${isDesktopCollapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
