
import React from 'react';
import { XMarkIcon, PhotoIcon } from '../icons/DummyIcons';

interface ImageLightboxProps {
    image: { url: string; title: string } | null;
    onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ image, onClose }) => {
    if (!image) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-slate-950/95 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="absolute top-6 right-6 flex gap-4">
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-xl transition-all border border-white/20 group"
                >
                    <XMarkIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            <div className="absolute top-6 left-6 text-white max-w-lg">
                <h2 className="text-xl font-black uppercase tracking-tight">{image.title}</h2>
                <p className="text-xs text-white/60 mt-1 uppercase tracking-widest font-bold">System Workflow Visualization</p>
            </div>

            <div className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center group/viewer">
                <img 
                    src={image.url} 
                    alt={image.title} 
                    className="w-full h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500" 
                />
                
                {/* Interactive UI for Lightbox */}
                <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-6">
                    <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20 backdrop-blur-xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-3">
                        <PhotoIcon className="w-4 h-4 text-blue-400" />
                        Interactive User Manual Visual Reference
                    </div>
                </div>
            </div>
        </div>
    );
};
