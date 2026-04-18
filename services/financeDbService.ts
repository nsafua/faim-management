import { db } from './firebase';
import { collection, doc, runTransaction, serverTimestamp, addDoc } from 'firebase/firestore';
import { PaymentTransaction, Invoice } from '../types';

const CLIENTS_COL = 'clients';
const AUDIT_COL = 'workflow_audit';
const TRIGGERS_COL = 'workflow_triggers';

/**
 * Authoritative Payment & Workflow Transaction
 * Handles: Payment Write -> 70% Qualification Check -> Workflow Trigger -> Audit Log
 */
export const recordPaymentAtomic = async (
    clientId: number, 
    paymentData: Omit<PaymentTransaction, 'id' | 'status'> & { type: string },
    operatorName: string
) => {
    const amount = Number(paymentData.amount);
    const date = String(paymentData.date || new Date().toISOString().split('T')[0]);
    const method = String(paymentData.method || 'Other');
    const receiptNumber = String(paymentData.receiptNumber || 'N/A');
    const type = String(paymentData.type || 'Land');

    const auditRef = {
        clientId: Number(clientId),
        postedAmount: amount,
        operator: String(operatorName),
        status: 'PENDING'
    };

    try {
        // 1. Core Financial Transaction
        // This updates the client's paid total and balance, and optionally sets a 70% trigger.
        await runTransaction(db, async (transaction) => {
            const clientRef = doc(db, CLIENTS_COL, String(clientId));
            const clientSnap = await transaction.get(clientRef);

            if (!clientSnap.exists()) {
                throw new Error("CLIENT_NOT_FOUND");
            }

            const client = clientSnap.data();
            const contractTotal = Number(client.payment?.total || 0);

            if (contractTotal <= 0) {
                const history = client.payment?.paymentHistory || [];
                transaction.update(clientRef, {
                    'payment.paid': Number((client.payment?.paid || 0) + amount),
                    'payment.paymentHistory': [...history, { 
                        id: `TXN-${Date.now()}`, amount, date, method, receiptNumber, type, status: 'POSTED' 
                    }]
                });
                return;
            }
            
            const history = client.payment?.paymentHistory || [];
            const sumPosted = history
                .filter((p: any) => p.status === 'POSTED' || p.status === 'CONFIRMED' || p.status === 'Success')
                .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

            const newTotalPosted = sumPosted + amount;
            const threshold = contractTotal * 0.70;
            const isCrossing = newTotalPosted >= threshold && client.hasQualified70 !== true;

            const txnId = `TXN-${Date.now()}`;
            const historyItem = { id: txnId, amount, date, method, receiptNumber, type, status: 'POSTED' };
            
            const clientUpdates: any = {
                'payment.paid': Number((client.payment?.paid || 0) + amount),
                'payment.balance': Number(contractTotal - ((client.payment?.paid || 0) + amount)),
                'paidPercent': Number((newTotalPosted / contractTotal) * 100),
                'payment.paymentHistory': [...history, historyItem]
            };

            if (isCrossing) {
                clientUpdates.hasQualified70 = true;
                clientUpdates.qualified70At = serverTimestamp();
                clientUpdates.qualified70TotalPaid = Number(newTotalPosted);

                const triggerId = `${clientId}_QUALIFIED_70_${Date.now()}`;
                const triggerRef = doc(db, TRIGGERS_COL, triggerId);
                
                console.debug(`[Finance DB] Staging 70% trigger for Client ID: ${clientId}`);
                
                transaction.set(triggerRef, {
                    event: "CLIENT_QUALIFIED_70",
                    recipientRole: "Administrator",
                    clientId: Number(clientId),
                    clientName: String(client.name || 'Unknown'),
                    clientRef: String(`${client.initials || 'CL'}-${clientId}`),
                    timestamp: serverTimestamp(),
                    status: "ACTIVE",
                    metadata: {
                        totalPaid: Number(newTotalPosted),
                        threshold: Number(threshold),
                        contractTotal: Number(contractTotal)
                    }
                });
            }

            transaction.update(clientRef, clientUpdates);
        });

        // 2. Non-blocking Workflow Audit Logging
        // We isolate this in its own try/catch to ensure that if a security rule or network 
        // issue blocks the audit log, the main financial record (which is valid and committed)
        // doesn't cause a UI error or lead to double-posting by the user.
        try {
            await addDoc(collection(db, AUDIT_COL), {
                ...auditRef,
                status: 'SUCCESS',
                timestamp: new Date().toISOString()
            });
        } catch (auditError) {
            console.warn("[Finance DB] Audit log write failed, but financial record was saved successfully:", auditError);
        }
        
        console.debug("[Finance DB] Transaction committed successfully.");
        return { success: true };

    } catch (error: any) {
        console.error("[Finance DB] Transaction Failed:", error);
        
        // Log failure to audit collection if possible (best effort)
        try {
            await addDoc(collection(db, AUDIT_COL), { 
                ...auditRef, 
                status: 'FAILED', 
                errorMessage: String(error.message).substring(0, 200),
                timestamp: new Date().toISOString()
            });
        } catch (auditLogError) {
            // Silently fail if audit itself is blocked during a hard failure
        }
        
        throw error;
    }
};

export const fetchInvoices = async () => { return []; };
export const persistInvoice = async (invoice: Invoice) => { /* ... */ };
export const removeInvoice = async (id: string) => { /* ... */ };