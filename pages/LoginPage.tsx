
import React, { useState } from 'react';
import { FaimLogoIcon, EyeIcon, EyeSlashIcon } from '../components/icons/DummyIcons';
import { LoaderIcon } from '../components/icons/LoaderIcon';
import { CompanySettings } from '../types';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<{ success: boolean, message: string }>;
    companySettings: CompanySettings;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, companySettings }) => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await onLogin(email, password);

            if (!result.success) {
                setError(result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    // Determine logos based on theme
    const activeAppLogo = theme === 'dark' ? (companySettings.appLogoDark || companySettings.appLogoLight) : (companySettings.appLogoLight || companySettings.appLogoDark);
    const activeCompanyLogo = theme === 'dark' ? (companySettings.companyLogoDark || companySettings.companyLogoLight) : (companySettings.companyLogoLight || companySettings.companyLogoDark);
    // Legacy fallback
    const legacyLogo = companySettings.logo;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4 transition-colors duration-200 relative">
            {/* Top Left App Branding */}
            <div className="absolute top-4 left-4 flex items-center gap-3">
                {activeAppLogo ? (
                    <img key={activeAppLogo} src={activeAppLogo} alt="App Logo" className="w-10 h-10 object-contain" />
                ) : (
                    <FaimLogoIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                )}
                <span className="font-bold text-xl text-gray-800 dark:text-white tracking-wide">
                    {companySettings.name.split(' ')[0]}<span className="text-blue-500">.</span>
                </span>
            </div>

            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-colors duration-200 mt-12 sm:mt-0">
                <div className="flex flex-col items-center">
                    {/* Center Company Logo */}
                    {(activeCompanyLogo || legacyLogo) ? (
                        <img key={activeCompanyLogo || legacyLogo} src={activeCompanyLogo || legacyLogo} alt="Company Logo" className="w-32 h-32 object-contain mb-4" />
                    ) : (
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">🏢</span>
                        </div>
                    )}
                    
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Real Estate Management System</p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900 dark:text-red-200 dark:border-red-600 p-4 rounded-md" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm pr-10"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 z-20 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" aria-hidden="true" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Remember me</label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Forgot your password?</a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <LoaderIcon className="w-4 h-4 animate-spin" /> Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
