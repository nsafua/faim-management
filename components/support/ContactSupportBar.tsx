
import React from 'react';
import { ChatBubbleLeftEllipsisIcon } from '../icons/DummyIcons';

export const ContactSupportBar: React.FC = () => {
    return (
        <div className="mt-8 p-6 bg-blue-600 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-600/20">
            <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-full">
                    <ChatBubbleLeftEllipsisIcon className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Need Technical Assistance?</h3>
                    <p className="text-blue-100 text-sm">Our system administrators are available for direct support.</p>
                </div>
            </div>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-colors">
                Contact Admin
            </button>
        </div>
    );
};
