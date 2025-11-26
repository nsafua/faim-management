import React from 'react';
import { Staff, Role, ActivityLog } from '../types';
import { ArrowLeftIcon, BriefcaseIcon, DocumentDuplicateIcon, FolderIcon } from '../components/icons/DummyIcons';

interface HumanResourcesPageProps {
  onBack: () => void;
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
  roles: Role[];
  addActivityLog: (type: ActivityLog['type'], description: string) => void;
}

const HumanResourcesPage: React.FC<HumanResourcesPageProps> = ({ onBack, staff, roles }) => {
    // In a real app, these functions would open modals to upload/update details
    const handleEditDetails = (staffId: number) => {
        alert(`Editing employment details for staff ID: ${staffId}`);
    };
    
    const handleManageDocuments = (staffId: number) => {
        alert(`Managing documents for staff ID: ${staffId}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-2">
                    <ArrowLeftIcon className="w-5 h-5" /> Back to Administration
                </button>
                <div className="flex items-center gap-4">
                     <BriefcaseIcon className="w-10 h-10 text-teal-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Human Resources</h1>
                        <p className="text-gray-500 mt-1">Manage staff employment details and official documents.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Staff Member</th>
                            <th scope="col" className="px-6 py-3">Position & Role</th>
                            <th scope="col" className="px-6 py-3">Employment Details</th>
                            <th scope="col" className="px-6 py-3">Documents</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {staff.map(member => {
                            const roleName = roles.find(r => r.id === member.roleId)?.name || 'N/A';
                            const details = member.employmentDetails;
                            const docs = member.documents;
                            return (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div>{member.fullName}</div>
                                        <div className="text-xs text-gray-500">{member.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{details?.position || 'Not Set'}</div>
                                        <div className="text-xs font-semibold text-blue-700">{roleName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {details ? (
                                            <>
                                                <div>Start Date: {details.startDate}</div>
                                                <div className="text-xs">{details.employmentType}</div>
                                            </>
                                        ) : <span className="text-gray-400">Not specified</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-semibold ${docs?.contractUrl ? 'text-green-600' : 'text-red-400'}`}>Contract</span>
                                            <span className={`text-xs font-semibold ${docs?.idUrl ? 'text-green-600' : 'text-red-400'}`}>ID</span>
                                            <span className={`text-xs font-semibold ${docs?.cvUrl ? 'text-green-600' : 'text-red-400'}`}>CV</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleEditDetails(member.id)} className="font-medium text-blue-600 hover:underline" title="Edit Employment Details">
                                                <BriefcaseIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleManageDocuments(member.id)} className="font-medium text-teal-600 hover:underline" title="Manage Documents">
                                                <FolderIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {staff.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No staff members found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HumanResourcesPage;