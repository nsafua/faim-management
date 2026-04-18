export type NormalizedRole = 'CEO' | 'ADMIN' | 'CHIEF_ACCOUNTANT' | 'SITE_MANAGER' | 'FRONT_DESK' | 'SALES_HEAD' | 'SALES_REP' | 'UNKNOWN';

export const normalizeRole = (roleId: string | undefined): NormalizedRole => {
    if (!roleId) return 'UNKNOWN';
    const r = roleId.toUpperCase().trim();
    if (r === 'CEO') return 'CEO';
    if (r === 'ADMINISTRATOR' || r === 'ADMIN') return 'ADMIN';
    if (r === 'CHIEF ACCOUNTANT' || r === 'CHIEF_ACCOUNTANT') return 'CHIEF_ACCOUNTANT';
    if (r === 'SITE MANAGER' || r === 'SITE_MANAGER') return 'SITE_MANAGER';
    if (r === 'FRONT DESK EXECUTIVE' || r === 'FRONT DESK' || r === 'FRONT_DESK') return 'FRONT_DESK';
    if (r === 'HEAD OF SALES' || r === 'HEAD_OF_SALES') return 'SALES_HEAD';
    if (r === 'SALES REPRESENTATIVE' || r === 'SALES_REP') return 'SALES_REP';
    return 'UNKNOWN';
};