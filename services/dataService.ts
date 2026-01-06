
// This file is deprecated. All data operations have migrated to Firestore via dbService.ts.
// Keeping an empty export to prevent build errors if there are lingering imports (which should be removed).

export function loadAppData() {
    console.warn("loadAppData is deprecated. Using Firestore instead.");
    return {
        clients: [],
        properties: [],
        staff: [],
        invoices: [],
        leads: [],
        promotions: [],
        settings: { name: 'FAIM', logo: undefined },
        logs: [],
        rolePermissions: []
    };
}

export function saveAllData(data: any) {
    console.warn("saveAllData is deprecated. Data is persisted to Firestore automatically.");
}
