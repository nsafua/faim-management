import React, { useState } from 'react';
import { XIcon } from './icons/XIcon';
import { 
  HomeIcon, 
  UsersIcon, 
  Cog6ToothIcon, 
  ChevronDownIcon,
  ChevronLeftIcon,
  DocumentPlusIcon,
  BriefcaseIcon,
  UserGroupIcon,
  InboxArrowDownIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  MegaphoneIcon,
  ArrowRightOnRectangleIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  FaimLogoIcon,
  TagIcon,
  HashtagIcon
} from './icons/DummyIcons';
import { PermissionSet, CompanySettings } from '../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isDesktopCollapsed: boolean;
  onDesktopToggle: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
  staffPermissions: { [key: string]: PermissionSet };
  companySettings: CompanySettings;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen, 
  onMobileClose,
  isDesktopCollapsed,
  onDesktopToggle,
  activePage,
  setActivePage,
  staffPermissions,
  companySettings,
}) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Client Management': true,
    'Team': true
  });

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
    // { name: 'Properties', icon: <BuildingLibraryIcon />, href: '#', moduleId: 'Properties' }, // Removed as per requirement
    { name: 'Promotions', icon: <TagIcon />, href: '#', moduleId: 'Promotions' },
    {
        name: 'Team',
        icon: <BriefcaseIcon />,
        moduleId: 'Team',
        subItems: [
            { name: 'Lead Management & Follow-Up', icon: <HashtagIcon />, href: '#', moduleId: 'Leads Management' },
            { name: 'Mailing', icon: <InboxArrowDownIcon/>, href: '#', moduleId: 'Team' },
            { name: 'Leave', icon: <ArrowRightOnRectangleIcon/>, href: '#', moduleId: 'Team' },
            { name: 'Knowledge Base', icon: <BookOpenIcon/>, href: '#', moduleId: 'Team' },
            { name: 'Event', icon: <CalendarDaysIcon/>, href: '#', moduleId: 'Team' },
            { name: 'Announcement', icon: <MegaphoneIcon/>, href: '#', moduleId: 'Team' },
        ]
    },
    { name: 'Administration', icon: <ShieldCheckIcon />, href: '#', moduleId: 'Administration'},
    { name: 'CEO Hub', icon: <AcademicCapIcon />, href: '#', moduleId: 'CEO Hub' },
    { name: 'Support', icon: <QuestionMarkCircleIcon />, href: '#', moduleId: 'Settings' }, // Everyone can see support
    { name: 'Settings', icon: <Cog6ToothIcon />, href: '#', moduleId: 'Settings' },
  ];

  const visibleNavItems = allNavItems.filter(item => staffPermissions[item.moduleId]?.view).map(item => {
      if (item.subItems) {
          return {
              ...item,
              subItems: item.subItems.filter(subItem => staffPermissions[subItem.moduleId]?.view)
          };
      }
      return item;
  }).filter(item => !item.subItems || item.subItems.length > 0);


  const sidebarContent = (
    <>
      <div className="flex flex-col items-center justify-center p-4 h-24 border-b border-blue-900/50">
          {companySettings.logo ? (
            <img src={companySettings.logo} alt={`${companySettings.name} Logo`} className="w-12 h-12 object-contain" />
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
      <nav className="flex-grow p-2">
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
                        : 'hover:bg-blue-800 text-gray-300'
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
                            className={`flex items-center gap-3 pl-3 pr-4 py-2 my-1 rounded-md transition-colors duration-200 text-sm ${
                              activePage === subItem.name || (subItem.name === 'Clients' && activePage === 'Client Details')
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'hover:bg-blue-800 text-gray-400'
                            }`}
                          >
                            <span className="w-6 h-6">{subItem.icon}</span>
                            <span className="font-medium">{subItem.name}</span>
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
                      : 'hover:bg-blue-800 text-gray-300'
                  }`}
                >
                  <span className="w-6 h-6">{item.icon}</span>
                  {!isDesktopCollapsed && <span className="font-medium">{item.name}</span>}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-blue-900/50">
        <button onClick={onDesktopToggle} className="hidden md:flex items-center justify-center w-full gap-3 px-3 py-2 my-1 rounded-md hover:bg-blue-800 text-gray-300 transition-colors duration-200">
           <ChevronLeftIcon className={`w-6 h-6 transition-transform ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
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

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-blue-900 text-white transition-all duration-300 ease-in-out ${isDesktopCollapsed ? 'w-20' : 'w-64'}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;