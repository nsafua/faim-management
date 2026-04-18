
import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SupportTopic } from './supportData';
import { 
    ChevronDownIcon, 
    BookOpenIcon, 
    EyeIcon, 
    PhotoIcon, 
    InformationCircleIcon 
} from '../icons/DummyIcons';

interface SupportTopicCardProps {
    topic: SupportTopic;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onViewImage: (url: string, title: string) => void;
}

export const SupportTopicCard: React.FC<SupportTopicCardProps> = ({ 
    topic, 
    isExpanded, 
    onToggleExpand, 
    onViewImage 
}) => {
    return (
        <Card className="p-0 overflow-hidden group">
            <div 
                className="p-5 flex items-center justify-between gap-4 cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                        {topic.icon}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">{topic.category}</p>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{topic.title}</h3>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {isExpanded && (
                <div className="px-5 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mt-0 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Text Content Column */}
                            <div className="space-y-6">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg italic border-l-4 border-blue-500">
                                    {topic.description}
                                </p>
                                
                                {topic.steps && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <BookOpenIcon className="w-4 h-4 text-blue-500" />
                                            Operating Steps
                                        </h4>
                                        <div className="space-y-2">
                                            {topic.steps.map((step, idx) => (
                                                <div key={idx} className="flex items-start gap-3 text-sm">
                                                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400 py-0.5">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {topic.glossary && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {topic.glossary.map((item, idx) => (
                                            <div key={idx} className="p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                                                <span className="text-xs font-black text-blue-600 dark:text-blue-400">{item.term}</span>
                                                <p className="text-xs text-gray-500 mt-1">{item.definition}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Screenshot Container Column */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                    <span>Visual Guide Reference</span>
                                    <Badge variant="info" className="text-[9px] px-1.5 py-0">Ref: {topic.id}</Badge>
                                </h4>
                                
                                <div 
                                    className="relative aspect-video rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 group/img overflow-hidden cursor-zoom-in"
                                    onClick={() => topic.screenshotUrl && onViewImage(topic.screenshotUrl, topic.title)}
                                >
                                    {topic.screenshotUrl ? (
                                        <>
                                            <img 
                                                src={topic.screenshotUrl} 
                                                alt={topic.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
                                            />
                                            <div className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/20 transition-colors flex items-center justify-center">
                                                <div className="bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity translate-y-4 group-hover/img:translate-y-0 duration-300">
                                                    <EyeIcon className="w-5 h-5 text-blue-600" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-2">
                                            <PhotoIcon className="w-12 h-12 opacity-20" />
                                            <p className="text-xs font-bold uppercase tracking-tighter">Screenshot not available</p>
                                            <p className="text-[10px] opacity-60">Topic: {topic.title}</p>
                                        </div>
                                    )}
                                    
                                    {/* Screenshot Label Overlay */}
                                    <div className="absolute bottom-2 left-2 right-2">
                                        <div className="bg-gray-900/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                                            <InformationCircleIcon className="w-3.5 h-3.5 text-blue-400" />
                                            Fig {topic.id}: Workflow Visualization
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 italic text-center">Click image to expand for full-screen view</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button className="text-[10px] font-black uppercase text-gray-400 hover:text-blue-600 tracking-tighter">Copy Link</button>
                            <span className="text-gray-200">|</span>
                            <button className="text-[10px] font-black uppercase text-gray-400 hover:text-blue-600 tracking-tighter">Report Issue</button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};
