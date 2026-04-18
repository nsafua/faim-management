import { useMemo } from 'react';
import { Client, AppNotification } from '../types';

export const useNotificationTriggers = (clients: Client[]) => {
    const notifications = useMemo(() => {
        const alerts: AppNotification[] = [];
        const now = new Date();
        
        // Deterministic Accra Date Calculation
        const accraDateStr = new Intl.DateTimeFormat('en-GB', { 
            timeZone: 'Africa/Accra', 
            year: 'numeric', month: '2-digit', day: '2-digit' 
        }).format(now);
        
        const [day, month, year] = accraDateStr.split('/');
        const todayMonthDay = `${month}-${day}`;

        clients.forEach(client => {
            // --- SECTION 1: BIRTHDAY CHECK ---
            if (client.dateOfBirth) {
                try {
                    const dobParts = client.dateOfBirth.split('-');
                    if (dobParts.length === 3) {
                        const dobMonthDay = `${dobParts[1]}-${dobParts[2]}`;
                        if (dobMonthDay === todayMonthDay) {
                            alerts.push({
                                id: `bday-${client.id}-${year}-${todayMonthDay}`,
                                title: 'Client Birthday Today 🎉',
                                message: `${client.name} is celebrating a birthday today. Please call or text to wish them a happy birthday.`,
                                type: 'Birthday',
                                recipientRole: 'ALL_USERS',
                                timestamp: now.toISOString(),
                                isRead: false,
                                metadata: { 
                                    clientId: client.id, 
                                    clientName: client.name,
                                    eventType: 'CLIENT_BIRTHDAY'
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.warn(`Malformed DOB for client ${client.id}: ${client.dateOfBirth}`);
                }
            }

            // --- SECTION 2: 70% QUALIFICATION (LOCKED LOGIC) ---
            // Business Rule: Trigger notification ONLY when client has crossing flag and is NOT allocated.
            // Authority: This UI alert reflects the background trigger state.
            const isAllocated = client.allocationStatus === 'ALLOCATED';

            if (client.hasQualified70 && !isAllocated) {
                alerts.push({
                    id: `qual-final-${client.id}`,
                    title: 'Client qualifies for allocation.',
                    message: `${client.name} has reached the 70% payment threshold. Assignment of plot is now authorized.`,
                    type: 'Qualification',
                    recipientRole: 'Administrator',
                    timestamp: client.qualificationDate || now.toISOString(),
                    isRead: false,
                    metadata: { 
                        clientId: client.id, 
                        clientName: client.name, 
                        eventType: 'ALLOCATION_70_PERCENT_QUALIFIED' 
                    }
                });
                
                // NO ESCALATION logic for Administrator/CEO here per architecture Constitution
            }
            
            // --- SECTION 3: DEFAULT ALERT ---
            const lastPaymentDate = client.payment.paymentHistory.length > 0 
                ? new Date(client.payment.paymentHistory[client.payment.paymentHistory.length - 1].date)
                : new Date(client.regDate);
            const monthsSinceLastPayment = (now.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
            
            if (monthsSinceLastPayment >= 3 && client.payment.balance > 0) {
                alerts.push({
                    id: `def-alert-${client.id}`,
                    title: 'Payment Inactivity Alert',
                    message: `${client.name} has had no payment activity for 3 months.`,
                    type: 'Default',
                    recipientRole: 'Chief Accountant',
                    timestamp: now.toISOString(),
                    isRead: false,
                    metadata: { clientId: client.id, clientName: client.name }
                });
            }
        });

        return alerts;
    }, [clients]);

    return notifications;
};