
import React, { ChangeEvent } from 'react';
import { FormData } from './types';
import { SmartInputField, SmartSelectField } from './ClientFormFields';
import { FormSection } from './FormSection';
import { PhoneInput } from '../ui/PhoneInput';
import { EmailInput } from '../ui/EmailInput';

interface Step1PersonalDetailsProps {
    formData: FormData;
    touched: Partial<Record<keyof FormData, boolean>>;
    errors: Partial<Record<keyof FormData, string>>;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handlePhoneChange: (field: keyof FormData) => (val: string) => void;
    handlePhotoChange: (e: ChangeEvent<HTMLInputElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    photoPreview: string | null;
    photoFile: File | null;
}

export const Step1PersonalDetails: React.FC<Step1PersonalDetailsProps> = ({
    formData, touched, errors, handleChange, handleBlur, handlePhoneChange, handlePhotoChange, setFormData, photoPreview, photoFile
}) => {
    const isGroup = (formData as any).clientType === 'Corporate/Group';

    return (
        <div className="animate-in fade-in duration-300">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Profile Identity</h3>
                    
                    {/* NEW: Client Type Switcher */}
                    <div className="mt-4 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex max-w-xs">
                        <button 
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, clientType: 'Individual' } as any))}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${!isGroup ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'}`}
                        >
                            Individual
                        </button>
                        <button 
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, clientType: 'Corporate/Group' } as any))}
                            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${isGroup ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'}`}
                        >
                            Corporate/Group
                        </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <SmartInputField 
                            id="surname" 
                            label={isGroup ? "Company/Group Name" : "Surname"} 
                            value={formData.surname} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            required 
                            error={touched.surname ? errors.surname : undefined} 
                            isTouched={touched.surname} 
                        />
                        <SmartInputField 
                            id="otherNames" 
                            label={isGroup ? "Company Contact Person" : "Other Names"} 
                            value={formData.otherNames} 
                            onChange={handleChange} 
                            onBlur={handleBlur} 
                            required 
                            error={touched.otherNames ? errors.otherNames : undefined} 
                            isTouched={touched.otherNames}
                        />
                        
                        {!isGroup && (
                            <>
                                <SmartInputField id="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange} onBlur={handleBlur} error={touched.dateOfBirth ? errors.dateOfBirth : undefined} isTouched={touched.dateOfBirth} />
                                <SmartSelectField id="gender" label="Gender" value={formData.gender} onChange={handleChange} onBlur={handleBlur} error={touched.gender ? errors.gender : undefined} isTouched={touched.gender}>
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </SmartSelectField>
                            </>
                        )}

                        <div className="sm:col-span-2">
                            <SmartInputField id="currentAddress" label={isGroup ? "Business Address" : "Current Address"} value={formData.currentAddress} onChange={handleChange} onBlur={handleBlur} required error={touched.currentAddress ? errors.currentAddress : undefined} isTouched={touched.currentAddress} />
                        </div>
                        
                        <PhoneInput id="telephone" name="telephone" label={isGroup ? "Company Telephone" : "Telephone"} value={formData.telephone} onChange={handlePhoneChange('telephone')} required error={touched.telephone ? errors.telephone : undefined} />
                        <EmailInput id="email" name="email" label={isGroup ? "Company Email" : "Email Address"} value={formData.email} onChange={(val) => setFormData(prev => ({...prev, email: val}))} error={touched.email ? errors.email : undefined} />
                    </div>
                </div>

                {!isGroup && (
                    <div className="sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Passport-sized Photo</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Client" className="mx-auto h-24 w-24 object-cover rounded-md" />
                                ) : (
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                                )}
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                    <label htmlFor="photo-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>{photoFile ? 'Change photo' : 'Upload a file'}</span>
                                        <input id="photo-upload" name="photo" type="file" className="sr-only" onChange={handlePhotoChange} accept=".jpg,.jpeg,.png" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
           </div>

           {isGroup && (
               <FormSection title="Group Tracking Configuration">
                   <SmartSelectField 
                        id="paymentMethod" 
                        label="Group Payment Mode*" 
                        value={(formData as any).paymentTrackingMode || 'Group Ledger Tracking'} 
                        onChange={(e) => setFormData(p => ({ ...p, paymentTrackingMode: e.target.value } as any))}
                        required
                    >
                       <option>Group Ledger Tracking</option>
                       <option>Individual Member Tracking</option>
                       <option>Mixed (Shared & Individual)</option>
                   </SmartSelectField>
                   <SmartInputField 
                        id="numberOfPlots" 
                        label="Total Plot Entitlement*" 
                        type="number" 
                        value={formData.numberOfPlots} 
                        onChange={handleChange} 
                        required 
                    />
               </FormSection>
           )}

           {!isGroup && (
               <FormSection title="Professional Information">
                   <SmartInputField id="placeOfWork" label="Place of Work" value={formData.placeOfWork} onChange={handleChange} onBlur={handleBlur} error={touched.placeOfWork ? errors.placeOfWork : undefined} isTouched={touched.placeOfWork}/>
                   <SmartInputField id="profession" label="Profession" value={formData.profession} onChange={handleChange} onBlur={handleBlur} error={touched.profession ? errors.profession : undefined} isTouched={touched.profession}/>
                   <SmartInputField id="position" label="Position/Rank" value={formData.position} onChange={handleChange} onBlur={handleBlur} error={touched.position ? errors.position : undefined} isTouched={touched.position}/>
               </FormSection>
           )}

           {!isGroup && (
               <FormSection title="Next of Kin Details">
                   <SmartInputField id="kinName" label="Name" value={formData.kinName} onChange={handleChange} onBlur={handleBlur} required error={touched.kinName ? errors.kinName : undefined} isTouched={touched.kinName}/>
                   <SmartInputField id="kinRelationship" label="Relationship with Buyer" value={formData.kinRelationship} onChange={handleChange} onBlur={handleBlur} error={touched.kinRelationship ? errors.kinRelationship : undefined} isTouched={touched.kinRelationship}/>
                   <PhoneInput id="kinPhone" name="kinPhone" label="Telephone Number" value={formData.kinPhone} onChange={handlePhoneChange('kinPhone')} required error={touched.kinPhone ? errors.kinPhone : undefined} />
                   <EmailInput id="kinEmail" name="kinEmail" label="Email Address" value={formData.kinEmail} onChange={(val) => setFormData(prev => ({...prev, email: val}))} error={touched.kinEmail ? errors.kinEmail : undefined} />
                   <div className="sm:col-span-2">
                        <SmartInputField id="kinAddress" label="Address" value={formData.kinAddress} onChange={handleChange} onBlur={handleBlur} error={touched.kinAddress ? errors.kinAddress : undefined} isTouched={touched.kinAddress}/>
                   </div>
               </FormSection>
           )}

           <FormSection title={isGroup ? "Group Witness Details" : "Witness Details"}>
               <SmartInputField 
                   id="witnessName" 
                   label="Witness Name" 
                   value={formData.witnessName} 
                   onChange={handleChange} 
                   onBlur={handleBlur} 
                   isTouched={touched.witnessName} 
               />
               <PhoneInput 
                   id="witnessPhone" 
                   name="witnessPhone" 
                   label="Witness Phone" 
                   value={formData.witnessPhone} 
                   onChange={handlePhoneChange('witnessPhone')} 
               />
               <div className="sm:col-span-2">
                   <SmartInputField 
                       id="witnessAddress" 
                       label="Witness Address" 
                       value={formData.witnessAddress} 
                       onChange={handleChange} 
                       onBlur={handleBlur} 
                       isTouched={touched.witnessAddress} 
                   />
               </div>
           </FormSection>
        </div>
    );
};
