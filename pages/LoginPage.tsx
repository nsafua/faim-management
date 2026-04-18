
import React, { useState, useEffect } from 'react';
import { FaimLogoIcon, EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, AcademicCapIcon, CheckCircleIcon, InformationCircleIcon } from '../components/icons/DummyIcons';
import { LoaderIcon } from '../components/icons/LoaderIcon';
import { CompanySettings } from '../types';
import ThemeSelector from '../components/ThemeSelector';
import { useTheme } from '../context/ThemeContext';
import { registerStaffAccount } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<{ success: boolean, message: string }>;
    companySettings: CompanySettings;
    externalError?: string | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, companySettings, externalError }) => {
    const { theme } = useTheme();
    const { sessionStatus, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // CEO Integrity Gate State
    const [showCEOHelper, setShowCEOHelper] = useState(false);
    const [initStatus, setInitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Image Error States
    const [appLogoError, setAppLogoError] = useState(false);
    const [companyLogoError, setCompanyLogoError] = useState(false);

    // Authority Email Constant (CEO Reference)
    const CEO_EMAIL_REF = 'ceo@faim.com';

    useEffect(() => {
        if (externalError) {
            setError(externalError);
        }
    }, [externalError]);

    // Isolated Rule: Only trigger CEO Recovery if Identity (Auth) is valid but Profile fetch fails for the CEO account.
    useEffect(() => {
        if (isAuthenticated && sessionStatus === 'error' && email.toLowerCase() === CEO_EMAIL_REF) {
            setShowCEOHelper(true);
        } else {
            setShowCEOHelper(false);
        }
    }, [isAuthenticated, sessionStatus, email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await onLogin(email.trim(), password);
            if (!result.success) {
                setError(result.message);
            }
        } catch (err) {
            setError('A system error prevented authentication.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitializeCEO = async () => {
        setInitStatus('loading');
        setError('');
        try {
            const result = await registerStaffAccount({
                email: CEO_EMAIL_REF,
                password: 'password', 
                fullName: 'Chief Executive Officer',
                roleId: 'CEO'
            });
            
            if (result.success) {
                setInitStatus('success');
                setEmail(CEO_EMAIL_REF);
                setPassword('password');
                setError('CEO Profile restored. You may now proceed.');
            }
        } catch (e: any) {
            if (e.code === 'auth/email-already-in-use') {
                setInitStatus('success');
                setError('Auth account exists. Please use your master password.');
            } else {
                setInitStatus('error');
                setError(`Restoration Failed: ${e.message}`);
            }
        }
    };

    const activeAppLogo = theme === 'dark' ? (companySettings.appLogoDark || companySettings.appLogoLight) : (companySettings.appLogoLight || companySettings.appLogoDark);
    const activeCompanyLogo = theme === 'dark' ? (companySettings.companyLogoDark || companySettings.companyLogoLight) : (companySettings.companyLogoLight || companySettings.companyLogoDark);
    const legacyLogo = companySettings.logo;

    const isSystemError = sessionStatus === 'error';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4 transition-colors duration-200 relative">
            <div className="absolute top-4 left-4 flex items-center gap-3">
                {activeAppLogo && !appLogoError ? (
                    <img 
                        src={activeAppLogo} 
                        alt="App Logo" 
                        className="w-10 h-10 object-contain"
                        onError={() => setAppLogoError(true)}
                    />
                ) : (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xl">🏢</span>
                    </div>
                )}
                <span className="font-bold text-xl text-gray-800 dark:text-white tracking-wide">
                    {companySettings.name.split(' ')[0]}<span className="text-blue-500">.</span>
                </span>
            </div>

            <div className="absolute top-4 right-4">
                <ThemeSelector />
            </div>
            
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-colors duration-200 mt-12 sm:mt-0 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center mb-2">
                    {((activeCompanyLogo || legacyLogo) && !companyLogoError) ? (
                        <img 
                            src={activeCompanyLogo || legacyLogo} 
                            alt="Company Logo" 
                            className="w-64 h-auto max-h-64 object-contain mb-1"
                            onError={() => setCompanyLogoError(true)}
                        />
                    ) : (
                        <FaimLogoIcon className="w-24 h-24 text-blue-600 dark:text-blue-400 mb-1" />
                    )}
                    <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">FAIM Enterprise Management</p>
                </div>
                
                {(error || isSystemError) && (
                    <div className={`mb-2 border-l-4 p-4 rounded-md animate-in fade-in slide-in-from-top-1 duration-200 ${initStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-200' : isSystemError ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-200' : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-200'}`} role="alert">
                        <div className="flex items-start">
                            {initStatus === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2 shrink-0" /> : isSystemError ? <InformationCircleIcon className="w-5 h-5 mr-2 shrink-0" /> : <ExclamationTriangleIcon className="w-5 h-5 mr-2 shrink-0" />}
                            <p className="text-sm font-medium">{error || 'Session initialization failed.'}</p>
                        </div>
                        
                        {showCEOHelper && (
                            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                                <p className="text-[10px] font-black uppercase tracking-wider mb-2">Master Integrity Check Failed:</p>
                                <button
                                    onClick={handleInitializeCEO}
                                    disabled={initStatus === 'loading'}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2"
                                >
                                    {initStatus === 'loading' ? <LoaderIcon className="w-3 h-3 animate-spin" /> : <AcademicCapIcon className="w-3 h-3" />}
                                    Synchronize CEO Identity
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="Staff Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                                placeholder="Secure Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 z-20 text-gray-400 hover:text-gray-600 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-all shadow-md active:scale-[0.98]"
                        >
                            {loading ? <LoaderIcon className="w-4 h-4 animate-spin mr-2" /> : "Authorize Entry"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
