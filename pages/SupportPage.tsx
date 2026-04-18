
import React, { useState, useMemo } from 'react';
import { QuestionMarkCircleIcon, InformationCircleIcon } from '../components/icons/DummyIcons';
import { SUPPORT_TOPICS } from '../components/support/supportData';
import { SupportSearchBar } from '../components/support/SupportSearchBar';
import { SupportTopicCard } from '../components/support/SupportTopicCard';
import { ImageLightbox } from '../components/support/ImageLightbox';
import { ContactSupportBar } from '../components/support/ContactSupportBar';

const SupportPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<{ url: string, title: string } | null>(null);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(SUPPORT_TOPICS.map(t => t.category)));
        return ['All', ...cats];
    }, []);

    const filteredTopics = useMemo(() => {
        return SUPPORT_TOPICS.filter(topic => {
            const matchesSearch = 
                topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                topic.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === 'All' || topic.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, filterCategory]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Support & Documentation</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Interactive User Manual and System Guidelines</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800">
                    <QuestionMarkCircleIcon className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Help Center</span>
                </div>
            </div>

            <SupportSearchBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                categories={categories}
            />

            <div className="grid grid-cols-1 gap-4">
                {filteredTopics.length > 0 ? (
                    filteredTopics.map(topic => (
                        <SupportTopicCard 
                            key={topic.id}
                            topic={topic}
                            isExpanded={expandedTopic === topic.id}
                            onToggleExpand={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                            onViewImage={(url, title) => setLightboxImage({ url, title })}
                        />
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <InformationCircleIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">No documentation found for your search query.</p>
                    </div>
                )}
            </div>

            <ContactSupportBar />

            <ImageLightbox 
                image={lightboxImage} 
                onClose={() => setLightboxImage(null)} 
            />

            <style>{`
                .scrollbar-thin::-webkit-scrollbar { width: 6px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; }
            `}</style>
        </div>
    );
};

export default SupportPage;
