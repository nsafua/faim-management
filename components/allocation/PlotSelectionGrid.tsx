
import React, { useMemo } from 'react';
import { Property, AllocationStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ExclamationTriangleIcon, PhoneIcon } from '../icons/DummyIcons';

interface PlotSelectionGridProps {
    property: Property;
    availablePlots: { plotNumber: string; isTaken: boolean; owner?: string; status?: AllocationStatus }[];
    selectedPlots: string[];
    onTogglePlot: (plot: string) => void;
    onConfirm: () => void;
    isSaving: boolean;
    isAlreadyAllocated?: boolean;
    isReserved?: boolean;
    clientPlotNumbers?: string;
    clientPaidPercent?: number;
}

export const PlotSelectionGrid: React.FC<PlotSelectionGridProps> = ({ 
    property, 
    availablePlots, 
    selectedPlots, 
    onTogglePlot, 
    onConfirm, 
    isSaving,
    isAlreadyAllocated = false,
    isReserved = false,
    clientPaidPercent = 0
}) => {
    // Computed Business Rules for Interaction
    const paymentAtOrAbove70 = clientPaidPercent >= 70;
    const isSelectionBlocked = isAlreadyAllocated || isReserved;
    
    // Final Button Enabling Logic
    const canConfirm = !isAlreadyAllocated && paymentAtOrAbove70 && selectedPlots.length > 0;

    // Find if any currently selected plot is actually reserved by another user
    const selectedReservedPlots = availablePlots.filter(p => 
        selectedPlots.includes(p.plotNumber) && 
        p.status === 'RESERVED_NOT_ALLOCATED' && 
        p.owner !== availablePlots.find(x => x.plotNumber === p.plotNumber)?.owner
    );

    return (
        <Card title={isReserved ? `3. Review RESERVED Plot(s) for ${property.location}` : `3. Select Plot(s) for ${property.location}`} className="lg:col-span-2 relative">
            {/* Interaction Lock for Finalized Records */}
            {isAlreadyAllocated && (
                <div className="absolute inset-0 bg-white/5 dark:bg-gray-900/5 backdrop-blur-[0.5px] z-10 cursor-not-allowed rounded-lg" />
            )}

            <div className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[350px] overflow-y-auto scrollbar-thin p-1 ${isAlreadyAllocated ? 'opacity-80' : ''}`}>
                {availablePlots.map(plot => {
                    const isReservedBySomeone = plot.status === 'RESERVED_NOT_ALLOCATED';
                    const isSelected = selectedPlots.includes(plot.plotNumber);
                    
                    return (
                        <button
                            key={plot.plotNumber}
                            disabled={plot.isTaken || isAlreadyAllocated || isReserved}
                            onClick={() => onTogglePlot(plot.plotNumber)}
                            className={`p-2 rounded border text-[10px] font-bold flex flex-col items-center gap-1 transition-all h-20 justify-center shadow-sm ${
                                plot.isTaken 
                                ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed grayscale' 
                                : isSelected
                                    ? isReserved 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200 border-dashed scale-100' 
                                        : 'bg-blue-600 text-white border-blue-600 scale-105 z-10'
                                    : isReservedBySomeone
                                        ? 'bg-white text-blue-600 border-blue-300 border-dashed hover:border-blue-500 hover:bg-blue-50/50'
                                        : isSelectionBlocked
                                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-500'
                            }`}
                        >
                            <span className={isReservedBySomeone ? "text-blue-600 font-black" : ""}>{plot.plotNumber}</span>
                            <span className={`opacity-60 text-[9px] ${isReservedBySomeone ? "text-blue-500 font-black italic" : ""}`}>
                                {plot.isTaken ? 'ALLOCATED' : isReserved && isSelected ? 'RESERVED' : isReservedBySomeone ? 'RESERVED' : isSelectionBlocked ? 'Locked' : 'Pick'}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 space-y-4">
                {/* Conflict Warning Side Panel (Only visible during active selection phase) */}
                {!isSelectionBlocked && selectedReservedPlots.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded-r-lg animate-in fade-in slide-in-from-left-4">
                        <div className="flex gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-4 text-xs font-medium text-amber-800 dark:text-amber-200">
                                {selectedReservedPlots.map(p => (
                                    <div key={p.plotNumber} className="space-y-1">
                                        <p className="font-black uppercase tracking-tight text-amber-900 dark:text-amber-100">Conflict Warning: Plot {p.plotNumber}</p>
                                        <p>This plot is RESERVED by <span className="font-black underline">{p.owner}</span>.</p>
                                        <p>Client has not paid up to 70%. Plot can be ALLOCATED to someone else.</p>
                                    </div>
                                ))}
                                
                                <div className="pt-3 border-t border-amber-200 dark:border-amber-800">
                                    <p className="flex items-center gap-1.5 font-black uppercase text-amber-600 mb-1">
                                        <PhoneIcon className="w-3.5 h-3.5" /> Advisory Communication
                                    </p>
                                    <p className="italic leading-relaxed">
                                        If allocated elsewhere: Call and inform client that their reserved plot has been allocated because they did not reach 70%. Client has first right if they can pay 70% immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Selection Summary and Authority Action Button */}
                {selectedPlots.length > 0 && (
                    <div className={`flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 ${isAlreadyAllocated || !paymentAtOrAbove70 ? 'opacity-50' : ''}`}>
                        <div>
                            <p className="text-xs text-blue-800 dark:text-blue-400 font-bold uppercase tracking-widest">{isReserved ? 'Ready for confirmation:' : 'Ready for assignment:'}</p>
                            <p className="text-sm font-black text-blue-900 dark:text-white mt-1">{selectedPlots.join(', ')}</p>
                        </div>
                        <Button 
                            onClick={onConfirm} 
                            isLoading={isSaving} 
                            disabled={!canConfirm}
                            className="px-8 font-black uppercase tracking-widest"
                        >
                            {isAlreadyAllocated ? 'Already Allocated' : !paymentAtOrAbove70 ? 'Ineligible (Low Payment)' : isReserved ? 'Confirm ALLOCATION' : 'Confirm Selection'}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
};
