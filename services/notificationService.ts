import { db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Client } from '../types';

/**
 * Standardized Workflow Events
 * CLIENT_CREATED: New registration requiring account setup
 * CLIENT_QUALIFIED_70: Payment threshold met for plot allocation
 */
export type WorkflowEvent = 'CLIENT_CREATED' | 'CLIENT_QUALIFIED_70' | 'PAYMENT_DEFAULT';

interface NotifyParams {
    event: WorkflowEvent;
    client: Client;
}

/**
 * Deterministic Workflow Dispatcher
 * Forces targeting to specific organizational roles based on event type.
 * Standardizes schema to match Layout.tsx reader contract.
 */
export const dispatchWorkflowNotifications = async ({ event, client }: NotifyParams) => {
    try {
        const triggerId = `${client.id}_${event}`;
        const triggerRef = doc(db, 'workflow_triggers', triggerId);

        // Idempotency check
        const existing = await getDoc(triggerRef);
        if (existing.exists()) {
            console.debug(`[Notification Service] Trigger ${triggerId} already exists. Skipping.`);
            return;
        }

        // Construct payload with standardized types
        const triggerData: any = {
            id: String(triggerId),
            event: String(event),
            clientId: Number(client.id), // Standardized to number
            clientName: String(client.name),
            clientRef: String(`${client.initials || 'CL'}-${client.id}`),
            timestamp: serverTimestamp(),
            status: 'ACTIVE',
            processedBy: []
        };

        // Routing & Messaging
        if (event === 'CLIENT_QUALIFIED_70') {
            triggerData.recipientRole = 'Administrator';
            triggerData.message = "Client qualifies for allocation.";
        } else if (event === 'CLIENT_CREATED') {
            triggerData.recipientRole = 'Chief Accountant';
            triggerData.message = "New client ledger requires initialization.";
        }

        console.debug(`[Notification Service] Dispatching ${event} for Client: ${client.name} (Trigger: ${triggerId})`);
        
        await setDoc(triggerRef, triggerData, { merge: true });
        
        console.debug(`[Notification Service] Trigger written successfully: ${triggerId}`);

    } catch (e: any) {
        console.error("[Notification Service] Workflow Trigger Dispatch Failure:", e.message || e);
    }
};