import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
// FIX: SMSConfig is a type defined in the types directory and is not an exported member of the smsService logic file.
import { getSMSConfig, saveSMSConfig } from '../../services/smsService';
import { SMSConfig } from '../../types';
import { CheckCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '../icons/DummyIcons';

export const SMSGatewaySettings: React.FC = () => {
    const [config, setConfig] = useState<SMSConfig>({
        provider: 'Disabled',
        apiKey: '',
        senderId: '',
        baseUrl: 'https://api.mnotify.com/api/sms/send',
        isConnected: false,
        updatedAt: ''
    });
    const [loading, setLoading] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState(false);

    useEffect(() => {
        getSMSConfig().then(c => {
            if (c) setConfig(c);
        });
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setSaveFeedback(false);
        try {
            const updated = { 
                ...config, 
                isConnected: config.provider !== 'Disabled' 
            };
            await saveSMSConfig(updated);
            setSaveFeedback(true);
            setTimeout(() => setSaveFeedback(false), 3000);
        } catch (e) {
            alert("Failed to save SMS settings. Check permissions.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="SMS Provider Conduit">
            <div className="space-y-8 max-w-2xl">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-4">
                    <ShieldCheckIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase tracking-widest">Gateway Governance</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                            Configure external SMS dispatch strategies. Provider settings are encrypted at rest and visible only to the CEO. DISABLING a provider blocks all automated client dispatches.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select 
                        label="Active Dispatch Strategy" 
                        value={config.provider} 
                        onChange={e => setConfig({...config, provider: e.target.value as any})}
                    >
                        <option value="Disabled">Disabled (Block All SMS)</option>
                        <option value="mNotify">mNotify (Production)</option>
                        <option value="Hubtel">Hubtel (Legacy)</option>
                        <option value="Custom">Custom Webhook/API</option>
                    </Select>

                    <Input 
                        label="Sender ID (Mask)" 
                        value={config.senderId} 
                        onChange={e => setConfig({...config, senderId: e.target.value.substring(0, 11)})} 
                        placeholder="e.g. FAIM"
                        disabled={config.provider === 'Disabled'}
                    />
                </div>

                {config.provider !== 'Disabled' && (
                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <Input 
                            label={`${config.provider} API Key`} 
                            type="password" 
                            value={config.apiKey} 
                            onChange={e => setConfig({...config, apiKey: e.target.value})} 
                            placeholder="••••••••••••••••••••"
                        />
                        <Input 
                            label="Gateway Endpoint URL" 
                            value={config.baseUrl} 
                            onChange={e => setConfig({...config, baseUrl: e.target.value})} 
                        />
                    </div>
                )}

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {saveFeedback && (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" /> Configuration Synchronized
                            </span>
                        )}
                    </div>
                    <Button 
                        onClick={handleSave} 
                        isLoading={loading}
                        className="px-10 font-black uppercase tracking-widest text-[10px]"
                    >
                        Update Gateway
                    </Button>
                </div>
            </div>
        </Card>
    );
};