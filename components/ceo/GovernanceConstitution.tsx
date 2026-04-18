import React from 'react';
import {
    GovernanceHeader,
    GovernancePurpose,
    RoleBasedAccessControl,
    ApprovalAndChangeControl,
    NotificationGovernance,
    FinancialQualificationRule,
    PrivacyGuarantees,
    GovernanceChangeLog,
    GovernanceGuardrailNotice
} from './governance/GovernanceWidgets';

export const GovernanceConstitution: React.FC = () => {
    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <GovernanceHeader />
            <GovernancePurpose />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RoleBasedAccessControl />
                <div className="space-y-6">
                    <ApprovalAndChangeControl />
                    <NotificationGovernance />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FinancialQualificationRule />
                <PrivacyGuarantees />
            </div>

            <GovernanceChangeLog />
            <GovernanceGuardrailNotice />
        </div>
    );
};
