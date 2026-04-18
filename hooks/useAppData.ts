
/**
 * Unified Data Access Hook Module
 * 
 * This file acts as an aggregator for all domain-specific data hooks.
 * Components can import from here to maintain backward compatibility 
 * while the underlying logic is split into modular files.
 */

export * from './modules/useClientHooks';
export * from './modules/usePropertyHooks';
export * from './modules/useFinanceHooks';
export * from './modules/useStaffHooks';
export * from './modules/useCRMHooks';
export * from './modules/useSystemHooks';
