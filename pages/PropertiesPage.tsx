
import React, { useState, useEffect } from 'react';
import { Property, Staff } from '../types';
import { 
  ArrowLeftIcon, 
  PrinterIcon, 
  PencilSquareIcon,
  BanknotesIcon,
  CheckCircleIcon,
  MapIcon
} from '../components/icons/DummyIcons';
import { Button } from '../components/ui/Button';
import { useProperties } from '../hooks/useAppData';

// Modular Imports
import { FinancialConfiguration } from '../components/properties/FinancialConfiguration';
import { PlotIdentifierConfig } from '../components/properties/PlotIdentifierConfig';
import { InventoryTable } from '../components/properties/InventoryTable';
import { AcquisitionDetails } from '../components/properties/AcquisitionDetails';

interface PropertiesPageProps {
  properties: Property[];
  onBack?: () => void;
  currentStaff: Staff;
  initialProperty?: Property | null;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ onBack, initialProperty }) => {
  const { saveProperty } = useProperties();
  const [viewingProperty, setViewingProperty] = useState<Property | null>(initialProperty || null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [localPropData, setLocalPropData] = useState<Property | null>(initialProperty || null);

  useEffect(() => {
    if (initialProperty) {
        setViewingProperty(initialProperty);
        setLocalPropData({ ...initialProperty });
    }
  }, [initialProperty]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAmendment = async () => {
    if (localPropData) {
      await saveProperty(localPropData);
      setIsEditMode(false);
      alert("Amendments saved successfully.");
    }
  };

  const handleUpdateLocal = (updates: Partial<Property>) => {
      setLocalPropData(prev => prev ? { ...prev, ...updates } : null);
  }

  if (viewingProperty && localPropData) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 transition-all">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Property Dossier</h1>
              <p className="text-sm text-gray-500 font-medium">{localPropData.location} — Ref: {localPropData.id}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="secondary" icon={<PrinterIcon className="w-4 h-4" />} onClick={handlePrint} className="flex-1">
              Print Dossier
            </Button>
            {!isEditMode ? (
              <Button icon={<PencilSquareIcon className="w-4 h-4" />} onClick={() => setIsEditMode(true)} className="flex-1">
                Amendment
              </Button>
            ) : (
              <Button variant="success" icon={<CheckCircleIcon className="w-4 h-4" />} onClick={handleSaveAmendment} className="flex-1">
                Save Changes
              </Button>
            )}
          </div>
        </div>

        <div id="printable-dossier" className="space-y-8 pb-20">
          <section className="space-y-6 break-after-page">
            <div className="border-b-4 border-blue-600 pb-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
                Page 1: Sales & Purchase Management
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FinancialConfiguration 
                    property={localPropData} 
                    isEditMode={isEditMode} 
                    onChange={handleUpdateLocal} 
                />
                <PlotIdentifierConfig 
                    property={localPropData} 
                    isEditMode={isEditMode} 
                    onChange={handleUpdateLocal} 
                />
            </div>

            <InventoryTable 
                inventory={localPropData.inventory} 
                isEditMode={isEditMode} 
                onChange={(inv) => handleUpdateLocal({ inventory: inv })} 
            />
          </section>

          <section className="space-y-6">
            <div className="border-b-4 border-amber-600 pb-2">
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-2">
                <MapIcon className="w-6 h-6 text-amber-600" />
                Page 2: Land Acquisition Details
              </h2>
            </div>

            <AcquisitionDetails 
                property={localPropData} 
                isEditMode={isEditMode} 
                onChange={handleUpdateLocal} 
            />
          </section>
        </div>

        <style>{`
          @media print {
            body { background: white; }
            .sidebar, header, nav, button, .print\\:hidden { display: none !important; }
            main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
            .container { max-width: 100% !important; width: 100% !important; padding: 0 !important; }
            #printable-dossier { margin: 0; padding: 0; }
            .break-after-page { page-break-after: always; }
            input, textarea, select { 
              border: none !important; 
              background: transparent !important; 
              padding: 0 !important; 
              appearance: none !important;
              color: black !important;
              box-shadow: none !important;
            }
            label { color: #666 !important; }
            .card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 2rem; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64 text-gray-500 italic">
        Select a property from Purchase & Sale Management to view its dossier.
    </div>
  );
};

export default PropertiesPage;
