
// This file acts as a Facade for the new modular service layer.
// It ensures backward compatibility with hooks/useAppData.ts and other consumers.

export * from './clientDbService';
export * from './crmDbService';
export * from './financeDbService';
export * from './propertyDbService';
export * from './marketingDbService';
export * from './adminDbService';
